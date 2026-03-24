import { NextResponse } from "next/server";
import { authDestination, normalizeNextPath } from "@/lib/auth";
import { ensureProfileRow } from "@/lib/supabase/profile";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = normalizeNextPath(requestUrl.searchParams.get("next"), authDestination.dashboard);
  const errorRedirectUrl = new URL(`/sign-in?error=oauth_callback_failed&next=${encodeURIComponent(nextPath)}`, requestUrl.origin);

  const supabase = await createServerSupabaseClient();

  if (!supabase || !code) {
    return NextResponse.redirect(errorRedirectUrl);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(errorRedirectUrl);
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    await ensureProfileRow(supabase, user).catch(() => {});
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}
