import { getInviteHubBaseUrl } from "./web-links";

export type MapApiConfig = {
  kakao: {
    enabled: boolean;
  };
  naver: {
    enabled: boolean;
  };
};

const DISABLED_MAP_API_CONFIG: MapApiConfig = {
  kakao: {
    enabled: false
  },
  naver: {
    enabled: false
  }
};

type Fetcher = typeof fetch;

function hasPublicValue(value: string | undefined) {
  return Boolean(value?.trim());
}

function parseEnabled(value: unknown) {
  return typeof value === "object" && value !== null && "enabled" in value && value.enabled === true;
}

export function normalizeMapApiConfig(value: unknown): MapApiConfig {
  if (typeof value !== "object" || value === null) {
    return DISABLED_MAP_API_CONFIG;
  }

  const candidate = value as { kakao?: unknown; naver?: unknown };

  return {
    kakao: {
      enabled: parseEnabled(candidate.kakao)
    },
    naver: {
      enabled: parseEnabled(candidate.naver)
    }
  };
}

export function getMapApiConfigUrl(baseUrl?: string) {
  return new URL("/api/maps/config", `${getInviteHubBaseUrl(baseUrl)}/`).toString();
}

export function getLocalMapApiConfig(): MapApiConfig {
  return {
    kakao: {
      enabled: hasPublicValue(process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY)
    },
    naver: {
      enabled: hasPublicValue(process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID)
    }
  };
}

export function mergeMapApiConfig(remoteConfig: MapApiConfig, localConfig = getLocalMapApiConfig()): MapApiConfig {
  return {
    kakao: {
      enabled: remoteConfig.kakao.enabled || localConfig.kakao.enabled
    },
    naver: {
      enabled: remoteConfig.naver.enabled || localConfig.naver.enabled
    }
  };
}

export async function fetchMapApiConfig(baseUrl?: string, fetcher: Fetcher = fetch): Promise<MapApiConfig> {
  const response = await fetcher(getMapApiConfigUrl(baseUrl), {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("지도 연결 정보를 불러오지 못했습니다.");
  }

  return mergeMapApiConfig(normalizeMapApiConfig(await response.json()));
}

export function getMapApiStatusLabel(config: MapApiConfig | null) {
  if (!config) {
    return "지도 연결 상태 확인 중";
  }

  if (config.kakao.enabled && config.naver.enabled) {
    return "카카오 · 네이버 지도 연결됨";
  }

  if (config.kakao.enabled) {
    return "카카오 지도 연결됨 · 네이버 지도는 주소로 열림";
  }

  if (config.naver.enabled) {
    return "네이버 지도 연결됨 · 카카오 지도는 주소로 열림";
  }

  return "주소로 지도를 열 수 있습니다.";
}
