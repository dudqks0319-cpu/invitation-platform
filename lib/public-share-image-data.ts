import { findDemoInvitationBySlug } from "@/lib/demo-data";
import { buildPublishedInvitationAssetPayload } from "@/lib/invitation-assets";
import {
  buildPublicInvitationPayload,
  defaultInvitationDraft
} from "@/lib/invitation-payload";
import { resolvePublishedInvitationBySlug } from "@/lib/invitation-variants";
import {
  buildPublicOgImageData,
  type PublicOgImageData
} from "@/lib/public-og";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function loadPublicShareImageData(slug: string): Promise<PublicOgImageData> {
  const admin = createSupabaseAdminClient();
  const supabase = admin ?? (await createServerSupabaseClient());

  if (supabase) {
    const lookup = await resolvePublishedInvitationBySlug(supabase, slug);

    if (lookup) {
      const payload = buildPublicInvitationPayload(
        buildPublishedInvitationAssetPayload(lookup.publicSlug, lookup.payload)
      );

      return buildPublicOgImageData({
        payload,
        title: lookup.invitation.title || payload.title
      });
    }
  }

  const demoInvitation = findDemoInvitationBySlug(slug);
  if (demoInvitation) {
    return buildPublicOgImageData({
      payload: demoInvitation.payload,
      title: demoInvitation.title
    });
  }

  return buildPublicOgImageData({
    payload: {
      ...defaultInvitationDraft,
      title: "InviteHub",
      groomName: "",
      brideName: "",
      message: "모바일 초대장을 손쉽게 만들고 공유하세요."
    },
    title: "InviteHub"
  });
}
