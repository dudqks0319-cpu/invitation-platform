"use client";

import { useEffect, useMemo, useState } from "react";

type MapConfig = {
  kakao: {
    configured?: boolean;
    enabled: boolean;
    jsKey: string;
    status?: string;
  };
  naver: {
    clientId: string;
    configured?: boolean;
    enabled: boolean;
    status?: string;
  };
};

type Coordinates = {
  lat: number;
  lng: number;
};
type MapProvider = "kakao" | "naver";
type ProviderState = Record<MapProvider, boolean>;

type InvitationMapEmbedProps = {
  kakaoMapLink: string;
  naverMapLink: string;
  query: string;
};
type NaverGeocodeResponse = {
  v2?: {
    addresses?: Array<{ x: string; y: string }>;
  };
};

type KakaoMapSdk = {
  maps: {
    LatLng: new (lat: number, lng: number) => unknown;
    Map: new (container: HTMLElement, options: { center: unknown; level: number }) => unknown;
    Marker: new (options: { map: unknown; position: unknown }) => unknown;
    load(callback: () => void): void;
    services: {
      Geocoder: new () => {
        addressSearch(
          query: string,
          callback: (
            result: Array<{ x: string; y: string }>,
            status: string
          ) => void
        ): void;
      };
      Places: new () => {
        keywordSearch(
          query: string,
          callback: (
            result: Array<{ x: string; y: string }>,
            status: string
          ) => void
        ): void;
      };
      Status: {
        OK: string;
      };
    };
  };
};

type NaverMapSdk = {
  maps: {
    LatLng: new (lat: number, lng: number) => unknown;
    Map: new (container: HTMLElement, options: { center: unknown; zoom: number }) => unknown;
    Marker: new (options: { map: unknown; position: unknown }) => unknown;
    Service?: {
      Status: {
        OK: string;
      };
      geocode(
        options: { query: string },
        callback: (status: string, response: NaverGeocodeResponse) => void
      ): void;
    };
  };
};

declare global {
  interface Window {
    kakao?: KakaoMapSdk;
    naver?: NaverMapSdk;
  }
}

let kakaoMapScriptPromise: Promise<KakaoMapSdk | null> | null = null;
let naverMapScriptPromise: Promise<NaverMapSdk | null> | null = null;
const emptyProviderState: ProviderState = {
  kakao: false,
  naver: false
};

function appendScript(id: string, src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loadState === "loaded") {
        resolve();
        return;
      }

      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`${id} load failed`)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.async = true;
    script.src = src;
    script.dataset.loadState = "loading";
    script.onload = () => {
      script.dataset.loadState = "loaded";
      resolve();
    };
    script.onerror = () => {
      script.dataset.loadState = "error";
      reject(new Error(`${id} load failed`));
    };
    document.head.appendChild(script);
  });
}

async function getMapConfig() {
  const response = await fetch("/api/maps/config", {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("지도 설정을 불러오지 못했습니다.");
  }

  return (await response.json()) as MapConfig;
}

async function loadKakaoMaps(jsKey: string) {
  if (!jsKey || typeof window === "undefined") return null;
  if (window.kakao?.maps?.services) return window.kakao;

  if (!kakaoMapScriptPromise) {
    const src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(jsKey)}&libraries=services&autoload=false`;
    kakaoMapScriptPromise = appendScript("kakao-map-sdk", src).then(
      () =>
        new Promise<KakaoMapSdk | null>((resolve) => {
          const kakao = window.kakao;
          if (!kakao?.maps) {
            resolve(null);
            return;
          }

          kakao.maps.load(() => resolve(kakao));
        })
    ).catch((error) => {
      kakaoMapScriptPromise = null;
      throw error;
    });
  }

  return kakaoMapScriptPromise;
}

async function loadNaverMaps(clientId: string) {
  if (!clientId || typeof window === "undefined") return null;
  if (window.naver?.maps) return window.naver;

  if (!naverMapScriptPromise) {
    const src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}&submodules=geocoder`;
    naverMapScriptPromise = appendScript("naver-map-sdk", src)
      .then(() => window.naver ?? null)
      .catch((error) => {
        naverMapScriptPromise = null;
        throw error;
      });
  }

  return naverMapScriptPromise;
}

function readCoordinates(result: Array<{ x: string; y: string }>): Coordinates | null {
  const first = result[0];
  if (!first) return null;

  const lat = Number(first.y);
  const lng = Number(first.x);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
}

