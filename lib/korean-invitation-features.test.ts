import {
  buildKakaoMapSearchUrl,
  buildKakaoSharePayload,
  buildNaverMapSearchUrl,
  buildNaverMapScriptSrc,
  getNaverMapCoordinates,
  resolveKakaoJavaScriptKey
} from "@/lib/korean-invitation-features";
import { normalizeDraft } from "@/lib/invitation-payload";

describe("Korean invitation feature helpers", () => {
  it("extracts valid Naver map coordinates from the invitation payload", () => {
    const payload = normalizeDraft({
      mapLatitude: "37.5665",
      mapLongitude: "126.9780"
    });

    expect(getNaverMapCoordinates(payload)).toEqual({
      latitude: 37.5665,
      longitude: 126.978
    });
  });

  it("ignores invalid or incomplete Naver map coordinates", () => {
    expect(getNaverMapCoordinates(normalizeDraft({ mapLatitude: "37.5" }))).toBeNull();
    expect(getNaverMapCoordinates(normalizeDraft({ mapLatitude: "abc", mapLongitude: "126.9" }))).toBeNull();
    expect(getNaverMapCoordinates(normalizeDraft({ mapLatitude: "120", mapLongitude: "126.9" }))).toBeNull();
  });

  it("builds Korean map search links from the best available address", () => {
    const payload = normalizeDraft({
      mapAddress: "서울 강남구 테헤란로 123",
      venueAddress: "fallback address",
      venueName: "더파인 웨딩홀"
    });

    expect(buildNaverMapSearchUrl(payload)).toBe(
      "https://map.naver.com/p/search/%EC%84%9C%EC%9A%B8%20%EA%B0%95%EB%82%A8%EA%B5%AC%20%ED%85%8C%ED%97%A4%EB%9E%80%EB%A1%9C%20123"
    );
    expect(buildKakaoMapSearchUrl(payload)).toBe(
      "https://map.kakao.com/link/search/%EC%84%9C%EC%9A%B8%20%EA%B0%95%EB%82%A8%EA%B5%AC%20%ED%85%8C%ED%97%A4%EB%9E%80%EB%A1%9C%20123"
    );
  });

  it("uses the platform Kakao JavaScript key before a draft-level fallback key", () => {
    expect(resolveKakaoJavaScriptKey("draft-key", "platform-key")).toBe("platform-key");
    expect(resolveKakaoJavaScriptKey("draft-key", "")).toBe("draft-key");
  });

  it("creates a Kakao feed share payload when a shareable image exists", () => {
    const payload = normalizeDraft({
      title: "우리 결혼합니다",
      message: "소중한 분들을 초대합니다.",
      mainImageUrl: "https://cdn.example.com/main.jpg"
    });

    expect(buildKakaoSharePayload(payload, "https://invitehub.test/invitations/demo")).toMatchObject({
      objectType: "feed",
      content: {
        title: "우리 결혼합니다",
        description: "소중한 분들을 초대합니다.",
        imageUrl: "https://cdn.example.com/main.jpg",
        link: {
          mobileWebUrl: "https://invitehub.test/invitations/demo",
          webUrl: "https://invitehub.test/invitations/demo"
        }
      }
    });
  });

  it("falls back to a Kakao text share payload without a public image", () => {
    const payload = normalizeDraft({
      title: "초대장",
      message: "함께해 주세요.",
      mainImageUrl: "data:image/png;base64,abc"
    });

    expect(buildKakaoSharePayload(payload, "https://invitehub.test/invitations/demo")).toEqual({
      objectType: "text",
      text: "초대장\n함께해 주세요.",
      link: {
        mobileWebUrl: "https://invitehub.test/invitations/demo",
        webUrl: "https://invitehub.test/invitations/demo"
      },
      buttonTitle: "초대장 보기"
    });
  });

  it("builds the Naver Maps JavaScript SDK URL with the NCP key id", () => {
    expect(buildNaverMapScriptSrc(" naver-key ")).toBe(
      "https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=naver-key"
    );
  });
});
