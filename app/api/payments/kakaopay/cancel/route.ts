import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "결제 취소 기능은 현재 비활성화되어 있습니다." },
    { status: 410 }
  );
}
