import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function publicEnv(name: string) {
  return (process.env[name] ?? "").trim();
}

export async function GET() {
  const kakaoJsKey = publicEnv("NEXT_PUBLIC_KAKAO_JS_KEY");
  const naverMapClientId = publicEnv("NEXT_PUBLIC_NAVER_MAP_CLIENT_ID");

  return NextResponse.json({
    kakao: {
      enabled: Boolean(kakaoJsKey),
      jsKey: kakaoJsKey
    },
    naver: {
      clientId: naverMapClientId,
      enabled: Boolean(naverMapClientId)
    }
  });
}
