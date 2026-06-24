import { ImageResponse } from "next/og";
import { createQrMatrix, getQrModule } from "@/lib/qr-code";
import {
  buildPublicInvitationShareUrl,
  isPublicShareImageFormat,
  PUBLIC_SHARE_IMAGE_SIZES,
  type PublicShareImageFormat
} from "@/lib/public-share-assets";
import { loadPublicShareImageData } from "@/lib/public-share-image-data";
import type { PublicOgImageData } from "@/lib/public-og";

export const dynamic = "force-dynamic";

function QrGrid({ invitationUrl, size }: { invitationUrl: string; size: number }) {
  const matrix = createQrMatrix(invitationUrl);
  const moduleSize = size / (matrix.size + 8);
  const innerSize = matrix.size * moduleSize;

  return (
    <div
      style={{
        alignItems: "center",
        background: "#FFFFFF",
        border: "1px solid #E8DDD6",
        display: "flex",
        height: size,
        justifyContent: "center",
        width: size
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: innerSize,
          width: innerSize
        }}
      >
        {Array.from({ length: matrix.size }, (_, y) => (
          <div
            key={`row-${y}`}
            style={{
              display: "flex",
              height: moduleSize,
              width: innerSize
            }}
          >
            {Array.from({ length: matrix.size }, (_, x) => (
              <div
                key={`${x}-${y}`}
                style={{
                  background: getQrModule(matrix, x, y) ? "#111111" : "#FFFFFF",
                  display: "flex",
                  height: moduleSize,
                  width: moduleSize
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function PublicShareImage({
  data,
  format,
  invitationUrl
}: {
  data: PublicOgImageData;
  format: PublicShareImageFormat;
  invitationUrl: string;
}) {
  const isA4 = format === "a4";
  const qrSize = isA4 ? 360 : 280;
  const label = isA4 ? "A4 PRINT POSTER" : "INSTAGRAM SHARE";

  return (
    <div
      style={{
        alignItems: "center",
        background: `linear-gradient(160deg, ${data.backgroundColor} 0%, #FFFFFF 56%, ${data.backgroundColor} 100%)`,
        color: data.textColor,
        display: "flex",
        height: "100%",
        justifyContent: "center",
        padding: isA4 ? 72 : 56,
        width: "100%"
      }}
    >
      <div
        style={{
          border: `2px solid ${data.accentColor}`,
          display: "flex",
          flexDirection: "column",
          gap: isA4 ? 50 : 34,
          height: "100%",
          justifyContent: "space-between",
          padding: isA4 ? 68 : 54,
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
              display: "flex",
              fontSize: isA4 ? 30 : 24,
              fontWeight: 900
            }}
          >
            {label}
          </div>
          <div
            style={{
              color: data.mutedTextColor,
              display: "flex",
              fontSize: isA4 ? 28 : 22,
              fontWeight: 800
            }}
          >
            InviteHub
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: isA4 ? 28 : 20
          }}
        >
          <div
            style={{
              color: data.accentColor,
              display: "flex",
              fontSize: isA4 ? 44 : 34,
              fontWeight: 900
            }}
          >
            {data.names}
          </div>
          <div
            style={{
              color: data.textColor,
              display: "flex",
              fontSize: isA4 ? 86 : 62,
              fontWeight: 900,
              lineHeight: 1.12
            }}
          >
            {data.title}
          </div>
          <div
            style={{
              color: data.mutedTextColor,
              display: "flex",
              fontSize: isA4 ? 34 : 28,
              lineHeight: 1.42
            }}
          >
            {data.message}
          </div>
        </div>

        <div
          style={{
            alignItems: "flex-end",
            display: "flex",
            gap: isA4 ? 42 : 28,
            justifyContent: "space-between"
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14
            }}
          >
            <div
              style={{
                color: data.textColor,
                display: "flex",
                fontSize: isA4 ? 36 : 28,
                fontWeight: 900
              }}
            >
              {data.eventDate}
            </div>
            <div
              style={{
                color: data.mutedTextColor,
                display: "flex",
                fontSize: isA4 ? 30 : 24,
                lineHeight: 1.35
              }}
            >
              {data.venue}
            </div>
            <div
              style={{
                color: data.accentColor,
                display: "flex",
                fontSize: isA4 ? 24 : 18,
                fontWeight: 800
              }}
            >
              QR로 초대장을 바로 열 수 있습니다.
            </div>
          </div>
          <QrGrid invitationUrl={invitationUrl} size={qrSize} />
        </div>
      </div>
    </div>
  );
}

export async function GET(
  request: Request,
  context: { params: Promise<{ format: string; slug: string }> }
) {
  const { format, slug } = await context.params;

  if (!isPublicShareImageFormat(format)) {
    return new Response("Unsupported share image format", { status: 404 });
  }

  const decodedSlug = decodeURIComponent(slug);
  const data = await loadPublicShareImageData(decodedSlug);
  const invitationUrl = buildPublicInvitationShareUrl(decodedSlug, new URL(request.url).origin);
  const response = new ImageResponse(
    <PublicShareImage data={data} format={format} invitationUrl={invitationUrl} />,
    PUBLIC_SHARE_IMAGE_SIZES[format]
  );

  response.headers.set("Content-Disposition", `inline; filename="${encodeURIComponent(decodedSlug)}-${format}.png"`);
  return response;
}
