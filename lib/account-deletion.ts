import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

const TICKET_VERSION = "v1";
const TICKET_KEY_ENV = "ACCOUNT_DELETE_TICKET_KEY_V1";
const RECENT_AUTH_MS = 5 * 60 * 1000;
const FUTURE_SKEW_MS = 5 * 1000;
const MAX_TICKET_LENGTH = 2048;
const MAX_STAGE_COUNT = 4;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HASH_PATTERN = /^v1:[0-9a-f]{64}$/;

export type AccountDeletionIdentity = {
  userId: string;
  sessionId: string;
};

type AccountDeletionTicketPayload = {
  v: 1;
  sub: string;
  sid: string;
  jti: string;
  iat: number;
  exp: number;
};

type AccountDeletionStage = "storage" | "provider" | "auth" | "finalize";

type AccountDeletionRpcClient = Pick<SupabaseClient<Database>, "rpc">;

function ticketKey() {
  const key = process.env[TICKET_KEY_ENV]?.trim();
  if (!key || Buffer.byteLength(key, "utf8") < 32 || Buffer.byteLength(key, "utf8") > 256) {
    return null;
  }
  return key;
}

function hmac(key: string, namespace: string, value: string) {
  return createHmac("sha256", key)
    .update(namespace)
    .update("\0")
    .update(value)
    .digest("hex");
}

function safeHexEqual(left: string, right: string) {
  if (!/^[0-9a-f]{64}$/.test(left) || !/^[0-9a-f]{64}$/.test(right)) return false;
  return timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
}

export function hashAccountDeletionValue(namespace: string, value: string) {
  const key = ticketKey();
  if (!key || !/^[a-z][a-z0-9_-]{0,31}$/.test(namespace) || value.length < 1 || value.length > 4096) {
    return null;
  }
  return `${TICKET_VERSION}:${hmac(key, namespace, value)}`;
}

export function validateRecentAuthClaims(
  claims: Record<string, unknown> | null | undefined,
  now = Date.now()
): AccountDeletionIdentity | null {
  if (!claims || !Number.isFinite(now)) return null;
  const userId = claims.sub;
  const sessionId = claims.session_id;
  if (
    typeof userId !== "string" || !UUID_PATTERN.test(userId) ||
    typeof sessionId !== "string" || !UUID_PATTERN.test(sessionId) ||
    claims.is_anonymous === true ||
    typeof claims.exp !== "number" || claims.exp * 1000 <= now
  ) {
    return null;
  }

  if (!Array.isArray(claims.amr)) return null;
  const recent = claims.amr.some((entry) => {
    if (!entry || typeof entry !== "object") return false;
    const method = (entry as { method?: unknown }).method;
    const timestamp = (entry as { timestamp?: unknown }).timestamp;
    if (typeof method !== "string" || method === "anonymous" || typeof timestamp !== "number") {
      return false;
    }
    const authenticatedAt = timestamp * 1000;
    return Number.isFinite(authenticatedAt) &&
      authenticatedAt >= now - RECENT_AUTH_MS &&
      authenticatedAt <= now + FUTURE_SKEW_MS;
  });

  return recent ? { userId, sessionId } : null;
}

export function createAccountDeletionTicket({
  claims,
  now = Date.now(),
  ticketId = randomUUID()
}: {
  claims: Record<string, unknown>;
  now?: number;
  ticketId?: string;
}) {
  const identity = validateRecentAuthClaims(claims, now);
  const key = ticketKey();
  if (!identity || !key || !UUID_PATTERN.test(ticketId)) return null;

  const payload: AccountDeletionTicketPayload = {
    v: 1,
    sub: hmac(key, "account-delete-user", identity.userId),
    sid: hmac(key, "account-delete-session", identity.sessionId),
    jti: ticketId,
    iat: Math.floor(now / 1000),
    exp: Math.floor((now + RECENT_AUTH_MS) / 1000)
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = hmac(key, "account-delete-ticket", encoded);
  return {
    ticket: `${TICKET_VERSION}.${encoded}.${signature}`,
    requestId: ticketId
  };
}

export function verifyAccountDeletionTicket({
  ticket,
  userId,
  sessionId,
  now = Date.now()
}: {
  ticket: string;
  userId: string;
  sessionId: string;
  now?: number;
}) {
  const key = ticketKey();
  if (
    !key || typeof ticket !== "string" || ticket.length < 32 || ticket.length > MAX_TICKET_LENGTH ||
    !UUID_PATTERN.test(userId) || !UUID_PATTERN.test(sessionId) || !Number.isFinite(now)
  ) {
    return null;
  }

  const [version, encoded, signature, extra] = ticket.split(".");
  if (version !== TICKET_VERSION || !encoded || !signature || extra) return null;
  const expectedSignature = hmac(key, "account-delete-ticket", encoded);
  if (!safeHexEqual(signature, expectedSignature)) return null;

  let payload: AccountDeletionTicketPayload;
  try {
    payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as AccountDeletionTicketPayload;
  } catch {
    return null;
  }

  if (
    payload.v !== 1 || !UUID_PATTERN.test(payload.jti) ||
    typeof payload.iat !== "number" || typeof payload.exp !== "number" ||
    payload.iat * 1000 > now + FUTURE_SKEW_MS ||
    payload.exp * 1000 < now ||
    payload.exp - payload.iat > RECENT_AUTH_MS / 1000 ||
    !safeHexEqual(payload.sub, hmac(key, "account-delete-user", userId)) ||
    !safeHexEqual(payload.sid, hmac(key, "account-delete-session", sessionId))
  ) {
    return null;
  }

  return { requestId: payload.jti, issuedAt: payload.iat * 1000, expiresAt: payload.exp * 1000 };
}

async function bounded<T>(value: PromiseLike<T>, timeoutMs: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve(value),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error("account_delete_timeout")), timeoutMs);
      })
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function withAccountDeletionTimeout<T>(value: PromiseLike<T>, timeoutMs = 1500) {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 10_000) {
    throw new Error("account_delete_timeout_invalid");
  }
  return bounded(value, timeoutMs);
}

export function isAllowedAccountDeletionOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) return false;
  try {
    return new URL(origin).origin === new URL(configured).origin;
  } catch {
    return false;
  }
}

async function rpc(
  admin: AccountDeletionRpcClient,
  name: string,
  args: Record<string, unknown>,
  timeoutMs: number
) {
  const query = (admin.rpc as unknown as (name: string, args: Record<string, unknown>) => PromiseLike<unknown>)(name, args);
  const controller = new AbortController();
  const executable = typeof (query as { abortSignal?: unknown }).abortSignal === "function"
    ? (query as unknown as { abortSignal(signal: AbortSignal): PromiseLike<unknown> }).abortSignal(controller.signal)
    : query;
  try {
    return await bounded(executable, timeoutMs) as { data: unknown; error: unknown };
  } catch {
    controller.abort();
    throw new Error("account_delete_dependency_unavailable");
  }
}

function firstRow(data: unknown) {
  return Array.isArray(data) ? data[0] : data;
}

export async function beginAccountDeletion({
  admin,
  userId,
  subjectHash,
  idempotencyKeyHash,
  ticketHash,
  requestHash,
  exportDisposition,
  ticketIssuedAt,
  timeoutMs = 1500
}: {
  admin: SupabaseClient<Database>;
  userId: string;
  subjectHash: string;
  idempotencyKeyHash: string;
  ticketHash: string;
  requestHash: string;
  exportDisposition: "downloaded" | "skipped";
  ticketIssuedAt: number;
  timeoutMs?: number;
}): Promise<
  | { ok: true; requestId: string | null; outcome: "inserted" | "replayed" | "collision" | "in_progress" | "retention_required"; status: string; stage: string | null }
  | { ok: false }
> {
  if (
    !UUID_PATTERN.test(userId) ||
    ![subjectHash, idempotencyKeyHash, ticketHash, requestHash].every((value) => HASH_PATTERN.test(value)) ||
    !["downloaded", "skipped"].includes(exportDisposition) ||
    !Number.isFinite(ticketIssuedAt)
  ) {
    return { ok: false };
  }
  try {
    const result = await rpc(admin, "begin_account_deletion", {
      p_user_id: userId,
      p_subject_hash: subjectHash,
      p_idempotency_key_hash: idempotencyKeyHash,
      p_reauth_ticket_hash: ticketHash,
      p_request_hash: requestHash,
      p_export_disposition: exportDisposition,
      p_ticket_issued_at: new Date(ticketIssuedAt).toISOString()
    }, timeoutMs);
    if (result.error) return { ok: false };
    const row = firstRow(result.data) as {
      request_id?: unknown;
      outcome?: unknown;
      status?: unknown;
      stage?: unknown;
    } | null;
    if (
      !row || !["inserted", "replayed", "collision", "in_progress", "retention_required"].includes(String(row.outcome)) ||
      (row.request_id !== null && (typeof row.request_id !== "string" || !UUID_PATTERN.test(row.request_id)))
    ) {
      return { ok: false };
    }
    return {
      ok: true,
      requestId: row.request_id as string | null,
      outcome: row.outcome as "inserted" | "replayed" | "collision" | "in_progress" | "retention_required",
      status: typeof row.status === "string" ? row.status : "unknown",
      stage: typeof row.stage === "string" ? row.stage : null
    };
  } catch {
    return { ok: false };
  }
}

