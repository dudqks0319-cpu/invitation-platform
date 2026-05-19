"use client";

import { useEffect, useMemo, useState } from "react";

type MapConfig = {
  kakao: {
    enabled: boolean;
    jsKey: string;
  };
  naver: {
    clientId: string;
    enabled: boolean;
  };
};

type Coordinates = {
  lat: number;
  lng: number;
};

type InvitationMapEmbedProps = {
  kakaoMapLink: string;
  naverMapLink: string;
  query: string;
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

function appendScript(id: string, src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`${id} load failed`)), { once: true });
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.async = true;
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`${id} load failed`));
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
    );
  }

  return kakaoMapScriptPromise;
}

async function loadNaverMaps(clientId: string) {
  if (!clientId || typeof window === "undefined") return null;
  if (window.naver?.maps) return window.naver;

  if (!naverMapScriptPromise) {
    const src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}`;
    naverMapScriptPromise = appendScript("naver-map-sdk", src).then(() => window.naver ?? null);
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
  const [activeProvider, setActiveProvider] = useState<"kakao" | "naver">("kakao");
  const [message, setMessage] = useState("지도를 준비하고 있습니다.");
  const [naverEnabled, setNaverEnabled] = useState(false);
  const mapQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    let cancelled = false;

    async function loadMaps() {
      if (!mapQuery) {
        setMessage("주소를 입력하면 지도를 표시합니다.");
        return;
      }

      try {
        const config = await getMapConfig();
        if (cancelled) return;

        setNaverEnabled(config.naver.enabled);

        if (!config.kakao.enabled) {
          setMessage("카카오 지도 JavaScript 키가 설정되지 않았습니다.");
          return;
        }

        const kakao = await loadKakaoMaps(config.kakao.jsKey);
        if (cancelled) return;

        if (!kakao) {
          setMessage("카카오 지도를 불러오지 못했습니다.");
          return;
        }

        const coordinates = await new Promise<Coordinates | null>((resolve) => {
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

        if (cancelled) return;

        if (!coordinates) {
          setMessage("지도 좌표를 찾지 못했습니다. 아래 지도 앱 버튼을 사용해 주세요.");
          return;
        }

        const kakaoContainer = document.getElementById("invitation-kakao-map");
        if (kakaoContainer) {
          renderKakaoMap(kakao, kakaoContainer, coordinates);
        }

        if (config.naver.enabled) {
          const naver = await loadNaverMaps(config.naver.clientId);
          if (!cancelled && naver) {
            const naverContainer = document.getElementById("invitation-naver-map");
            if (naverContainer) {
              renderNaverMap(naver, naverContainer, coordinates);
            }
          }
        }

        setMessage(
          config.naver.enabled
            ? "카카오 지도와 네이버 지도를 표시합니다."
            : "카카오 지도를 표시합니다. 네이버 지도 API 키가 없으면 버튼으로 열립니다."
        );
      } catch {
        if (!cancelled) {
          setMessage("지도 표시 중 오류가 발생했습니다. 아래 지도 앱 버튼을 사용해 주세요.");
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
      <div className="invitation-map-tabs" role="tablist" aria-label="지도 제공자">
        <button
          aria-selected={activeProvider === "kakao"}
          className={activeProvider === "kakao" ? "active" : ""}
          onClick={() => setActiveProvider("kakao")}
          role="tab"
          type="button"
        >
          카카오 지도
        </button>
        <button
          aria-selected={activeProvider === "naver"}
          className={activeProvider === "naver" ? "active" : ""}
          onClick={() => setActiveProvider("naver")}
          role="tab"
          type="button"
        >
          네이버 지도
        </button>
      </div>
      <div
        aria-label="카카오 지도 표시 영역"
        className={`invitation-map-canvas ${activeProvider === "kakao" ? "active" : ""}`}
        id="invitation-kakao-map"
        role="tabpanel"
      />
      <div
        aria-label="네이버 지도 표시 영역"
        className={`invitation-map-canvas ${activeProvider === "naver" ? "active" : ""}`}
        id="invitation-naver-map"
        role="tabpanel"
      >
        {!naverEnabled ? (
          <div className="invitation-map-empty">
            네이버 지도 API 키가 설정되면 이 영역에 지도가 표시됩니다.
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
