import * as AppleAuthentication from "expo-apple-authentication";
import { supabase } from "./supabase";

export async function signInWithApple(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL
      ]
    });

    if (!credential.identityToken) {
      return { success: false, error: "Apple 로그인 토큰을 받지 못했습니다." };
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
    if ((err as { code?: string }).code === "ERR_REQUEST_CANCELED") {
      return { success: false, error: "로그인이 취소되었습니다." };
    }

    return {
      success: false,
      error: err instanceof Error ? err.message : "로그인에 실패했습니다."
    };
  }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
}

export function onAuthStateChange(
  callback: (event: string, session: unknown) => void
) {
  const { data: subscription } = supabase.auth.onAuthStateChange(callback);
  return subscription;
}

export async function requestAccountDeletion(): Promise<{
  success: boolean;
  message: string;
}> {
  return {
    success: false,
    message:
      "계정 삭제는 support@invitehub.co.kr로 요청해 주세요. 확인 후 처리해 드립니다."
  };
}
