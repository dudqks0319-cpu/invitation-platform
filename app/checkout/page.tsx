import { redirect } from "next/navigation";
import { authDestination } from "@/lib/auth";
import { CheckoutFlow } from "@/components/payments/checkout-flow";
import { SiteHeader } from "@/components/shared/site-header";
import { ensureProfileRow } from "@/lib/supabase/profile";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function CheckoutPage({
  searchParams
}: {
  searchParams: Promise<{ invitationId?: string; payment?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      redirect(`/sign-in?next=${encodeURIComponent(authDestination.checkout)}`);
    }

    await ensureProfileRow(supabase, user).catch(() => {});
  }

  return (
    <main className="app-shell">
      <SiteHeader />
      <div className="app-page-offset">
        <section className="builder-section builder-section-page">
          <div className="section-inner" style={{ maxWidth: "760px" }}>
            <CheckoutFlow initialInvitationId={params.invitationId} initialPaymentState={params.payment} />
          </div>
        </section>
      </div>
    </main>
  );
}
