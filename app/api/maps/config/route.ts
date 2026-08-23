import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function publicEnv(name: string) {
  return (process.env[name] ?? "").trim();
}

export async function GET() {
  const kakaoJsKey = publicEnv("NEXT_PUBLIC_KAKAO_JS_KEY");
  const kakaoRestKey = publicEnv("KAKAO_REST_API_KEY");
  const naverMapClientId = publicEnv("NEXT_PUBLIC_NAVER_MAP_CLIENT_ID");
  const kakaoEnabled = publicEnv("NEXT_PUBLIC_KAKAO_MAPS_ENABLED") === "true";
  const kakaoAddressPreviewEnabled = publicEnv("KAKAO_MAPS_REST_ENABLED") === "true";
  const naverEnabled = publicEnv("NEXT_PUBLIC_NAVER_MAPS_ENABLED") === "true";

  return NextResponse.json({
    kakao: {
      configured: Boolean(kakaoJsKey),
      enabled: Boolean(kakaoJsKey) && kakaoEnabled,
      addressPreviewEnabled: Boolean(kakaoRestKey) && kakaoAddressPreviewEnabled,
      jsKey: kakaoJsKey,
      status: kakaoJsKey ? (kakaoEnabled ? "enabled" : "key_configured_disabled") : "missing_key"
    },
    naver: {
      clientId: naverMapClientId,
      configured: Boolean(naverMapClientId),
      enabled: Boolean(naverMapClientId) && naverEnabled,
      status: naverMapClientId ? (naverEnabled ? "enabled" : "key_configured_disabled") : "missing_key"
    }
  });
}
