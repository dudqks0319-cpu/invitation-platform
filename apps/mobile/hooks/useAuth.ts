import { useEffect, useMemo, useState } from "react";
import * as AppleAuthentication from "expo-apple-authentication";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { login as loginWithKakaoNative, logout as logoutFromKakaoNative } from "@react-native-kakao/user";
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

WebBrowser.maybeCompleteAuthSession();

type AuthStatus = "loading" | "anonymous" | "authenticated";

function createNonce() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
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

  useEffect(() => {
    if (!isNativeGoogleConfigured()) {
      return;
    }

    GoogleSignin.configure({
      iosClientId: nativeAuthConfig.googleIosClientId || undefined,
      webClientId: nativeAuthConfig.googleWebClientId || undefined
    });
  }, []);

  return useMemo(
    () => ({
      configured: isSupabaseConfigured,
      session,
      signInWithGoogle: async () => {
        if (!supabase) {
          return { error: new Error("현재 온라인 로그인 기능을 준비 중입니다. 잠시 후 다시 이용해 주세요.") };
        }

        if (!isNativeGoogleConfigured()) {
          return {
            error: new Error("현재 Google 로그인을 사용할 수 없습니다. 이메일 로그인 또는 둘러보기를 이용해 주세요.")
          };
        }

        if (Platform.OS === "android") {
          await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        }

        const result = await GoogleSignin.signIn();
        if (result.type !== "success") {
          return { error: new Error("Google 로그인이 취소되었습니다.") };
        }

        const tokens = await GoogleSignin.getTokens();
        return supabase.auth.signInWithIdToken({
          provider: "google",
          token: tokens.idToken,
          access_token: tokens.accessToken
        });
      },
      signInWithApple: async () => {
        if (!supabase) {
          return { error: new Error("현재 온라인 로그인 기능을 준비 중입니다. 잠시 후 다시 이용해 주세요.") };
        }

        const available = await AppleAuthentication.isAvailableAsync();
        if (!available) {
          return { error: new Error("이 기기에서는 Apple 로그인을 사용할 수 없습니다.") };
        }

        const nonce = createNonce();
        const credential = await AppleAuthentication.signInAsync({
          nonce,
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME
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
          return { error: new Error("현재 온라인 로그인 기능을 준비 중입니다. 잠시 후 다시 이용해 주세요.") };
        }

        if (!isNativeKakaoConfigured()) {
          return {
            error: new Error("현재 Kakao 로그인을 사용할 수 없습니다. 이메일 로그인 또는 둘러보기를 이용해 주세요.")
          };
        }

        const result = await loginWithKakaoNative();
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
          return { error: new Error("현재 게스트 발행 기능을 준비 중입니다. 잠시 후 다시 이용해 주세요.") };
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
          return { error: new Error("현재 이메일 로그인을 준비 중입니다. 잠시 후 다시 이용해 주세요.") };
        }

        return supabase.auth.signInWithPassword({ email, password });
      },
      signUpWithPassword: async (email: string, password: string) => {
        if (!supabase) {
          return { error: new Error("현재 이메일 가입을 준비 중입니다. 잠시 후 다시 이용해 주세요.") };
        }

        return supabase.auth.signUp({ email, password });
      },
      signOut: async () => {
        if (!supabase) {
          return { error: null };
        }

        await Promise.allSettled([
          GoogleSignin.signOut(),
          logoutFromKakaoNative()
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
