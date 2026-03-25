import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { InvitationView } from "@/components/invitations/invitation-view";
import { SiteHeader } from "@/components/shared/site-header";
import { findDemoInvitationBySlug } from "@/lib/demo-data";
import { getPublicShareUrl } from "@/lib/invitation-presentation";
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
  const headerList = await headers();
  const forwardedHost = headerList.get("x-forwarded-host");
  const host = forwardedHost || headerList.get("host") || "localhost:3000";
  const protocol = headerList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
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
              shareUrl={getPublicShareUrl(`/invitations/${invitation.slug}`, origin)}
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
        <InvitationView
          mode="public"
          payload={demoInvitation.payload}
          shareUrl={getPublicShareUrl(`/invitations/${demoInvitation.slug}`, origin)}
          slug={demoInvitation.slug}
        />
      </div>
    </>
  );
}
