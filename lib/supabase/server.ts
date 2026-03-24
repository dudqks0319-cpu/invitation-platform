import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env, isSupabaseEnabled } from "@/lib/env";

type CookieMutation = {
  name: string;
  value: string;
  options?: {
    domain?: string;
    maxAge?: number;
    path?: string;
    sameSite?: boolean | "lax" | "strict" | "none";
    secure?: boolean;
    httpOnly?: boolean;
    expires?: Date;
  };
};

export async function createServerSupabaseClient() {
  if (!isSupabaseEnabled()) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieMutation[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components can be read-only. Middleware performs the actual refresh path.
        }
      }
    }
  });
}
