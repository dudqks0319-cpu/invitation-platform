import { useMemo } from "react";
import { getAuthRedirectUrl } from "@/lib/supabase";

export function useAuth() {
  return useMemo(
    () => ({
      configured: true,
      session: null,
      signInWithGoogle: async () => ({ error: new Error("웹 미리보기에서는 Google 간편 로그인을 사용할 수 없습니다.") }),
      signInWithApple: async () => ({ error: new Error("웹 미리보기에서는 Apple 로그인을 사용할 수 없습니다.") }),
      signInWithKakao: async () => ({ error: new Error("웹 미리보기에서는 Kakao 간편 로그인을 사용할 수 없습니다.") }),
      ensureAnonymousSession: async () => ({ error: new Error("웹 미리보기에서는 게스트 세션을 사용할 수 없습니다.") }),
      signInWithPassword: async () => ({ error: new Error("웹 미리보기에서는 이메일 로그인을 사용할 수 없습니다.") }),
      signUpWithPassword: async () => ({ error: new Error("웹 미리보기에서는 회원가입을 사용할 수 없습니다.") }),
      signOut: async () => ({ error: null }),
      configMessage: "",
      configMissingKeys: [],
      hasFullAccount: false,
      isAnonymousSession: false,
      isAuthenticated: false,
      status: "anonymous" as const,
      user: null,
      authCallbackPath: getAuthRedirectUrl(),
      nativeGoogleConfigured: false,
      nativeKakaoConfigured: false
    }),
    []
  );
}
