import { env, isUpstashEnabled } from "@/lib/env";

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
};

async function upstashRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  const redisKey = `ratelimit:${key}`;
  const now = Date.now();
  const windowStart = now - windowMs;
  const headers = {
    Authorization: `Bearer ${env.upstashRedisRestToken}`,
    "Content-Type": "application/json"
  };
  const pipeline = [
    ["ZREMRANGEBYSCORE", redisKey, "0", String(windowStart)],
    ["ZADD", redisKey, String(now), `${now}-${Math.random()}`],
    ["ZCARD", redisKey],
    ["PEXPIRE", redisKey, String(windowMs)]
  ];

  try {
    const response = await fetch(`${env.upstashRedisRestUrl}/pipeline`, {
      method: "POST",
      headers,
      body: JSON.stringify(pipeline)
    });

    if (!response.ok) {
      return { allowed: true, remaining: maxRequests };
    }

    const results = (await response.json()) as Array<{ result?: number }>;
    const count = results[2]?.result ?? 0;
    return {
      allowed: count <= maxRequests,
      remaining: Math.max(0, maxRequests - count)
    };
  } catch {
    return { allowed: true, remaining: maxRequests };
  }
}

const memoryStore = new Map<string, { count: number; resetAt: number }>();

function memoryRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  entry.count += 1;

  return {
    allowed: entry.count <= maxRequests,
    remaining: Math.max(0, maxRequests - entry.count)
  };
}

export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  if (isUpstashEnabled()) {
    return upstashRateLimit(key, maxRequests, windowMs);
  }

  return memoryRateLimit(key, maxRequests, windowMs);
}

const TEN_MINUTES = 10 * 60 * 1000;

export function checkRsvpLimit(invitationId: string, ip: string) {
  return checkRateLimit(`rsvp:${invitationId}:${ip}`, 5, TEN_MINUTES);
}

export function checkGuestbookLimit(invitationId: string, ip: string) {
  return checkRateLimit(`guestbook:${invitationId}:${ip}`, 10, TEN_MINUTES);
}

export function checkVisitLimit(invitationId: string, ip: string) {
  return checkRateLimit(`visit:${invitationId}:${ip}`, 30, TEN_MINUTES);
}
