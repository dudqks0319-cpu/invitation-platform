import { getInviteHubBaseUrl } from "./web-links";

export type KakaoAddressPreview = {
  canonicalAddress: string;
  latitude: number;
  longitude: number;
  imageDataUrl: string;
  kakaoUrl: string;
};

type Fetcher = typeof fetch;

export function getKakaoAddressPreviewUrl(baseUrl?: string) {
  return new URL("/api/maps/address-preview", `${getInviteHubBaseUrl(baseUrl)}/`).toString();
}

export async function fetchKakaoAddressPreview(
  address: string,
  fetcher: Fetcher = fetch,
  baseUrl?: string
): Promise<KakaoAddressPreview> {
  const normalizedAddress = address.trim().replace(/\s+/g, " ");
  if (!normalizedAddress) {
    throw new Error("도로명주소를 입력해 주세요.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetcher(getKakaoAddressPreviewUrl(baseUrl), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ address: normalizedAddress }),
      signal: controller.signal
    });
    const result = (await response.json().catch(() => ({}))) as Partial<KakaoAddressPreview> & {
      success?: boolean;
      message?: string;
    };

    if (
      !response.ok ||
      !result.success ||
      !result.canonicalAddress ||
      !result.imageDataUrl?.startsWith("data:image/") ||
      !Number.isFinite(result.latitude) ||
      !Number.isFinite(result.longitude)
    ) {
      throw new Error(result.message || "카카오에서 도로명주소를 확인하지 못했습니다.");
    }

    return {
      canonicalAddress: result.canonicalAddress,
      latitude: result.latitude as number,
      longitude: result.longitude as number,
      imageDataUrl: result.imageDataUrl,
      kakaoUrl: result.kakaoUrl || `https://map.kakao.com/link/search/${encodeURIComponent(result.canonicalAddress)}`
    };
  } catch (caught) {
    if (caught instanceof Error && caught.name === "AbortError") {
      throw new Error("카카오 지도 응답이 지연되고 있습니다. 다시 시도해 주세요.");
    }
    throw caught;
  } finally {
    clearTimeout(timeout);
  }
}
