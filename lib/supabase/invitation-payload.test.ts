import { normalizeInvitationPayload } from "@/lib/supabase/invitation-payload";

describe("invitation payload normalization", () => {
  it("maps legacy image blob fields into url slots", () => {
    const payload = normalizeInvitationPayload({
      title: "테스트",
      mainImageData: "data:image/png;base64,aaa",
      backgroundImageData: "data:image/png;base64,bbb"
    });

    expect(payload.mainImageUrl).toBe("data:image/png;base64,aaa");
    expect(payload.backgroundImageUrl).toBe("data:image/png;base64,bbb");
  });

  it("fills missing fields with safe defaults", () => {
    const payload = normalizeInvitationPayload(null);

    expect(payload.templateId).toBe("wedding-classic");
    expect(payload.title).toBe("결혼식 초대장");
  });

  it("preserves gallery images when present", () => {
    const payload = normalizeInvitationPayload({
      galleryImages: ["https://example.com/1.jpg", "https://example.com/2.jpg"]
    });

    expect(payload.galleryImages).toEqual([
      "https://example.com/1.jpg",
      "https://example.com/2.jpg"
    ]);
  });
});
