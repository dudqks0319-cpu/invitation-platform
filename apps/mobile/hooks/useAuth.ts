import { useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getAuthRedirectUrl, isSupabaseConfigured, supabase } from "@/lib/supabase";

type AuthStatus = "loading" | "anonymous" | "authenticated";

export function useAuth() {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!supabase) {
      setStatus("anonymous");
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
      signInWithKakao: async () => {
        if (!supabase) {
          return { error: new Error("Supabase 환경 변수가 없어 Kakao 로그인을 시작할 수 없습니다.") };
        }

        return supabase.auth.signInWithOAuth({
          provider: "kakao",
          options: {
            redirectTo: getAuthRedirectUrl()
          }
        });
      },
      signInWithPassword: async (email: string, password: string) => {
        if (!supabase) {
          return { error: new Error("Supabase 환경 변수가 없어 이메일 로그인을 시작할 수 없습니다.") };
        }

        return supabase.auth.signInWithPassword({ email, password });
      },
      signOut: async () => {
        if (!supabase) {
          return { error: null };
        }

        return supabase.auth.signOut();
      },
      status,
      user
    }),
    [session, status, user]
  );
}
