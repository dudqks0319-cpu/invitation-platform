import { ImageResponse } from "next/og";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeInvitationPayload } from "@/lib/supabase/invitation-payload";

export const runtime = "edge";

const WIDTH = 1200;
const HEIGHT = 630;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let title = "InviteHub 초대장";
  let groomName = "";
  let brideName = "";
  let eventDate = "";
  let venueName = "";
  let category = "wedding";

  const admin = createSupabaseAdminClient();

  if (admin) {
    const { data: invitation } = await admin
      .from("invitations")
      .select("payload, title")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (invitation) {
      const payload = normalizeInvitationPayload(invitation.payload);
      title = payload.title || invitation.title || title;
      groomName = payload.groomName || "";
      brideName = payload.brideName || "";
      venueName = payload.venueName || "";
      category = payload.category || "wedding";

      if (payload.eventDateTime) {
        try {
          const date = new Date(payload.eventDateTime);
          if (!isNaN(date.getTime())) {
            eventDate = date.toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "short"
            });
          }
        } catch {
          // ignore
        }
      }
    }
  }

  const categoryEmoji: Record<string, string> = {
    wedding: "💍",
    dol: "🎂",
    hwangap: "🎊",
    bridal: "👰",
    birthday: "🎉",
    housewarming: "🏠",
    baby: "👶",
    graduation: "🎓",
    business: "📋"
  };

  const emoji = categoryEmoji[category] || "✉️";
  const namesText =
    groomName && brideName
      ? `${groomName} ♡ ${brideName}`
      : groomName || brideName || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FFF5F5 0%, #FFF0E6 30%, #FFFBEB 60%, #F0FFF4 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255, 182, 193, 0.15)",
            display: "flex"
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "rgba(173, 216, 230, 0.12)",
            display: "flex"
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255, 255, 255, 0.85)",
            borderRadius: 24,
            padding: "48px 64px",
            maxWidth: 900,
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.06)",
            border: "1px solid rgba(0, 0, 0, 0.04)"
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 16, display: "flex" }}>{emoji}</div>

          <div
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: "#2D2D2D",
              textAlign: "center",
              marginBottom: 12,
              lineHeight: 1.2,
              display: "flex"
            }}
          >
            {title}
          </div>

          {namesText ? (
            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: "#C9536C",
                marginBottom: 12,
                display: "flex"
              }}
            >
              {namesText}
            </div>
          ) : null}

          {eventDate ? (
            <div
              style={{
                fontSize: 22,
                color: "#666",
                marginBottom: 8,
                display: "flex"
              }}
            >
              {eventDate}
            </div>
          ) : null}

          {venueName ? (
            <div
              style={{
                fontSize: 20,
                color: "#888",
                display: "flex"
              }}
            >
              {venueName}
            </div>
          ) : null}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 24,
            right: 32,
            fontSize: 16,
            color: "#BBB",
            display: "flex"
          }}
        >
          invitehub.co.kr
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT
    }
  );
}
