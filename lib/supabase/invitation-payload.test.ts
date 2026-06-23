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
    expect(payload.schemaVersion).toBe(3);
    expect(payload.sections.rsvp.publicSubmitAllowed).toBe(true);
    expect(payload.sections.guestbook.publicSubmitAllowed).toBe(true);
  });

  it("normalizes section policies for persisted payloads", () => {
    const payload = normalizeInvitationPayload({
      sections: {
        rsvp: false,
        accounts: {
          enabled: false,
          publicVisible: true
        }
      }
    });

    expect(payload.sections.rsvp.enabled).toBe(false);
    expect(payload.sections.rsvp.publicVisible).toBe(false);
    expect(payload.sections.rsvp.publicSubmitAllowed).toBe(false);
    expect(payload.sections.accounts.enabled).toBe(false);
    expect(payload.sections.accounts.publicVisible).toBe(false);
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

  it("preserves optional media and thank-you fields", () => {
    const payload = normalizeInvitationPayload({
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      backgroundMusicUrl: "https://cdn.example.com/music.mp3",
      thankYouMessage: "함께해 주셔서 감사합니다."
    });

    expect(payload.videoUrl).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(payload.backgroundMusicUrl).toBe("https://cdn.example.com/music.mp3");
    expect(payload.thankYouMessage).toBe("함께해 주셔서 감사합니다.");
  });

  it("preserves published template snapshots for public rendering", () => {
    const payload = normalizeInvitationPayload({
      templateSnapshot: {
        templateAssetId: "wedding-classic",
        templateAssetVersion: 3,
        backgroundImageUrl: "/images/custom/wedding/wedding-01.jpeg",
        canvas: { width: 1080, height: 1920 },
        safeAreas: {},
        photoSlots: [],
        palette: {},
        typography: {}
      }
    });

    expect(payload.templateAssetVersion).toBe(3);
    expect(payload.templateAssetId).toBe("wedding-classic");
    expect(payload.templateSnapshot?.templateAssetVersion).toBe(3);
    expect(payload.templateSnapshot?.backgroundImageUrl).toBe("/images/custom/wedding/wedding-01.jpeg");
  });

  it("preserves audience variant metadata", () => {
    const payload = normalizeInvitationPayload({
      audience: {
        variantId: "variant-1",
        audienceKey: "friends",
        label: "친구용",
        slug: "kim-lee-friends"
      }
    });

    expect(payload.audience).toEqual({
      variantId: "variant-1",
      audienceKey: "friends",
      label: "친구용",
      slug: "kim-lee-friends"
    });
  });
});
