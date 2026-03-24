export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "",
  kakaoPayCid: process.env.KAKAOPAY_CID ?? "",
  kakaoPaySecretKey: process.env.KAKAOPAY_SECRET_KEY ?? ""
};

export function isSupabaseEnabled() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function isKakaoPayEnabled() {
  return Boolean(env.kakaoPayCid && env.kakaoPaySecretKey);
}
