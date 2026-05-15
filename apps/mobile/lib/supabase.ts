import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabaseMissingKeys = [
  !supabaseUrl ? "EXPO_PUBLIC_SUPABASE_URL" : null,
  !supabaseAnonKey ? "EXPO_PUBLIC_SUPABASE_ANON_KEY" : null
].filter(Boolean) as string[];

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabaseConfigMissingKeys = supabaseMissingKeys;

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    })
  : null;

export function getAuthRedirectUrl(path = "auth/callback") {
  return `invitehub://${path}`;
}

export function getSupabaseConfigMessage() {
  if (isSupabaseConfigured) {
    return "온라인 발행과 계정 기능을 사용할 수 있습니다.";
  }

  return "현재 온라인 발행 기능을 준비 중입니다. 초대장 작성과 미리보기는 계속 이용할 수 있습니다.";
}
