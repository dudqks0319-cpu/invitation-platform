/* eslint-disable @typescript-eslint/no-require-imports */

import { useEffect, useMemo, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import type { Session, User } from "@supabase/supabase-js";
import { Platform } from "react-native";
import {
  getAuthRedirectUrl,
  getSupabaseConfigMessage,
  isSupabaseConfigured,
  supabase,
  supabaseConfigMissingKeys
} from "@/lib/supabase";
import { hasFullAccount as userHasFullAccount, isAnonymousUser } from "@/lib/auth-access";
import { isNativeGoogleConfigured, isNativeKakaoConfigured, nativeAuthConfig } from "@/lib/auth-native-config";

type AuthStatus = "loading" | "anonymous" | "authenticated";
const isWeb = Platform.OS === "web";

if (isWeb) {
  WebBrowser.maybeCompleteAuthSession();
}

function createNonce() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function getGoogleSignin() {
  if (isWeb) {
    return null;
  }

  try {
    return require("@react-native-google-signin/google-signin").GoogleSignin;
  } catch {
    return null;
  }
}

function getKakaoUserModule() {
  if (isWeb) {
    return null;
  }

  try {
    return require("@react-native-kakao/user");
  } catch {
    return null;
  }
}

function getAppleAuthentication() {
  if (isWeb) {
    return null;
  }

  try {
    return require("expo-apple-authentication");
  } catch {
    return null;
  }
}

export function useAuth() {
  const [status, setStatus] = useState<AuthStatus>(supabase ? "loading" : "anonymous");
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let mounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setStatus(data.session?.user ? "authenticated" : "anonymous");
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);
      setStatus(nextSession?.user ? "authenticated" : "anonymous");
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return useMemo(
    () => ({
      configured: isSupabaseConfigured,
      session,
      signInWithGoogle: async () => {
        if (!supabase) {
          return { error: new Error("Supabase 환경 변수가 없어 Google 로그인을 시작할 수 없습니다.") };
        }

        if (isWeb) {
          return { error: new Error("웹 미리보기에서는 Google 간편 로그인을 사용할 수 없습니다.") };
        }

        if (!isNativeGoogleConfigured()) {
          return {
            error: new Error("Google 네이티브 로그인을 사용하려면 Google 클라이언트 ID 설정이 필요합니다.")
          };
        }

        const googleSignin = getGoogleSignin();
        if (!googleSignin) {
          return { error: new Error("Google 로그인 모듈을 불러오지 못했습니다.") };
        }

        try {
          googleSignin.configure({
            iosClientId: nativeAuthConfig.googleIosClientId || undefined,
            webClientId: nativeAuthConfig.googleWebClientId || undefined
          });
        } catch (caught) {
          return {
            error: new Error(
              caught instanceof Error
                ? `Google 로그인 준비에 실패했습니다. ${caught.message}`
                : "Google 로그인 준비에 실패했습니다."
            )
          };
        }

        if (Platform.OS === "android") {
          await googleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        }

        const result = await googleSignin.signIn();
        if (result.type !== "success") {
          return { error: new Error("Google 로그인이 취소되었습니다.") };
        }

        const tokens = await googleSignin.getTokens();
        return supabase.auth.signInWithIdToken({
          provider: "google",
          token: tokens.idToken,
          access_token: tokens.accessToken
        });
      },
      signInWithApple: async () => {
        if (!supabase) {
          return { error: new Error("Supabase 환경 변수가 없어 Apple 로그인을 시작할 수 없습니다.") };
        }

        if (isWeb) {
          return { error: new Error("웹 미리보기에서는 Apple 로그인을 사용할 수 없습니다.") };
        }

        const appleAuthentication = getAppleAuthentication();
        if (!appleAuthentication) {
          return { error: new Error("Apple 로그인 모듈을 불러오지 못했습니다.") };
        }

        const available = await appleAuthentication.isAvailableAsync();
        if (!available) {
          return { error: new Error("현재 환경에서는 Apple 로그인을 사용할 수 없습니다.") };
        }

        const nonce = createNonce();
        const credential = await appleAuthentication.signInAsync({
          nonce,
          requestedScopes: [
            appleAuthentication.AppleAuthenticationScope.EMAIL,
            appleAuthentication.AppleAuthenticationScope.FULL_NAME
          ]
        });

        if (!credential.identityToken) {
          return { error: new Error("Apple identity token을 받지 못했습니다.") };
        }

        return supabase.auth.signInWithIdToken({
          provider: "apple",
          token: credential.identityToken,
          nonce
        });
      },
      signInWithKakao: async () => {
        if (!supabase) {
          return { error: new Error("Supabase 환경 변수가 없어 Kakao 로그인을 시작할 수 없습니다.") };
        }

        if (isWeb) {
          return { error: new Error("웹 미리보기에서는 Kakao 간편 로그인을 사용할 수 없습니다.") };
        }

        if (!isNativeKakaoConfigured()) {
          return {
            error: new Error("Kakao 네이티브 로그인을 사용하려면 Kakao Native App Key 설정이 필요합니다.")
          };
        }

        const kakaoUser = getKakaoUserModule();
        if (!kakaoUser?.login) {
          return { error: new Error("Kakao 로그인 모듈을 불러오지 못했습니다.") };
        }

        const result = await kakaoUser.login();
        if (!result.idToken) {
          return { error: new Error("카카오 ID 토큰을 받지 못했습니다.") };
        }

        return supabase.auth.signInWithIdToken({
          provider: "kakao",
          token: result.idToken,
          access_token: result.accessToken
        });
      },
      ensureAnonymousSession: async () => {
        if (!supabase) {
          return { error: new Error("Supabase 환경 변수가 없어 게스트 세션을 시작할 수 없습니다.") };
        }

        const currentSession = await supabase.auth.getSession();
        if (currentSession.data.session?.user) {
          return {
            data: {
              session: currentSession.data.session,
              user: currentSession.data.session.user
            },
            error: null
          };
        }

        return supabase.auth.signInAnonymously();
      },
      signInWithPassword: async (email: string, password: string) => {
        if (!supabase) {
          return { error: new Error("Supabase 환경 변수가 없어 이메일 로그인을 시작할 수 없습니다.") };
        }

        return supabase.auth.signInWithPassword({ email, password });
      },
      signUpWithPassword: async (email: string, password: string) => {
        if (!supabase) {
          return { error: new Error("Supabase 환경 변수가 없어 이메일 가입을 시작할 수 없습니다.") };
        }

        return supabase.auth.signUp({ email, password });
      },
      signOut: async () => {
        if (!supabase) {
          return { error: null };
        }

        const googleSignin = getGoogleSignin();
        const kakaoUser = getKakaoUserModule();
        await Promise.allSettled([
          googleSignin?.signOut?.() ?? Promise.resolve(),
          kakaoUser?.logout?.() ?? Promise.resolve()
        ]);
        return supabase.auth.signOut();
      },
      configMessage: getSupabaseConfigMessage(),
      configMissingKeys: supabaseConfigMissingKeys,
      hasFullAccount: status === "authenticated" && userHasFullAccount(user),
      isAnonymousSession: status === "authenticated" && isAnonymousUser(user),
      isAuthenticated: status === "authenticated",
      status,
      user,
      authCallbackPath: getAuthRedirectUrl(),
      nativeGoogleConfigured: isNativeGoogleConfigured(),
      nativeKakaoConfigured: isNativeKakaoConfigured()
    }),
    [session, status, user]
  );
}
