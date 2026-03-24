import { notFound } from "next/navigation";
import { InvitationView } from "@/components/invitations/invitation-view";
import { SiteHeader } from "@/components/shared/site-header";
import { findDemoInvitationBySlug } from "@/lib/demo-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeInvitationPayload } from "@/lib/supabase/invitation-payload";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function PublicInvitationPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const admin = createSupabaseAdminClient();
  const supabase = admin ?? (await createServerSupabaseClient());

  if (supabase) {
    const { data: invitation } = await supabase
      .from("invitations")
      .select("*")
      .eq("slug", decodedSlug)
      .eq("status", "published")
      .maybeSingle();

    if (invitation) {
      const { data: guestbookEntries } = await supabase
        .from("guestbook_entries")
        .select("*")
        .eq("invitation_id", invitation.id)
        .eq("approved", true)
        .order("created_at", { ascending: false })
        .limit(20);

      return (
        <>
          <SiteHeader />
          <div className="app-page-offset">
            <InvitationView
              initialGuestbookEntries={(guestbookEntries ?? []).map((entry) => ({
                id: entry.id,
                nickname: entry.nickname,
                message: entry.message,
                approved: entry.approved,
                createdAt: entry.created_at
              }))}
              mode="public"
              payload={normalizeInvitationPayload(invitation.payload)}
              shareUrl={`/invitations/${invitation.slug}`}
              slug={invitation.slug}
            />
          </div>
        </>
      );
    }
  }

  const demoInvitation = findDemoInvitationBySlug(decodedSlug);

  if (!demoInvitation) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <div className="app-page-offset">
        <InvitationView mode="public" payload={demoInvitation.payload} shareUrl={`/invitations/${demoInvitation.slug}`} slug={demoInvitation.slug} />
      </div>
    </>
  );
}
