import type { SupabaseClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
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
  windowMs
}: ConsumeRateLimitArgs): Promise<ConsumeRateLimitResult> {
  const { data, error } = await admin.rpc("consume_rate_limit", {
    bucket_key: key,
    max_hits: limit,
    window_seconds: Math.ceil(windowMs / 1000)
  });

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

  return {
    ok: true,
    allowed: row.allowed,
    remaining: row.remaining,
    resetAt: Date.parse(row.reset_at)
  };
}

export function getClientIdentifier(request: Request) {
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anonymous"
  );
}

export function hashClientIdentifier(identifier: string) {
  return createHash("sha256").update(`invitehub-public-client:${identifier}`).digest("hex");
}
