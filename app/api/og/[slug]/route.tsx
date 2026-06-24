import { ImageResponse } from "next/og";
import {
  PUBLIC_OG_IMAGE_SIZE,
  type PublicOgImageData
} from "@/lib/public-og";
import { loadPublicShareImageData } from "@/lib/public-share-image-data";

export const dynamic = "force-dynamic";

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
  const data = await loadPublicShareImageData(decodeURIComponent(slug));

  return new ImageResponse(<PublicOgCard data={data} />, PUBLIC_OG_IMAGE_SIZE);
}
