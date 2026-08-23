import { NextResponse } from "next/server";
import {
  consumeRateLimitPolicies,
  getClientFingerprint
} from "@/lib/rate-limit";
import { ensureJsonRequest, readJsonBody } from "@/lib/supabase/public-write";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KAKAO_ADDRESS_URL = "https://dapi.kakao.com/v2/local/search/address.json";
const KAKAO_STATIC_MAP_URL = "https://dapi.kakao.com/v2/maps/staticmap";
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const MAX_ADDRESS_LENGTH = 160;
const MAX_STATIC_MAP_BYTES = 750 * 1024;
const PROVIDER_TIMEOUT_MS = 5000;
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

type KakaoAddressDocument = {
  address_name?: string;
  x?: string;
  y?: string;
  road_address?: {
    address_name?: string;
  } | null;
};

function json(body: Record<string, unknown>, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

async function providerFetch(url: string, key: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

  try {
    return await fetch(url, {
      headers: {
        Authorization: `KakaoAK ${key}`,
        Accept: "application/json, image/png, image/jpeg"
      },
      cache: "no-store",
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

function hasExpectedImageSignature(bytes: Uint8Array, contentType: string) {
  if (contentType === "image/png") {
    return PNG_SIGNATURE.every((byte, index) => bytes[index] === byte);
  }

  return contentType === "image/jpeg" && bytes[0] === 0xff && bytes[1] === 0xd8;
}

export async function POST(request: Request) {
  const providerKey = (process.env.KAKAO_REST_API_KEY ?? "").trim();
  const providerEnabled = (process.env.KAKAO_MAPS_REST_ENABLED ?? "").trim().toLowerCase() === "true";
  if (!providerEnabled || !providerKey) {
    return json(
      { success: false, message: "카카오 도로명주소 지도가 아직 서버에 설정되지 않았습니다." },
      { status: 503 }
    );
  }

  if (!ensureJsonRequest(request)) {
    return json({ success: false, message: "JSON 요청만 처리할 수 있습니다." }, { status: 415 });
  }
  const parsedBody = await readJsonBody(request, 4096);
  if (!parsedBody.ok) {
    return json({ success: false, message: parsedBody.message }, { status: 400 });
  }

  const candidate = parsedBody.body as { address?: unknown };
  const address = typeof candidate?.address === "string" ? candidate.address.trim().replace(/\s+/g, " ") : "";
  if (address.length < 5 || address.length > MAX_ADDRESS_LENGTH) {
    return json({ success: false, message: "도로명주소를 5자 이상 160자 이하로 입력해 주세요." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const client = getClientFingerprint(request);
  if (!admin || !client.ok) {
    return json({ success: false, message: "지도 요청 보호 서비스를 확인할 수 없습니다." }, { status: 503 });
  }

  const quota = await consumeRateLimitPolicies({
    admin,
    policies: [
      { name: "burst", key: `kakao_map:burst:${client.fingerprint}`, limit: 10, windowMs: MINUTE_MS },
      { name: "rolling_hour", key: `kakao_map:hour:${client.fingerprint}`, limit: 50, windowMs: HOUR_MS },
      { name: "daily", key: `kakao_map:daily:${client.fingerprint}`, limit: 200, windowMs: DAY_MS },
      { name: "global_burst", key: "kakao_map:global:burst", limit: 300, windowMs: MINUTE_MS },
      { name: "global_daily", key: "kakao_map:global:daily", limit: 5000, windowMs: DAY_MS }
    ]
  });

  if (!quota.ok) {
    return json({ success: false, message: "지도 요청 보호 서비스를 사용할 수 없습니다." }, { status: 503 });
  }
  if (!quota.allowed) {
    return json({ success: false, message: "지도 확인 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." }, { status: 429 });
  }

  try {
    const geocodeUrl = new URL(KAKAO_ADDRESS_URL);
    geocodeUrl.searchParams.set("query", address);
    geocodeUrl.searchParams.set("analyze_type", "similar");
    geocodeUrl.searchParams.set("size", "1");

    const geocodeResponse = await providerFetch(geocodeUrl.toString(), providerKey);
    if (!geocodeResponse.ok) {
      return json({ success: false, message: "카카오에서 주소를 확인하지 못했습니다." }, { status: 502 });
    }
    const geocodePayload = (await geocodeResponse.json().catch(() => null)) as {
      documents?: KakaoAddressDocument[];
    } | null;
    const match = geocodePayload?.documents?.[0];
    const longitude = Number(match?.x);
    const latitude = Number(match?.y);
    const canonicalAddress = match?.road_address?.address_name?.trim() || match?.address_name?.trim() || "";

    if (!canonicalAddress || !Number.isFinite(longitude) || !Number.isFinite(latitude)) {
      return json({ success: false, message: "일치하는 도로명주소를 찾지 못했습니다." }, { status: 404 });
    }

    const staticMapUrl = new URL(KAKAO_STATIC_MAP_URL);
    staticMapUrl.searchParams.set("center", `${longitude},${latitude}`);
    staticMapUrl.searchParams.set("size", "640x360");
    staticMapUrl.searchParams.set("level", "3");
    staticMapUrl.searchParams.set("markers", `location:${longitude},${latitude}|option:false`);

    const staticMapResponse = await providerFetch(staticMapUrl.toString(), providerKey);
    const contentType = (staticMapResponse.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    const contentLength = Number(staticMapResponse.headers.get("content-length") ?? "0");
    if (
      !staticMapResponse.ok ||
      !["image/png", "image/jpeg"].includes(contentType) ||
      (Number.isFinite(contentLength) && contentLength > MAX_STATIC_MAP_BYTES)
    ) {
      return json({ success: false, message: "카카오 지도 이미지를 불러오지 못했습니다." }, { status: 502 });
    }

    const imageBytes = new Uint8Array(await staticMapResponse.arrayBuffer());
    if (
      imageBytes.byteLength < PNG_SIGNATURE.length ||
      imageBytes.byteLength > MAX_STATIC_MAP_BYTES ||
      !hasExpectedImageSignature(imageBytes, contentType)
    ) {
      return json({ success: false, message: "카카오 지도 이미지 크기가 올바르지 않습니다." }, { status: 502 });
    }

    return json({
      success: true,
      canonicalAddress,
      latitude,
      longitude,
      imageDataUrl: `data:${contentType};base64,${Buffer.from(imageBytes).toString("base64")}`,
      kakaoUrl: `https://map.kakao.com/link/search/${encodeURIComponent(canonicalAddress)}`
    });
  } catch {
    return json({ success: false, message: "카카오 지도 응답이 지연되고 있습니다. 다시 시도해 주세요." }, { status: 502 });
  }
}