export async function isAccountDeletionPending(
  admin: SupabaseClient<Database>,
  userId: string,
  timeoutMs = 750
): Promise<boolean | null> {
  if (!UUID_PATTERN.test(userId)) return null;
  try {
    const result = await rpc(admin, "is_account_deletion_pending", { p_user_id: userId }, timeoutMs);
    if (result.error || typeof result.data !== "boolean") return null;
    return result.data;
  } catch {
    return null;
  }
}

async function recordFailure({
  admin,
  requestId,
  leaseHash,
  errorCode,
  timeoutMs
}: {
  admin: AccountDeletionRpcClient;
  requestId: string;
  leaseHash: string;
  errorCode: "storage_unavailable" | "provider_unavailable" | "auth_unavailable";
  timeoutMs: number;
}) {
  try {
    const result = await rpc(admin, "fail_account_deletion", {
      p_request_id: requestId,
      p_lease_hash: leaseHash,
      p_error_code: errorCode
    }, timeoutMs);
    if (result.error) return { status: "dependency_unavailable" as const };
    const row = firstRow(result.data) as { recorded?: unknown; blocked?: unknown } | null;
    if (!row || row.recorded !== true) return { status: "dependency_unavailable" as const };
    return row.blocked === true
      ? { status: "blocked" as const }
      : { status: "retry_wait" as const };
  } catch {
    return { status: "dependency_unavailable" as const };
  }
}

export async function processAccountDeletionJob({
  admin,
  requestId,
  userId,
  removeStorage,
  cleanupProviders = async () => undefined,
  timeoutMs = 1500
}: {
  admin: SupabaseClient<Database>;
  requestId: string;
  userId: string;
  removeStorage: () => Promise<unknown>;
  cleanupProviders?: () => Promise<unknown>;
  timeoutMs?: number;
}): Promise<
  | { status: "completed" }
  | { status: "retry_wait"; stage: AccountDeletionStage }
  | { status: "blocked"; stage: AccountDeletionStage }
  | { status: "dependency_unavailable" }
> {
  if (
    !UUID_PATTERN.test(requestId) || !UUID_PATTERN.test(userId) ||
    !Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 10_000
  ) {
    return { status: "dependency_unavailable" };
  }

  for (let index = 0; index < MAX_STAGE_COUNT; index += 1) {
    const leaseHash = hashAccountDeletionValue("lease", randomUUID());
    if (!leaseHash || !HASH_PATTERN.test(leaseHash)) return { status: "dependency_unavailable" };

    let claimResult: { data: unknown; error: unknown };
    try {
      claimResult = await rpc(admin, "claim_account_deletion", {
        p_request_id: requestId,
        p_lease_hash: leaseHash
      }, timeoutMs);
    } catch {
      return { status: "dependency_unavailable" };
    }
    if (claimResult.error) return { status: "dependency_unavailable" };
    const claim = firstRow(claimResult.data) as { claimed?: unknown; stage?: unknown } | null;
    if (!claim || claim.claimed !== true || !["storage", "provider", "auth", "finalize"].includes(String(claim.stage))) {
      return { status: "dependency_unavailable" };
    }
    const stage = claim.stage as AccountDeletionStage;

    try {
      if (stage === "storage") {
        await bounded(removeStorage(), timeoutMs);
      } else if (stage === "provider") {
        await bounded(cleanupProviders(), timeoutMs);
      } else if (stage === "auth") {
        const result = await bounded(admin.auth.admin.deleteUser(userId, false), timeoutMs);
        const error = result.error as { code?: string } | null;
        if (error && error.code !== "user_not_found") throw new Error("auth_delete_failed");
      }
    } catch {
      const errorCode = stage === "storage"
        ? "storage_unavailable"
        : stage === "provider"
          ? "provider_unavailable"
          : "auth_unavailable";
      const failure = await recordFailure({ admin, requestId, leaseHash, errorCode, timeoutMs });
      return failure.status === "dependency_unavailable"
        ? failure
        : { status: failure.status, stage };
    }

    let advanceResult: { data: unknown; error: unknown };
    try {
      advanceResult = await rpc(admin, "advance_account_deletion", {
        p_request_id: requestId,
        p_lease_hash: leaseHash,
        p_completed_stage: stage
      }, timeoutMs);
    } catch {
      return { status: "dependency_unavailable" };
    }
    const advanced = firstRow(advanceResult.data) as { advanced?: unknown } | null;
    if (advanceResult.error || !advanced || advanced.advanced !== true) {
      return { status: "dependency_unavailable" };
    }
    if (stage === "finalize") return { status: "completed" };
  }

  return { status: "dependency_unavailable" };
}

export const accountDeletionLimits = {
  recentAuthMs: RECENT_AUTH_MS,
  maxTicketLength: MAX_TICKET_LENGTH,
  maxStagesPerExecution: MAX_STAGE_COUNT
} as const;
