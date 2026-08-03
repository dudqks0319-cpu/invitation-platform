import type { SupabaseClient } from "@supabase/supabase-js";
import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import type { Database } from "@/lib/supabase/types";

type RateLimitRow = {
  allowed: boolean;
  remaining: number;
  reset_at: string;
};

type ConsumeRateLimitArgs = {
  admin: SupabaseClient<Database>;
  key: string;
  limit: number;
  windowMs: number;
  timeoutMs?: number;
};

type ConsumeRateLimitsArgs = {
  admin: SupabaseClient<Database>;
  policies: Array<Pick<ConsumeRateLimitArgs, "key" | "limit" | "windowMs">>;
  timeoutMs?: number;
};

type ConsumeRateLimitSuccess = {
  ok: true;
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

type ConsumeRateLimitFailure = {
  ok: false;
  message: string;
};

export type ConsumeRateLimitResult = ConsumeRateLimitSuccess | ConsumeRateLimitFailure;

function normalizeRateLimitRow(data: unknown): RateLimitRow | null {
  const row = Array.isArray(data) ? data[0] : data;

  if (!row || typeof row !== "object") {
    return null;
  }

  const candidate = row as Partial<RateLimitRow>;

  if (
    typeof candidate.allowed !== "boolean" ||
    typeof candidate.remaining !== "number" ||
    typeof candidate.reset_at !== "string"
  ) {
    return null;
  }

  return {
    allowed: candidate.allowed,
    remaining: candidate.remaining,
    reset_at: candidate.reset_at
  };
}

export async function consumeRateLimit({
  admin,
  key,
  limit,
  windowMs,
  timeoutMs = 1500
}: ConsumeRateLimitArgs): Promise<ConsumeRateLimitResult> {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 10_000) {
    return {
      ok: false,
      message: "rate_limit_timeout_invalid"
    };
  }

  let rpcResult;
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const query = admin.rpc("consume_rate_limit", {
      bucket_key: key,
      max_hits: limit,
      window_seconds: Math.ceil(windowMs / 1000)
    });
    const abortableQuery = typeof (query as { abortSignal?: unknown }).abortSignal === "function"
      ? (query as unknown as { abortSignal(signal: AbortSignal): PromiseLike<unknown> }).abortSignal(controller.signal)
      : query;
    rpcResult = await Promise.race([
      Promise.resolve(abortableQuery),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => {
          controller.abort();
          reject(new Error("rate_limit_timeout"));
        }, timeoutMs);
      })
    ]);
  } catch {
    return {
      ok: false,
      message: "rate_limit_backend_unavailable"
    };
  } finally {
    if (timeout) clearTimeout(timeout);
  }

  const { data, error } = rpcResult as { data: unknown; error: unknown };

  if (error) {
    return {
      ok: false,
      message: "rate_limit_backend_unavailable"
    };
  }

  const row = normalizeRateLimitRow(data);
  if (!row) {
    return {
      ok: false,
      message: "rate_limit_backend_invalid_payload"
    };
  }

  const resetAt = Date.parse(row.reset_at);
  if (!Number.isFinite(resetAt)) {
    return {
      ok: false,
      message: "rate_limit_backend_invalid_payload"
    };
  }

  return {
    ok: true,
    allowed: row.allowed,
    remaining: row.remaining,
    resetAt
  };
}

export async function consumeRateLimits({
  admin,
  policies,
  timeoutMs
}: ConsumeRateLimitsArgs): Promise<ConsumeRateLimitResult> {
  if (policies.length === 0) {
    return {
      ok: false,
      message: "rate_limit_policies_missing"
    };
  }

  let mostRestrictive: ConsumeRateLimitSuccess | null = null;
  for (const policy of policies) {
    const result = await consumeRateLimit({ admin, ...policy, timeoutMs });
    if (!result.ok || !result.allowed) return result;
    if (!mostRestrictive || result.remaining < mostRestrictive.remaining) {
      mostRestrictive = result;
    }
  }

  return mostRestrictive ?? {
    ok: false,
    message: "rate_limit_policies_missing"
  };
}

const FINGERPRINT_VERSION = "v1";
const FINGERPRINT_KEY_ENV = "RATE_LIMIT_FINGERPRINT_KEY_V1";

function trustedClientIp(request: Request): string | null {
  const candidates = [
    request.headers.get("cf-connecting-ip"),
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0],
    request.headers.get("x-real-ip")
  ]
    .filter((value): value is string => value !== null && value !== undefined)
    .map((value) => value.trim());

  if (candidates.some((value) => isIP(value) === 0)) {
    return null;
  }

  if (new Set(candidates).size > 1) {
    return null;
  }

  return candidates[0] ?? null;
}

export function getClientIdentifier(request: Request): string | null {
  const key = process.env[FINGERPRINT_KEY_ENV]?.trim();
  if (!key || Buffer.byteLength(key, "utf8") < 32 || Buffer.byteLength(key, "utf8") > 256) {
    return null;
  }

  const clientIp = trustedClientIp(request);
  if (clientIp === null) {
    return null;
  }

  const digest = createHmac("sha256", key)
    .update(clientIp)
    .digest("hex");

  return `${FINGERPRINT_VERSION}:${digest}`;
}

export function getPrivacySafeIdentifier(namespace: string, subject: string): string | null {
  if (!/^[a-z][a-z0-9_-]{0,31}$/.test(namespace) || subject.length < 1 || subject.length > 256) {
    return null;
  }

  const key = process.env[FINGERPRINT_KEY_ENV]?.trim();
  if (!key || Buffer.byteLength(key, "utf8") < 32 || Buffer.byteLength(key, "utf8") > 256) {
    return null;
  }

  const digest = createHmac("sha256", key)
    .update(namespace)
    .update("\0")
    .update(subject)
    .digest("hex");

  return `${FINGERPRINT_VERSION}:${digest}`;
}
