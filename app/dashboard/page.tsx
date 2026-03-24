import { redirect } from "next/navigation";
import { authDestination } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SiteHeader } from "@/components/shared/site-header";
import { ensureProfileRow } from "@/lib/supabase/profile";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      redirect(`/sign-in?next=${encodeURIComponent(authDestination.dashboard)}`);
    }

    await ensureProfileRow(supabase, user).catch(() => {});
  }

  return (
    <main className="app-shell">
      <SiteHeader />
      <div className="app-page-offset">
        <DashboardShell />
      </div>
    </main>
  );
}
