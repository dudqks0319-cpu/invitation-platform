import { redirect } from "next/navigation";
import { authDestination, normalizeNextPath } from "@/lib/auth";
import { SignInCard } from "@/components/auth/sign-in-card";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function SignInPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const nextPath = normalizeNextPath(params.next, authDestination.dashboard);
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      redirect(nextPath);
    }
  }

  return (
    <main className="signin-page">
      <SignInCard initialError={params.error} nextPath={nextPath} />
    </main>
  );
}
