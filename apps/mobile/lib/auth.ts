import * as AppleAuthentication from "expo-apple-authentication";
import { supabase } from "./supabase";

export async function signInWithApple(): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: "Supabase가 설정되지 않았습니다." };
  }

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL
      ]
    });

    if (!credential.identityToken) {
      return { success: false, error: "Apple 인증 토큰을 받지 못했습니다." };
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: credential.identityToken
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const error = err as { code?: string; message?: string };
    if (error.code === "ERR_REQUEST_CANCELED") {
      return { success: false, error: "로그인이 취소되었습니다." };
    }
    return { success: false, error: error.message || "로그인에 실패했습니다." };
  }
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export function onAuthStateChange(callback: (session: unknown) => void) {
  if (!supabase) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }

  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}
