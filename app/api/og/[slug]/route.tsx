import { ImageResponse } from "next/og";
import { findDemoInvitationBySlug } from "@/lib/demo-data";
import { buildPublishedInvitationAssetPayload } from "@/lib/invitation-assets";
import {
  buildPublicInvitationPayload,
  defaultInvitationDraft
} from "@/lib/invitation-payload";
import {
  buildPublicOgImageData,
  PUBLIC_OG_IMAGE_SIZE,
  type PublicOgImageData
} from "@/lib/public-og";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { resolvePublishedInvitationBySlug } from "@/lib/invitation-variants";

export const dynamic = "force-dynamic";

async function loadPublicOgData(slug: string) {
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

function PublicOgCard({ data }: { data: PublicOgImageData }) {
  return (
    <div
      style={{
        alignItems: "center",
        background: `linear-gradient(135deg, ${data.backgroundColor} 0%, #FFFFFF 58%, ${data.backgroundColor} 100%)`,
        color: data.textColor,
        display: "flex",
        height: "100%",
        justifyContent: "center",
        padding: 54,
        width: "100%"
      }}
    >
      <div
        style={{
          border: `2px solid ${data.accentColor}`,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: 54,
          width: "100%"
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            justifyContent: "space-between"
          }}
        >
          <div
            style={{
              color: data.accentColor,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 0
            }}
          >
            {data.categoryLabel}
          </div>
          <div
            style={{
              color: data.mutedTextColor,
              fontSize: 24,
              fontWeight: 700
            }}
          >
            InviteHub
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            maxWidth: 850
          }}
        >
          <div
            style={{
              color: data.accentColor,
              fontSize: 34,
              fontWeight: 800
            }}
          >
            {data.names}
          </div>
          <div
            style={{
              color: data.textColor,
              fontSize: 70,
              fontWeight: 900,
              lineHeight: 1.12
            }}
          >
            {data.title}
          </div>
          <div
            style={{
              color: data.mutedTextColor,
              fontSize: 30,
              lineHeight: 1.38
            }}
          >
            {data.message}
          </div>
        </div>

        <div
          style={{
            alignItems: "flex-end",
            display: "flex",
            justifyContent: "space-between",
            gap: 32
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10
            }}
          >
            <div
              style={{
                color: data.textColor,
                fontSize: 30,
                fontWeight: 800
              }}
            >
              {data.eventDate}
            </div>
            <div
              style={{
                color: data.mutedTextColor,
                fontSize: 24
              }}
            >
              {data.venue}
            </div>
          </div>
          <div
            style={{
              backgroundColor: data.accentColor,
              borderRadius: 999,
              height: 18,
              width: 118
            }}
          />
        </div>
      </div>
    </div>
  );
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const data = await loadPublicOgData(decodeURIComponent(slug));

  return new ImageResponse(<PublicOgCard data={data} />, PUBLIC_OG_IMAGE_SIZE);
}
