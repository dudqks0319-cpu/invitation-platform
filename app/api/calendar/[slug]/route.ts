import { findDemoInvitationBySlug } from "@/lib/demo-data";
import { buildPublishedInvitationAssetPayload } from "@/lib/invitation-assets";
import {
  buildPublicInvitationPayload,
  isInvitationSectionAllowed,
  type InvitationDraftPayload
} from "@/lib/invitation-payload";
import { resolvePublishedInvitationBySlug } from "@/lib/invitation-variants";
import { buildInvitationCalendarIcs } from "@/lib/calendar-invite";
import { buildPublicInvitationShareUrl } from "@/lib/public-share-assets";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PublicCalendarInvitation = {
  payload: InvitationDraftPayload;
  publicSlug: string;
  title: string;
};

async function loadPublicCalendarInvitation(slug: string): Promise<PublicCalendarInvitation | null> {
  const admin = createSupabaseAdminClient();
  const supabase = admin ?? (await createServerSupabaseClient());

  if (supabase) {
    const lookup = await resolvePublishedInvitationBySlug(supabase, slug);

    if (lookup) {
      const payload = buildPublicInvitationPayload(
        buildPublishedInvitationAssetPayload(lookup.publicSlug, lookup.payload)
      );

      return {
        payload,
        publicSlug: lookup.publicSlug,
        title: lookup.invitation.title || payload.title
      };
    }
  }

  const demoInvitation = findDemoInvitationBySlug(slug);

  if (!demoInvitation) {
    return null;
  }

  return {
    payload: buildPublicInvitationPayload(demoInvitation.payload),
    publicSlug: demoInvitation.slug,
    title: demoInvitation.title
  };
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const decodedSlug = decodeURIComponent(slug);
  const invitation = await loadPublicCalendarInvitation(decodedSlug);

  if (!invitation || !isInvitationSectionAllowed(invitation.payload, "calendar", "view")) {
    return new Response("Not found", { status: 404 });
  }

  const shareUrl = buildPublicInvitationShareUrl(invitation.publicSlug, new URL(request.url).origin);
  const ics = buildInvitationCalendarIcs({
    payload: invitation.payload,
    shareUrl,
    title: invitation.title,
    uid: `${invitation.publicSlug}@invitehub`
  });

  if (!ics) {
    return new Response("Calendar event date is invalid", { status: 422 });
  }

  return new Response(ics, {
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(invitation.publicSlug)}.ics"`,
      "Content-Type": "text/calendar; charset=utf-8"
    }
  });
}
