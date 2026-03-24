export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "",
  upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL ?? "",
  upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
  ipHashSalt: process.env.IP_HASH_SALT ?? "default-salt",
  kakaoJsKey: process.env.NEXT_PUBLIC_KAKAO_JS_KEY ?? "",
  kakaoPayCid: process.env.KAKAOPAY_CID ?? "",
  kakaoPaySecretKey: process.env.KAKAOPAY_SECRET_KEY ?? ""
};

export function isSupabaseEnabled() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function isUpstashEnabled() {
  return Boolean(env.upstashRedisRestUrl && env.upstashRedisRestToken);
}

export function isKakaoPayEnabled() {
  return Boolean(env.kakaoPayCid && env.kakaoPaySecretKey);
}
