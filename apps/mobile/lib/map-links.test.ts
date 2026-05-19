import { describe, expect, it } from "vitest";
import { createEmptyInvitationDraft } from "./invitation-shared";
import {
  getInvitationMapLinks,
  getKakaoMapWebSearchUrl,
  getKakaoMapSearchUrl,
  getMapSearchQuery,
  getNaverMapSearchUrl,
  getNaverMapWebSearchUrl
} from "./map-links";

describe("mobile map links", () => {
  it("builds a stable venue search query", () => {
    expect(getMapSearchQuery({ venueName: "더파인 웨딩홀", venueAddress: "서울 강남구 테헤란로 123" })).toBe(
      "더파인 웨딩홀 서울 강남구 테헤란로 123"
    );
  });

  it("builds Kakao and Naver search targets from a venue query", () => {
    const query = "더파인 웨딩홀 서울 강남구";

    expect(getKakaoMapSearchUrl(query)).toBe(
      "kakaomap://search?q=%EB%8D%94%ED%8C%8C%EC%9D%B8%20%EC%9B%A8%EB%94%A9%ED%99%80%20%EC%84%9C%EC%9A%B8%20%EA%B0%95%EB%82%A8%EA%B5%AC"
    );
    expect(getKakaoMapWebSearchUrl(query)).toBe(
      "https://map.kakao.com/link/search/%EB%8D%94%ED%8C%8C%EC%9D%B8%20%EC%9B%A8%EB%94%A9%ED%99%80%20%EC%84%9C%EC%9A%B8%20%EA%B0%95%EB%82%A8%EA%B5%AC"
    );
    expect(getNaverMapSearchUrl(query)).toBe(
      "nmap://search?query=%EB%8D%94%ED%8C%8C%EC%9D%B8%20%EC%9B%A8%EB%94%A9%ED%99%80%20%EC%84%9C%EC%9A%B8%20%EA%B0%95%EB%82%A8%EA%B5%AC&appname=com.invitehub.app"
    );
    expect(getNaverMapWebSearchUrl(query)).toBe(
      "https://map.naver.com/p/search/%EB%8D%94%ED%8C%8C%EC%9D%B8%20%EC%9B%A8%EB%94%A9%ED%99%80%20%EC%84%9C%EC%9A%B8%20%EA%B0%95%EB%82%A8%EA%B5%AC"
    );
  });

  it("prefers explicit map urls when the draft has them", () => {
    const payload = createEmptyInvitationDraft("owner-1").payload;
    payload.venueName = "더파인 웨딩홀";
    payload.venueAddress = "서울 강남구";
    payload.location.naverMapUrl = "map.naver.com/p/entry/place/123";
    payload.location.kakaoMapUrl = "https://place.map.kakao.com/123";

    expect(getInvitationMapLinks(payload)).toMatchObject({
      naverUrl: "https://map.naver.com/p/entry/place/123",
      kakaoUrl: "https://place.map.kakao.com/123",
      kakaoFallbackUrl: "https://map.kakao.com/link/search/%EB%8D%94%ED%8C%8C%EC%9D%B8%20%EC%9B%A8%EB%94%A9%ED%99%80%20%EC%84%9C%EC%9A%B8%20%EA%B0%95%EB%82%A8%EA%B5%AC"
    });
  });
});
