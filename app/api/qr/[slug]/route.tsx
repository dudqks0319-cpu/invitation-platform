import { ImageResponse } from "next/og";
import { createQrMatrix, getQrModule } from "@/lib/qr-code";
import {
  buildPublicInvitationShareUrl,
  PUBLIC_QR_IMAGE_SIZE
} from "@/lib/public-share-assets";

export const dynamic = "force-dynamic";

const QR_PIXEL_SIZE = 760;

function QrImage({ invitationUrl }: { invitationUrl: string }) {
  const matrix = createQrMatrix(invitationUrl);
  const moduleSize = QR_PIXEL_SIZE / (matrix.size + 8);
  const innerSize = matrix.size * moduleSize;

  return (
    <div
      style={{
        alignItems: "center",
        background: "#FFFFFF",
        color: "#1F1A17",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
        width: "100%"
      }}
    >
      <div
        style={{
          alignItems: "center",
          border: "1px solid #E9DED5",
          display: "flex",
          flexDirection: "column",
          height: 920,
          justifyContent: "center",
          width: 920
        }}
      >
        <div
          style={{
            color: "#8B7355",
            display: "flex",
            fontSize: 38,
            fontWeight: 800,
            marginBottom: 38
          }}
        >
          InviteHub
        </div>
        <div
          style={{
            alignItems: "center",
            background: "#FFFFFF",
            display: "flex",
            height: QR_PIXEL_SIZE,
            justifyContent: "center",
            width: QR_PIXEL_SIZE
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
        <div
          style={{
            color: "#6E625C",
            display: "flex",
            fontSize: 22,
            marginTop: 32
          }}
        >
          Scan to open invitation
        </div>
      </div>
    </div>
  );
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const decodedSlug = decodeURIComponent(slug);
  const invitationUrl = buildPublicInvitationShareUrl(decodedSlug, new URL(request.url).origin);
  const response = new ImageResponse(<QrImage invitationUrl={invitationUrl} />, PUBLIC_QR_IMAGE_SIZE);

  response.headers.set("Content-Disposition", `inline; filename="${encodeURIComponent(decodedSlug)}-qr.png"`);
  return response;
}
