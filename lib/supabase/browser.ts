"use client";

import { createBrowserClient as createClient } from "@supabase/ssr";
import { env, isSupabaseEnabled } from "@/lib/env";

let browserClient: ReturnType<typeof createClient> | null = null;

export function createBrowserClient() {
  if (!isSupabaseEnabled()) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(env.supabaseUrl, env.supabaseAnonKey);
  }

  return browserClient;
}
