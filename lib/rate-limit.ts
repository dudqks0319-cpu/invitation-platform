import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import type { SupabaseClient } from "@supabase/supabase-js";
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

export type RateLimitPolicy = Pick<ConsumeRateLimitArgs, "key" | "limit" | "windowMs"> & {
  name: string;
};

type ConsumeRateLimitPoliciesArgs = {
  admin: SupabaseClient<Database>;
  policies: RateLimitPolicy[];
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

export type ConsumeRateLimitPoliciesResult =
  | (ConsumeRateLimitSuccess & { policy: string })
  | (ConsumeRateLimitFailure & { policy: string });

type FingerprintOptions = {
  secret?: string;
  now?: Date;
  productionLike?: boolean;
};

type RequestHeaderSource = {
  headers: {
    get(name: string): string | null;
  };
};

type FingerprintResult =
  | { ok: true; fingerprint: string }
  | { ok: false; message: "rate_limit_fingerprint_unavailable" | "rate_limit_client_unverifiable" };

type IdempotencyHashResult =
  | { ok: true; digest: string }
  | { ok: false; message: "rate_limit_fingerprint_unavailable" | "rate_limit_idempotency_invalid" };

const FINGERPRINT_SECRET_ENV = "RATE_LIMIT_FINGERPRINT_SECRET";
const LOCAL_ONLY_FINGERPRINT_SECRET = "invitehub-local-only-rate-limit-fingerprint-key-v1";
const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{14,126}[A-Za-z0-9]$/;

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
    return { ok: false, message: "rate_limit_timeout_invalid" };
  }

  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let rpcResult: unknown;

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
    return { ok: false, message: "rate_limit_backend_unavailable" };
  } finally {
    if (timeout) clearTimeout(timeout);
  }

  const { data, error } = rpcResult as { data: unknown; error: unknown };
  if (error) {
    return { ok: false, message: "rate_limit_backend_unavailable" };
  }

  const row = normalizeRateLimitRow(data);
  if (!row) {
    return { ok: false, message: "rate_limit_backend_invalid_payload" };
  }

  const resetAt = Date.parse(row.reset_at);
  if (!Number.isFinite(resetAt)) {
    return { ok: false, message: "rate_limit_backend_invalid_payload" };
  }

  return {
    ok: true,
    allowed: row.allowed,
    remaining: row.remaining,
    resetAt
  };
}

export async function consumeRateLimitPolicies({
  admin,
  policies,
  timeoutMs
}: ConsumeRateLimitPoliciesArgs): Promise<ConsumeRateLimitPoliciesResult> {
  if (policies.length === 0) {
    return { ok: false, message: "rate_limit_policies_missing", policy: "none" };
  }

  let lastAllowed: ConsumeRateLimitSuccess | null = null;
  for (const policy of policies) {
    const result = await consumeRateLimit({ admin, ...policy, timeoutMs });
    if (!result.ok) {
      return { ...result, policy: policy.name };
    }
    if (!result.allowed) {
      return { ...result, policy: policy.name };
    }
    lastAllowed = result;
  }

  return { ...(lastAllowed as ConsumeRateLimitSuccess), policy: policies.at(-1)?.name ?? "none" };
}

function isProductionLikeEnvironment() {
  const vercelEnv = (process.env.VERCEL_ENV ?? "").trim().toLowerCase();
  return process.env.NODE_ENV === "production" || vercelEnv === "preview" || vercelEnv === "production";
}

function resolveFingerprintSecret(options: FingerprintOptions) {
  const productionLike = options.productionLike ?? isProductionLikeEnvironment();
  const configuredSecret = options.secret ?? process.env[FINGERPRINT_SECRET_ENV];
  const secret = configuredSecret?.trim() || (productionLike ? "" : LOCAL_ONLY_FINGERPRINT_SECRET);
  const secretBytes = Buffer.byteLength(secret, "utf8");

  if (secretBytes < 32 || secretBytes > 256) {
    return null;
  }
  return secret;
}

function normalizedTrustedClientIp(request: RequestHeaderSource, productionLike: boolean) {
  const trustedCandidates = [
    request.headers.get("cf-connecting-ip"),
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0],
    request.headers.get("x-real-ip")
  ]
    .filter((value): value is string => value !== null && value !== undefined)
    .map((value) => value.trim().toLowerCase());

  if (trustedCandidates.some((value) => isIP(value) === 0) || new Set(trustedCandidates).size > 1) {
    return null;
  }
  if (trustedCandidates[0]) {
    return trustedCandidates[0];
  }

  if (!productionLike) {
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim().toLowerCase();
    if (forwarded && isIP(forwarded) !== 0) {
      return forwarded;
    }
  }

  return null;
}

export function getClientFingerprint(
  request: RequestHeaderSource,
  options: FingerprintOptions = {}
): FingerprintResult {
  const productionLike = options.productionLike ?? isProductionLikeEnvironment();
  const secret = resolveFingerprintSecret({ ...options, productionLike });
  if (!secret) {
    return { ok: false, message: "rate_limit_fingerprint_unavailable" };
  }

  const clientIp = normalizedTrustedClientIp(request, productionLike);
  if (!clientIp) {
    return { ok: false, message: "rate_limit_client_unverifiable" };
  }

  const now = options.now ?? new Date();
  const daySalt = now.toISOString().slice(0, 10).replaceAll("-", "");
  const digest = createHmac("sha256", secret)
    .update("client-ip-fingerprint:v1\0")
    .update(daySalt)
    .update("\0")
    .update(clientIp)
    .digest("hex")
    .slice(0, 32);

  return { ok: true, fingerprint: `fp1_${daySalt}_${digest}` };
}

export function getClientIdentifier(request: RequestHeaderSource) {
  const result = getClientFingerprint(request);
  return result.ok ? result.fingerprint : null;
}

export function hashRateLimitIdempotencyKey(
  value: string | null,
  options: FingerprintOptions = {}
): IdempotencyHashResult {
  const normalized = value?.trim() ?? "";
  if (!IDEMPOTENCY_KEY_PATTERN.test(normalized)) {
    return { ok: false, message: "rate_limit_idempotency_invalid" };
  }

  const secret = resolveFingerprintSecret(options);
  if (!secret) {
    return { ok: false, message: "rate_limit_fingerprint_unavailable" };
  }

  const digest = createHmac("sha256", secret)
    .update("guest-publish-idempotency:v1\0")
    .update(normalized)
    .digest("hex");

  return { ok: true, digest };
}
