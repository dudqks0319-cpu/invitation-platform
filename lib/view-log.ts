import type { SupabaseClient } from "@supabase/supabase-js";
import { consumeRateLimits, getClientIdentifier, getPrivacySafeIdentifier } from "@/lib/rate-limit";
import { hashPublicWrite } from "@/lib/supabase/public-write";
import type { Database } from "@/lib/supabase/types";

export type ViewLogIdentityKind = "authenticated" | "anonymous_session" | "ip";
export type ViewLogIdentity = {
  kind: ViewLogIdentityKind;
  key: string;
};

type VerifiedUser = {
  id: string;
  is_anonymous?: boolean;
};

export type ViewLogResult =
  | "inserted"
  | "replayed"
  | "collision"
  | "not_found"
  | "quota_denied"
  | "dependency_unavailable"
  | "concurrency_limited"
  | "disabled"
  | "invalid"
  | "stale";

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const VIEW_WINDOW_MS = 30 * MINUTE_MS;
const MAX_TICKET_AGE_MS = 60_000;
const MAX_FUTURE_SKEW_MS = 5_000;
const DEFAULT_TIMEOUT_MS = 750;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ViewLogConcurrencyGate {
  private active = 0;

  constructor(private readonly maximum: number) {
    if (!Number.isInteger(maximum) || maximum < 1 || maximum > 64) {
      throw new Error("view log concurrency maximum must be between 1 and 64");
    }
  }

  tryAcquire() {
    if (this.active >= this.maximum) return null;
    this.active += 1;
    let released = false;
    return () => {
      if (!released) {
        released = true;
        this.active -= 1;
      }
    };
  }
}

const defaultConcurrencyGate = new ViewLogConcurrencyGate(8);

export function createViewLogIssuedAt() {
  return Date.now();
}

export function resolveViewLogIdentity(request: Request, user?: VerifiedUser | null): ViewLogIdentity | null {
  if (user) {
    const kind = user.is_anonymous ? "anonymous_session" : "authenticated";
    const key = getPrivacySafeIdentifier(`view_${kind}`, user.id);
    return key ? { kind, key } : null;
  }

  const key = getClientIdentifier(request);
  return key ? { kind: "ip", key } : null;
}

async function boundedResult<T>(value: PromiseLike<T>, timeoutMs: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve(value),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error("view_log_timeout")), timeoutMs);
      })
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function withViewLogTimeout<T>(value: PromiseLike<T>, timeoutMs = DEFAULT_TIMEOUT_MS) {
  return boundedResult(value, timeoutMs);
}

export async function recordInvitationView({
  admin,
  invitationId,
  identity,
  issuedAt,
  now = Date.now(),
  timeoutMs = DEFAULT_TIMEOUT_MS,
  gate = defaultConcurrencyGate
}: {
  admin: SupabaseClient<Database>;
  invitationId: string;
  identity: ViewLogIdentity;
  issuedAt: number;
  now?: number;
  timeoutMs?: number;
  gate?: ViewLogConcurrencyGate;
}): Promise<ViewLogResult> {
  if (process.env.VIEW_LOGGING_ENABLED !== "true") {
    return "disabled";
  }

  if (
    typeof invitationId !== "string" ||
    !UUID_PATTERN.test(invitationId) ||
    !["authenticated", "anonymous_session", "ip"].includes(identity?.kind) ||
    !/^v1:[a-f0-9]{64}$/.test(identity?.key ?? "") ||
    !Number.isFinite(issuedAt) ||
    !Number.isFinite(now) ||
    !Number.isInteger(timeoutMs) ||
    timeoutMs < 1 ||
    timeoutMs > 10_000
  ) {
    return "invalid";
  }

  if (issuedAt < now - MAX_TICKET_AGE_MS || issuedAt > now + MAX_FUTURE_SKEW_MS) {
    return "stale";
  }

  const release = gate.tryAcquire();
  if (!release) return "concurrency_limited";

  try {
    const quota = await consumeRateLimits({
      admin,
      timeoutMs,
      policies: [
        { key: `view_log:identity:${identity.key}:burst`, limit: 3, windowMs: MINUTE_MS },
        { key: `view_log:identity:${identity.key}:rolling`, limit: 30, windowMs: HOUR_MS },
        { key: `view_log:identity:${identity.key}:daily`, limit: 100, windowMs: DAY_MS },
        { key: `view_log:invitation:${invitationId}:daily`, limit: 1000, windowMs: DAY_MS },
        { key: "view_log:global:daily", limit: 1000, windowMs: DAY_MS }
      ]
    });

    if (!quota.ok) return "dependency_unavailable";
    if (!quota.allowed) return "quota_denied";

    const windowStart = Math.floor(issuedAt / VIEW_WINDOW_MS) * VIEW_WINDOW_MS;
    const idempotencyHash = hashPublicWrite(
      "view-log",
      invitationId,
      identity.key,
      String(windowStart)
    );
    const requestHash = hashPublicWrite(
      "view-log-request",
      invitationId,
      identity.kind,
      identity.key,
      String(windowStart)
    );
    const query = admin.rpc("record_invitation_view", {
      p_invitation_id: invitationId,
      p_visitor_key: identity.key,
      p_identity_kind: identity.kind,
      p_idempotency_key_hash: idempotencyHash,
      p_request_hash: requestHash,
      p_issued_at: new Date(issuedAt).toISOString()
    });
    const controller = new AbortController();
    const executable = typeof (query as { abortSignal?: unknown }).abortSignal === "function"
      ? (query as unknown as { abortSignal(signal: AbortSignal): PromiseLike<unknown> }).abortSignal(controller.signal)
      : query;

    let result: { data: unknown; error: unknown };
    try {
      result = await boundedResult(executable, timeoutMs) as { data: unknown; error: unknown };
    } catch {
      controller.abort();
      return "dependency_unavailable";
    }
    if (result.error) return "dependency_unavailable";

    const row = Array.isArray(result.data) ? result.data[0] : result.data;
    const outcome = row && typeof row === "object" && "outcome" in row
      ? (row as { outcome?: unknown }).outcome
      : null;
    return ["inserted", "replayed", "collision", "not_found"].includes(String(outcome))
      ? outcome as ViewLogResult
      : "dependency_unavailable";
  } catch {
    return "dependency_unavailable";
  } finally {
    release();
  }
}
