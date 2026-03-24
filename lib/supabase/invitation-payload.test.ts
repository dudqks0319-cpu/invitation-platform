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

  it("maps legacy mapAddress into venueAddress", () => {
    const payload = normalizeInvitationPayload({
      mapAddress: "서울 중구 세종대로 1"
    });

    expect(payload.venueAddress).toBe("서울 중구 세종대로 1");
    expect("mapAddress" in payload).toBe(false);
    expect("kakaoJsKey" in payload).toBe(false);
  });
});
