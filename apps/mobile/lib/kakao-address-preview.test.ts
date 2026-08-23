import { describe, expect, it, vi } from "vitest";
import { fetchKakaoAddressPreview, getKakaoAddressPreviewUrl } from "./kakao-address-preview";

describe("mobile Kakao address preview", () => {
  it("posts a trimmed road address to the web server and returns the static map", async () => {
    const fetcher = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      expect(JSON.parse(String(init?.body))).toEqual({ address: "서울 강남구 테헤란로 123" });
      return new Response(JSON.stringify({
        success: true,
        canonicalAddress: "서울 강남구 테헤란로 123",
        latitude: 37.5,
        longitude: 127.1,
        imageDataUrl: "data:image/png;base64,iVBORw0KGgo="
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    });

    const result = await fetchKakaoAddressPreview("  서울 강남구 테헤란로 123  ", fetcher);

    expect(getKakaoAddressPreviewUrl("https://invite.test")).toBe("https://invite.test/api/maps/address-preview");
    expect(result.canonicalAddress).toBe("서울 강남구 테헤란로 123");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("surfaces server failures and rejects empty input without a request", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({
      success: false,
      message: "카카오 지도 설정이 필요합니다."
    }), { status: 503, headers: { "Content-Type": "application/json" } }));

    await expect(fetchKakaoAddressPreview("서울 강남구", fetcher)).rejects.toThrow("카카오 지도 설정이 필요합니다.");
    await expect(fetchKakaoAddressPreview(" ", fetcher)).rejects.toThrow("도로명주소를 입력해 주세요.");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
