import { NextResponse } from "next/server";
import { POST as kakaoPayReady } from "@/app/api/payments/kakaopay/ready/route";
import { isKakaoPayEnabled, isPortOneEnabled } from "@/lib/env";
import {
  getPaymentProviderMeta,
  isAppPaymentProvider,
  isWebPaymentProvider,
  type PaymentProvider
} from "@/lib/payments/providers";

type GenericReadyRequest = {
  provider?: PaymentProvider;
};

export async function POST(request: Request) {
  const body = (await request.clone().json().catch(() => null)) as GenericReadyRequest | null;
  const provider = body?.provider ?? "kakaopay";

  if (!isWebPaymentProvider(provider) && !isAppPaymentProvider(provider)) {
    return NextResponse.json({ success: false, message: "지원하지 않는 결제 수단입니다." }, { status: 400 });
  }

  if (isAppPaymentProvider(provider)) {
    return NextResponse.json(
      {
        success: false,
        message: `${getPaymentProviderMeta(provider).label}은 앱 내 스토어 결제로만 사용할 수 있습니다.`
      },
      { status: 400 }
    );
  }

  if (provider === "kakaopay") {
    if (!isKakaoPayEnabled()) {
      return NextResponse.json({ success: false, message: "카카오페이 환경 변수가 설정되지 않았습니다." }, { status: 503 });
    }

    return kakaoPayReady(request);
  }

  if (!isPortOneEnabled()) {
    return NextResponse.json(
      {
        success: false,
        message: `${getPaymentProviderMeta(provider).label} 결제는 PortOne 설정 후 활성화할 수 있습니다.`
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      message: `${getPaymentProviderMeta(provider).label} 결제 연동은 아직 준비 중입니다.`
    },
    { status: 501 }
  );
}