function readNaverCoordinates(response: NaverGeocodeResponse): Coordinates | null {
  return readCoordinates(response.v2?.addresses ?? []);
}

function activeProviderFrom(renderedProviders: ProviderState, preferredProvider: MapProvider) {
  if (renderedProviders[preferredProvider]) return preferredProvider;
  if (renderedProviders.kakao) return "kakao";
  if (renderedProviders.naver) return "naver";
  return preferredProvider;
}

function geocodeWithKakao(kakao: KakaoMapSdk, mapQuery: string) {
  return new Promise<Coordinates | null>((resolve) => {
    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.addressSearch(mapQuery, (addressResult, addressStatus) => {
      const foundByAddress =
        addressStatus === kakao.maps.services.Status.OK
          ? readCoordinates(addressResult)
          : null;

      if (foundByAddress) {
        resolve(foundByAddress);
        return;
      }

      const places = new kakao.maps.services.Places();
      places.keywordSearch(mapQuery, (keywordResult, keywordStatus) => {
        resolve(
          keywordStatus === kakao.maps.services.Status.OK
            ? readCoordinates(keywordResult)
            : null
        );
      });
    });
  });
}

function geocodeWithNaver(naver: NaverMapSdk, mapQuery: string) {
  const service = naver.maps.Service;
  if (!service?.geocode) return Promise.resolve(null);

  return new Promise<Coordinates | null>((resolve) => {
    service.geocode({ query: mapQuery }, (status, response) => {
      resolve(status === service.Status.OK ? readNaverCoordinates(response) : null);
    });
  });
}

function renderKakaoMap(kakao: KakaoMapSdk, container: HTMLElement, coordinates: Coordinates) {
  const center = new kakao.maps.LatLng(coordinates.lat, coordinates.lng);
  const map = new kakao.maps.Map(container, {
    center,
    level: 3
  });

  new kakao.maps.Marker({
    map,
    position: center
  });
}

function renderNaverMap(naver: NaverMapSdk, container: HTMLElement, coordinates: Coordinates) {
  const center = new naver.maps.LatLng(coordinates.lat, coordinates.lng);
  const map = new naver.maps.Map(container, {
    center,
    zoom: 16
  });

  new naver.maps.Marker({
    map,
    position: center
  });
}

