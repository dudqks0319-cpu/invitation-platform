import type { InvitationDraftPayload } from "@/lib/invitation-payload";

type MapPayload = Pick<
  InvitationDraftPayload,
  "mapAddress" | "mapLatitude" | "mapLongitude" | "naverMapLink" | "venueAddress" | "venueName"
>;

type SharePayload = Pick<
  InvitationDraftPayload,
  "backgroundImageUrl" | "mainImageUrl" | "message" | "title"
>;

type KakaoShareLink = {
  mobileWebUrl: string;
  webUrl: string;
};

type KakaoTextSharePayload = {
  objectType: "text";
  text: string;
  link: KakaoShareLink;
  buttonTitle: string;
};

type KakaoFeedSharePayload = {
  objectType: "feed";
  content: {
    title: string;
    description: string;
    imageUrl: string;
    link: KakaoShareLink;
  };
  buttons: Array<{
    title: string;
    link: KakaoShareLink;
  }>;
};

export type KakaoDefaultSharePayload = KakaoTextSharePayload | KakaoFeedSharePayload;

function trim(value: string | undefined | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeExternalUrl(value: string) {
  return /^https?:\/\//i.test(value.trim()) ? value.trim() : "";
}

function getMapQuery(payload: MapPayload) {
  return trim(payload.mapAddress) || trim(payload.venueAddress) || trim(payload.venueName) || "행사장";
}

function parseCoordinate(value: string, min: number, max: number) {
  const normalized = trim(value);

  if (!normalized) {
    return null;
  }

  const numberValue = Number(normalized);

  if (!Number.isFinite(numberValue) || numberValue < min || numberValue > max) {
    return null;
  }

  return numberValue;
}

export function getNaverMapCoordinates(payload: MapPayload) {
  const latitude = parseCoordinate(payload.mapLatitude, -90, 90);
  const longitude = parseCoordinate(payload.mapLongitude, -180, 180);

  if (latitude === null || longitude === null) {
    return null;
  }

  return { latitude, longitude };
}

export function buildNaverMapSearchUrl(payload: MapPayload) {
  return `https://map.naver.com/p/search/${encodeURIComponent(getMapQuery(payload))}`;
}

export function buildKakaoMapSearchUrl(payload: MapPayload) {
  return `https://map.kakao.com/link/search/${encodeURIComponent(getMapQuery(payload))}`;
}

export function getNaverMapLink(payload: MapPayload) {
  return normalizeExternalUrl(payload.naverMapLink) || buildNaverMapSearchUrl(payload);
}

export function buildNaverMapScriptSrc(clientId: string) {
  const key = trim(clientId);

  if (!key) {
    return "";
  }

  return `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(key)}`;
}

export function resolveKakaoJavaScriptKey(draftKey: string, platformKey: string | undefined) {
  return trim(platformKey) || trim(draftKey);
}

function buildShareLink(shareUrl: string): KakaoShareLink {
  return {
    mobileWebUrl: shareUrl,
    webUrl: shareUrl
  };
}

function toAbsolutePublicImageUrl(imageUrl: string, shareUrl: string) {
  const candidate = trim(imageUrl);

  if (!candidate || candidate.startsWith("data:") || candidate.startsWith("blob:")) {
    return "";
  }

  if (/^https?:\/\//i.test(candidate)) {
    return candidate;
  }

  try {
    return new URL(candidate, shareUrl).toString();
  } catch {
    return "";
  }
}

export function getKakaoShareImageUrl(payload: SharePayload, shareUrl: string) {
  return (
    toAbsolutePublicImageUrl(payload.mainImageUrl, shareUrl) ||
    toAbsolutePublicImageUrl(payload.backgroundImageUrl, shareUrl)
  );
}

export function buildKakaoSharePayload(payload: SharePayload, shareUrl: string): KakaoDefaultSharePayload {
  const title = trim(payload.title) || "InviteHub 초대장";
  const description = trim(payload.message) || "모바일 초대장을 확인해 주세요.";
  const link = buildShareLink(shareUrl);
  const imageUrl = getKakaoShareImageUrl(payload, shareUrl);

  if (imageUrl) {
    return {
      objectType: "feed",
      content: {
        title,
        description,
        imageUrl,
        link
      },
      buttons: [
        {
          title: "초대장 보기",
          link
        }
      ]
    };
  }

  return {
    objectType: "text",
    text: `${title}\n${description}`,
    link,
    buttonTitle: "초대장 보기"
  };
}
