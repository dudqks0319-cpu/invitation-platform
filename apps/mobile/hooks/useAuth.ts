import { useEffect, useMemo, useState } from "react";
import type { CryptoDigestAlgorithm } from "expo-crypto";
import type { Session, User } from "@supabase/supabase-js";
import {
  getAuthRedirectUrl,
  getSupabaseConfigMessage,
  isSupabaseConfigured,
  supabase,
  supabaseConfigMissingKeys
} from "@/lib/supabase";
import { hasFullAccount as userHasFullAccount, isAnonymousUser } from "@/lib/auth-access";
import { shouldUpgradeAnonymousAccount } from "@/lib/auth-completion";
import { isNativeGoogleConfigured, isNativeKakaoConfigured } from "@/lib/auth-native-config";

type AuthStatus = "loading" | "anonymous" | "authenticated";

async function createAppleNoncePair() {
  const Crypto = await import("expo-crypto");
  const nonceBytes = await Crypto.getRandomBytesAsync(32);
  const rawNonce = Array.from(nonceBytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  const hashedNonce = await Crypto.digestStringAsync("SHA-256" as CryptoDigestAlgorithm, rawNonce);

  return { hashedNonce, rawNonce };
}

export function useAuth() {
  const [status, setStatus] = useState<AuthStatus>(supabase ? "loading" : "anonymous");
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  function applyAuthSession(nextSession: Session | null) {
    setSession(nextSession);
    setUser(nextSession?.user ?? null);
    setStatus(nextSession?.user ? "authenticated" : "anonymous");
  }

  function applyAuthUser(nextUser: User | null) {
    setUser(nextUser);
    setStatus(nextUser ? "authenticated" : "anonymous");
  }

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let mounted = true;

    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        applyAuthSession(data.session ?? null);
      })
      .catch(() => {
        if (!mounted) return;
        applyAuthSession(null);
      });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      applyAuthSession(nextSession ?? null);
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

        const AppleAuthentication = await import("expo-apple-authentication");
        const available = await AppleAuthentication.isAvailableAsync();
        if (!available) {
          return { error: new Error("현재 환경에서는 Apple 로그인을 사용할 수 없습니다.") };
        }

        const { hashedNonce, rawNonce } = await createAppleNoncePair();
        const credential = await AppleAuthentication.signInAsync({
          nonce: hashedNonce,
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME
          ]
        });

        if (!credential.identityToken) {
          return { error: new Error("Apple identity token을 받지 못했습니다.") };
        }

        const result = await supabase.auth.signInWithIdToken({
          provider: "apple",
          token: credential.identityToken,
          nonce: rawNonce
        });

        if (!result.error && result.data.session) {
          applyAuthSession(result.data.session);
        }

        return result;
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

        const result = await supabase.auth.signInWithPassword({ email, password });

        if (!result.error && result.data.session) {
          applyAuthSession(result.data.session);
        }

        return result;
      },
      signUpWithPassword: async (email: string, password: string) => {
        if (!supabase) {
          return { error: new Error("Supabase 환경 변수가 없어 이메일 가입을 시작할 수 없습니다.") };
        }

        const normalizedEmail = email.trim();
        const emailRedirectTo = getAuthRedirectUrl("auth/callback");

        if (shouldUpgradeAnonymousAccount(status, user)) {
          const result = await supabase.auth.updateUser(
            { email: normalizedEmail, password },
            { emailRedirectTo }
          );

          if (!result.error) {
            applyAuthUser(result.data.user ?? null);
          }

          return {
            data: {
              session,
              user: result.data.user ?? null
            },
            error: result.error
          };
        }

        const result = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo
          }
        });

        if (!result.error && result.data.session) {
          applyAuthSession(result.data.session);
        }

        return result;
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
