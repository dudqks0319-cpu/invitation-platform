type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitEntry>();

function now() {
  return Date.now();
}

export function consumeRateLimit(key: string, limit: number, windowMs: number) {
  const timestamp = now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= timestamp) {
    const nextEntry = {
      count: 1,
      resetAt: timestamp + windowMs
    };
    buckets.set(key, nextEntry);
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: nextEntry.resetAt
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetAt
    };
  }

  current.count += 1;
  buckets.set(key, current);

  return {
    allowed: true,
    remaining: Math.max(limit - current.count, 0),
    resetAt: current.resetAt
  };
}

export function getClientIdentifier(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "anonymous"
  );
}
