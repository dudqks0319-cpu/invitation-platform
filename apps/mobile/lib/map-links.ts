import type { InvitationPayload } from "./invitation-shared";

const NAVER_MAP_WEB_ORIGIN = "https://map.naver.com";
const KAKAO_MAP_WEB_ORIGIN = "https://map.kakao.com";

type MapLinkInput = Pick<InvitationPayload, "venueName" | "venueAddress"> & {
  location: Pick<InvitationPayload["location"], "naverMapUrl" | "transportNote"> & {
    kakaoMapUrl?: string;
  };
};

export type InvitationMapLinks = {
  query: string;
  naverUrl: string;
  naverFallbackUrl: string;
  kakaoUrl: string;
};

function normalizeExternalUrl(value?: string) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "";

  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function getMapSearchQuery(payload: Pick<InvitationPayload, "venueName" | "venueAddress">) {
  return [payload.venueName, payload.venueAddress].map((item) => item.trim()).filter(Boolean).join(" ");
}

export function getNaverMapSearchUrl(query: string) {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return "";

  return `nmap://search?query=${encodeURIComponent(normalizedQuery)}&appname=com.invitehub.app`;
}

export function getNaverMapWebSearchUrl(query: string) {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return "";

  return `${NAVER_MAP_WEB_ORIGIN}/p/search/${encodeURIComponent(normalizedQuery)}`;
}

export function getKakaoMapSearchUrl(query: string) {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return "";

  return `${KAKAO_MAP_WEB_ORIGIN}/link/search/${encodeURIComponent(normalizedQuery)}`;
}

export function getInvitationMapLinks(payload: MapLinkInput): InvitationMapLinks {
  const query = getMapSearchQuery(payload);
  const naverFallbackUrl = getNaverMapWebSearchUrl(query);

  return {
    query,
    naverUrl: normalizeExternalUrl(payload.location.naverMapUrl) || getNaverMapSearchUrl(query),
    naverFallbackUrl,
    kakaoUrl: normalizeExternalUrl(payload.location.kakaoMapUrl) || getKakaoMapSearchUrl(query)
  };
}