export function InvitationMapEmbed({
  kakaoMapLink,
  naverMapLink,
  query
}: InvitationMapEmbedProps) {
  const [activeProvider, setActiveProvider] = useState<MapProvider>("kakao");
  const [renderedProviders, setRenderedProviders] = useState<ProviderState>(emptyProviderState);
  const [message, setMessage] = useState("지도를 불러오는 중이에요.");
  const mapQuery = useMemo(() => query.trim(), [query]);
  const fallbackEmbedUrl = useMemo(
    () => mapQuery ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed` : "",
    [mapQuery]
  );
  const visibleProvider = activeProviderFrom(renderedProviders, activeProvider);
  const hasEmbeddedMap = renderedProviders.kakao || renderedProviders.naver;

  useEffect(() => {
    let cancelled = false;

    async function loadMaps() {
      if (!mapQuery) {
        setRenderedProviders(emptyProviderState);
        setMessage("장소를 입력하면 지도가 여기에 보여요.");
        return;
      }

      try {
        const config = await getMapConfig();
        if (cancelled) return;

        setRenderedProviders(emptyProviderState);

        if (!config.kakao.enabled && !config.naver.enabled) {
          setMessage("장소를 확인해 보세요. 길찾기는 아래 버튼에서 바로 열 수 있어요.");
          return;
        }

        const nextRenderedProviders: ProviderState = { ...emptyProviderState };
        let sharedCoordinates: Coordinates | null = null;
        let failureMessage = "";

        if (config.kakao.enabled) {
          try {
            const kakao = await loadKakaoMaps(config.kakao.jsKey);
            if (cancelled) return;

            if (kakao) {
              const coordinates = await geocodeWithKakao(kakao, mapQuery);
              if (cancelled) return;

              const kakaoContainer = document.getElementById("invitation-kakao-map");
              if (coordinates && kakaoContainer) {
                renderKakaoMap(kakao, kakaoContainer, coordinates);
                sharedCoordinates = coordinates;
                nextRenderedProviders.kakao = true;
              } else {
                failureMessage = "주소 좌표를 찾지 못했습니다. 아래 지도 앱 버튼을 사용해 주세요.";
              }
            } else {
              failureMessage =
                "카카오 지도 API 서비스가 비활성화되어 내장 지도를 표시하지 못했습니다. 아래 지도 앱 버튼을 사용해 주세요.";
            }
          } catch {
            nextRenderedProviders.kakao = false;
            failureMessage =
              "카카오 지도 API를 불러오지 못했습니다. 카카오 개발자 콘솔의 지도/로컬 서비스와 도메인 설정을 확인해 주세요.";
          }
        }

        if (config.naver.enabled) {
          try {
            const naver = await loadNaverMaps(config.naver.clientId);
            if (cancelled) return;

            if (naver) {
              const coordinates = sharedCoordinates ?? (await geocodeWithNaver(naver, mapQuery));
              const naverContainer = document.getElementById("invitation-naver-map");

              if (coordinates && naverContainer) {
                renderNaverMap(naver, naverContainer, coordinates);
                sharedCoordinates = coordinates;
                nextRenderedProviders.naver = true;
              }
            }
          } catch {
            nextRenderedProviders.naver = false;
          }
        }

        if (cancelled) return;

        setRenderedProviders(nextRenderedProviders);
        setActiveProvider(activeProviderFrom(nextRenderedProviders, "kakao"));

        if (nextRenderedProviders.kakao && nextRenderedProviders.naver) {
          setMessage("카카오 지도와 네이버 지도를 모두 표시합니다.");
        } else if (nextRenderedProviders.kakao) {
          setMessage("카카오 지도를 표시합니다. 네이버 지도는 버튼으로 열 수 있습니다.");
        } else if (nextRenderedProviders.naver) {
          setMessage("네이버 지도를 표시합니다. 카카오맵은 버튼으로 열 수 있습니다.");
        } else {
          setMessage(
            failureMessage
              ? "지도 앱 연결은 아래 버튼에서 바로 열 수 있어요."
              : "장소를 확인해 보세요. 길찾기는 아래 버튼에서 바로 열 수 있어요."
          );
        }
      } catch {
        if (!cancelled) {
          setRenderedProviders(emptyProviderState);
          setMessage("장소를 확인해 보세요. 길찾기는 아래 버튼에서 바로 열 수 있어요.");
        }
      }
    }

    void loadMaps();

    return () => {
      cancelled = true;
    };
  }, [mapQuery]);

  return (
    <div className="invitation-map-panel">
      {hasEmbeddedMap ? (
        <div className="invitation-map-tabs" role="tablist" aria-label="지도 제공자">
          {renderedProviders.kakao ? (
            <button
              aria-selected={visibleProvider === "kakao"}
              className={visibleProvider === "kakao" ? "active" : ""}
              onClick={() => setActiveProvider("kakao")}
              role="tab"
              type="button"
            >
              카카오 지도
            </button>
          ) : null}
          {renderedProviders.naver ? (
            <button
              aria-selected={visibleProvider === "naver"}
              className={visibleProvider === "naver" ? "active" : ""}
              onClick={() => setActiveProvider("naver")}
              role="tab"
              type="button"
            >
              네이버 지도
            </button>
          ) : null}
        </div>
      ) : null}
      <div className="invitation-map-stack">
        <div
          aria-label="카카오 지도 표시 영역"
          className={`invitation-map-canvas ${visibleProvider === "kakao" && renderedProviders.kakao ? "active" : ""}`}
          id="invitation-kakao-map"
          role="tabpanel"
        />
        <div
          aria-label="네이버 지도 표시 영역"
          className={`invitation-map-canvas ${visibleProvider === "naver" && renderedProviders.naver ? "active" : ""}`}
          id="invitation-naver-map"
          role="tabpanel"
        />
        {!hasEmbeddedMap ? (
          <div className="invitation-map-canvas active">
            {fallbackEmbedUrl ? (
              <iframe
                allowFullScreen
                className="invitation-map-fallback-frame"
                loading="eager"
                referrerPolicy="no-referrer-when-downgrade"
                src={fallbackEmbedUrl}
                title="행사장 지도 미리보기"
              />
            ) : (
              <div className="invitation-map-empty">{message}</div>
            )}
          </div>
        ) : null}
      </div>
      <p className="invitation-map-status">{message}</p>
      <div className="invitation-inline-actions">
        <a className="btn-primary invitation-small-btn" href={naverMapLink} rel="noreferrer noopener" target="_blank">
          네이버 지도 열기
        </a>
        <a className="btn-outline invitation-small-btn" href={kakaoMapLink} rel="noreferrer noopener" target="_blank">
          카카오맵 열기
        </a>
      </div>
    </div>
  );
}
