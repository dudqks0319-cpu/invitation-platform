import { buildPublicOgImageData, buildPublicOgImagePath } from "@/lib/public-og";
import { normalizeDraft } from "@/lib/invitation-payload";

describe("public OG image helpers", () => {
  it("builds an encoded public OG image path for slugs", () => {
    expect(buildPublicOgImagePath("kim lee/demo")).toBe("/api/og/kim%20lee%2Fdemo");
  });

  it("summarizes invitation content for share images", () => {
    const payload = normalizeDraft({
      title: "김 & 이 결혼식 초대장",
      groomName: "김민준",
      brideName: "이수아",
      eventDateTime: "2026-04-12T14:00:00.000Z",
      venueName: "서울 더파인 웨딩홀",
      venueAddress: "서울 강남구 테헤란로 123",
      message: "두 사람의 시작을 함께 축복해 주세요.",
      templateSnapshot: {
        templateAssetId: "wedding-photo-minimal",
        templateAssetVersion: 1,
        backgroundImageUrl: "/images/custom/wedding/wedding-01.png",
        canvas: { width: 1080, height: 1920 },
        safeAreas: {},
        photoSlots: [],
        palette: {
          backgroundHex: "#FFFDF9",
          accentHex: "#C7A165",
          primaryTextHex: "#2C2A2A",
          secondaryTextHex: "#8B7D73"
        },
        typography: {}
      }
    });

    expect(buildPublicOgImageData({ payload })).toMatchObject({
      title: "김 & 이 결혼식 초대장",
      names: "김민준 & 이수아",
      venue: "서울 더파인 웨딩홀 · 서울 강남구 테헤란로 123",
      categoryLabel: "Wedding Invitation",
      backgroundColor: "#FFFDF9",
      accentColor: "#C7A165",
      textColor: "#2C2A2A",
      mutedTextColor: "#8B7D73"
    });
  });
});
