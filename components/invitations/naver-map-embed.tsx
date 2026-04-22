"use client";

import { useEffect, useRef, useState } from "react";
import {
  buildNaverMapScriptSrc,
  getNaverMapCoordinates
} from "@/lib/korean-invitation-features";
import type { InvitationDraftPayload } from "@/lib/invitation-payload";

type NaverMapConstructor = new (
  element: HTMLElement,
  options: {
    center: unknown;
    draggable?: boolean;
    logoControl?: boolean;
    mapDataControl?: boolean;
    scaleControl?: boolean;
    scrollWheel?: boolean;
    zoom: number;
    zoomControl?: boolean;
  }
) => unknown;

type NaverMarkerConstructor = new (options: {
  map: unknown;
  position: unknown;
}) => unknown;

type NaverLatLngConstructor = new (latitude: number, longitude: number) => unknown;

type NaverMapsApi = {
  LatLng: NaverLatLngConstructor;
  Map: NaverMapConstructor;
  Marker: NaverMarkerConstructor;
};

declare global {
  interface Window {
    naver?: {
      maps?: NaverMapsApi;
    };
  }
}

type NaverMapEmbedProps = {
  clientId: string;
  payload: InvitationDraftPayload;
};

const scriptPromises = new Map<string, Promise<void>>();

function loadNaverMapScript(scriptSrc: string) {
  if (!scriptSrc) {
    return Promise.reject(new Error("네이버 지도 API 키가 없습니다."));
  }

  const existingPromise = scriptPromises.get(scriptSrc);
  if (existingPromise) {
    return existingPromise;
  }

  const promise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-naver-map-sdk="${scriptSrc}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("네이버 지도 SDK를 불러오지 못했습니다.")), { once: true });
      if (window.naver?.maps) {
        resolve();
      }
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.dataset.naverMapSdk = scriptSrc;
    script.src = scriptSrc;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("네이버 지도 SDK를 불러오지 못했습니다."));
    document.head.appendChild(script);
  });

  scriptPromises.set(scriptSrc, promise);
  return promise;
}

export function NaverMapEmbed({ clientId, payload }: NaverMapEmbedProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const coordinates = getNaverMapCoordinates(payload);
  const latitude = coordinates?.latitude;
  const longitude = coordinates?.longitude;
  const canLoadMap = typeof latitude === "number" && typeof longitude === "number" && Boolean(clientId.trim());
  const [status, setStatus] = useState<"ready" | "loading" | "fallback">(
    canLoadMap ? "loading" : "fallback"
  );
  const displayStatus = canLoadMap ? status : "fallback";

  useEffect(() => {
    let cancelled = false;

    if (!canLoadMap) {
      return;
    }

    const scriptSrc = buildNaverMapScriptSrc(clientId);

    loadNaverMapScript(scriptSrc)
      .then(() => {
        if (cancelled || !mapRef.current || !window.naver?.maps) {
          return;
        }

        const center = new window.naver.maps.LatLng(latitude, longitude);
        const map = new window.naver.maps.Map(mapRef.current, {
          center,
          draggable: true,
          logoControl: false,
          mapDataControl: false,
          scaleControl: false,
          scrollWheel: false,
          zoom: 16,
          zoomControl: true
        });
        new window.naver.maps.Marker({
          map,
          position: center
        });
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("fallback");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [canLoadMap, clientId, latitude, longitude]);

  return (
    <div className="invitation-map-frame">
      <div
        aria-label="네이버 지도"
        className="invitation-map-canvas"
        data-map-status={displayStatus}
        id="naver-map-embed"
        ref={mapRef}
        role="img"
      >
        {displayStatus !== "ready" ? (
          <div className="invitation-map-fallback">
            <strong>{payload.venueName || "행사장 위치"}</strong>
            <span>{payload.mapAddress || payload.venueAddress || "지도 주소를 입력해 주세요."}</span>
            {coordinates ? (
              <small>네이버 지도 API 키를 연결하면 이 영역에 지도가 표시됩니다.</small>
            ) : (
              <small>정확한 지도 표시를 위해 위도와 경도를 입력해 주세요.</small>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
