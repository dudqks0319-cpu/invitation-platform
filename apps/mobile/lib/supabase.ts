import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabaseMissingKeys = [
  !supabaseUrl ? "EXPO_PUBLIC_SUPABASE_URL" : null,
  !supabaseAnonKey ? "EXPO_PUBLIC_SUPABASE_ANON_KEY" : null
].filter(Boolean) as string[];
const safeAuthStorage = {
  async getItem(key: string) {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // Auth persistence should not crash the app if device storage is stale.
    }
  },
  async removeItem(key: string) {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Removing a stale session is best-effort.
    }
  }
};

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabaseConfigMissingKeys = supabaseMissingKeys;

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        storage: safeAuthStorage,
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
    return "Supabase 원격 기능을 사용할 수 있습니다.";
  }

  return `원격 기능을 쓰려면 ${supabaseMissingKeys.join(", ")} 값을 설정해야 합니다.`;
}
