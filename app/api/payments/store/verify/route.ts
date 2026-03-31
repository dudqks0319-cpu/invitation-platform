import { NextResponse } from "next/server";
import {
  isAppleStoreVerificationEnabled,
  isGooglePlayVerificationEnabled
} from "@/lib/env";
import { verifyAppleTransaction } from "@/lib/payments/apple-store";
import { verifyGooglePlayPurchase } from "@/lib/payments/google-play";

type StoreVerifyBody = {
  provider?: "apple_iap" | "google_play";
  productId?: string;
  purchaseToken?: string;
  receiptData?: string;
  transactionId?: string;
  environment?: "sandbox" | "production";
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as StoreVerifyBody | null;

  if (!body?.provider || !body.productId) {
    return NextResponse.json({ success: false, message: "스토어 결제 검증 정보가 누락되었습니다." }, { status: 400 });
  }

  if (body.provider === "apple_iap") {
    if (!body.transactionId && !body.receiptData) {
      return NextResponse.json({ success: false, message: "Apple 결제 검증에는 transactionId 또는 receiptData가 필요합니다." }, { status: 400 });
    }

    if (!isAppleStoreVerificationEnabled()) {
      return NextResponse.json({ success: false, message: "Apple 영수증 검증 서버 설정이 완료되지 않았습니다." }, { status: 503 });
    }

    try {
      const verification = await verifyAppleTransaction({
        transactionId: body.transactionId ?? "",
        productId: body.productId,
        environment: body.environment
      });

      return NextResponse.json({ success: true, verification });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: error instanceof Error ? error.message : "Apple 영수증 검증에 실패했습니다." },
        { status: 400 }
      );
    }
  }

  if (!body.purchaseToken) {
    return NextResponse.json({ success: false, message: "Google Play 결제 검증에는 purchaseToken이 필요합니다." }, { status: 400 });
  }

  if (!isGooglePlayVerificationEnabled()) {
    return NextResponse.json({ success: false, message: "Google Play 영수증 검증 서버 설정이 완료되지 않았습니다." }, { status: 503 });
  }

  try {
    const verification = await verifyGooglePlayPurchase({
      productId: body.productId,
      purchaseToken: body.purchaseToken
    });

    return NextResponse.json({ success: true, verification });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Google Play 결제 검증에 실패했습니다." },
      { status: 400 }
    );
  }
}
