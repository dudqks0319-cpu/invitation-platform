import { describe, expect, it, vi } from "vitest";
import {
  fetchMapApiConfig,
  getLocalMapApiConfig,
  getMapApiConfigUrl,
  getMapApiStatusLabel,
  mergeMapApiConfig,
  normalizeMapApiConfig
} from "./map-api-config";

describe("mobile map API config", () => {
  it("builds the Vercel map config API URL from the mobile web base URL", () => {
    expect(getMapApiConfigUrl("https://invitation-platform-plum.vercel.app/")).toBe(
      "https://invitation-platform-plum.vercel.app/api/maps/config"
    );
  });

  it("normalizes public provider enabled flags without exposing keys", () => {
    expect(
      normalizeMapApiConfig({
        kakao: { enabled: true, addressPreviewEnabled: true, jsKey: "public-kakao-key" },
        naver: { enabled: false, clientId: "" }
      })
    ).toEqual({
      kakao: { enabled: true, addressPreviewEnabled: true },
      naver: { enabled: false }
    });
  });

  it("fetches the map config through the provided fetcher", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        kakao: { enabled: true, addressPreviewEnabled: true, jsKey: "public-kakao-key" },
        naver: { enabled: true, clientId: "public-naver-client-id" }
      })
    });

    await expect(fetchMapApiConfig("https://invitehub.test/", fetcher)).resolves.toEqual({
      kakao: { enabled: true, addressPreviewEnabled: true },
      naver: { enabled: true }
    });
    expect(fetcher).toHaveBeenCalledWith("https://invitehub.test/api/maps/config", {
      headers: {
        Accept: "application/json"
      }
    });
  });

  it("can enable providers from local Expo public env as a fallback", () => {
    const previousKakao = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY;
    const previousNaver = process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID;
    process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY = "kakao-native-key";
    process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID = "naver-client-id";

    try {
      expect(getLocalMapApiConfig()).toEqual({
        kakao: { enabled: true, addressPreviewEnabled: false },
        naver: { enabled: true }
      });
      expect(
        mergeMapApiConfig({
          kakao: { enabled: false, addressPreviewEnabled: false },
          naver: { enabled: false }
        })
      ).toEqual({
        kakao: { enabled: true, addressPreviewEnabled: false },
        naver: { enabled: true }
      });
    } finally {
      process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY = previousKakao;
      process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID = previousNaver;
    }
  });

  it("summarizes the provider connection state", () => {
    expect(getMapApiStatusLabel(null)).toBe("지도 API 상태 확인 중");
    expect(getMapApiStatusLabel({ kakao: { enabled: true, addressPreviewEnabled: false }, naver: { enabled: false } })).toBe(
      "카카오 지도 API 연동됨 · 네이버 지도는 외부 링크로 열림"
    );
    expect(getMapApiStatusLabel({ kakao: { enabled: true, addressPreviewEnabled: false }, naver: { enabled: true } })).toBe(
      "카카오 · 네이버 지도 API 연동됨"
    );
    expect(getMapApiStatusLabel({ kakao: { enabled: true, addressPreviewEnabled: true }, naver: { enabled: false } })).toBe(
      "카카오 도로명주소 지도 연동됨 · 네이버 지도는 외부 링크로 열림"
    );
  });
});
