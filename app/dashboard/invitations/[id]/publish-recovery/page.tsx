import { notFound, redirect } from "next/navigation";
import { authDestination } from "@/lib/auth";
import { getPublishMissingFields } from "@/lib/invitation-publish-readiness";
import { normalizeInvitationPayload } from "@/lib/supabase/invitation-payload";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PublishRecoveryPanel } from "@/components/payments/publish-recovery-panel";
import { SiteHeader } from "@/components/shared/site-header";

export default async function PublishRecoveryPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    notFound();
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/sign-in?next=${encodeURIComponent(authDestination.dashboard)}`);
  }

  const { data: invitation, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !invitation) {
    notFound();
  }

  const payload = normalizeInvitationPayload(invitation.payload);

  return (
    <main className="app-shell">
      <SiteHeader />
      <div className="app-page-offset">
        <PublishRecoveryPanel
          invitationId={invitation.id}
          missingFields={getPublishMissingFields(payload)}
          slug={invitation.slug}
          status={invitation.status}
          title={invitation.title}
        />
      </div>
    </main>
  );
}
