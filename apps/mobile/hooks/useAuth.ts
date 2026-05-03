import { useEffect, useMemo, useState } from "react";
import * as AppleAuthentication from "expo-apple-authentication";
import * as WebBrowser from "expo-web-browser";
import type { Session, User } from "@supabase/supabase-js";
import {
  getAuthRedirectUrl,
  getSupabaseConfigMessage,
  isSupabaseConfigured,
  supabase,
  supabaseConfigMissingKeys
} from "@/lib/supabase";
import { hasFullAccount as userHasFullAccount, isAnonymousUser } from "@/lib/auth-access";
import { isNativeGoogleConfigured, isNativeKakaoConfigured } from "@/lib/auth-native-config";

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

  return useMemo(
    () => ({
      configured: isSupabaseConfigured,
      session,
      signInWithGoogle: async () => {
        return { error: new Error("Google 로그인은 이번 TestFlight 안정화 빌드에서 잠시 비활성화했습니다.") };
      },
      signInWithApple: async () => {
        if (!supabase) {
          return { error: new Error("Supabase 환경 변수가 없어 Apple 로그인을 시작할 수 없습니다.") };
        }

        const available = await AppleAuthentication.isAvailableAsync();
        if (!available) {
          return { error: new Error("현재 환경에서는 Apple 로그인을 사용할 수 없습니다.") };
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
        return { error: new Error("Kakao 로그인은 이번 TestFlight 안정화 빌드에서 잠시 비활성화했습니다.") };
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
