export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "",
  kakaoPayCid: process.env.KAKAOPAY_CID ?? "",
  kakaoPaySecretKey: process.env.KAKAOPAY_SECRET_KEY ?? "",
  upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL ?? "",
  upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
  ipHashSalt: process.env.IP_HASH_SALT ?? "default-salt"
};

export const legacyEnv = {
  ...env,
  serviceRoleKey: env.supabaseServiceRoleKey
};

export function isSupabaseEnabled(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function isKakaoPayEnabled(): boolean {
  return Boolean(env.kakaoPayCid && env.kakaoPaySecretKey);
}

export function isUpstashEnabled(): boolean {
  return Boolean(env.upstashRedisRestUrl && env.upstashRedisRestToken);
}
