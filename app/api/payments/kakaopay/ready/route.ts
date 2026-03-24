import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "결제 기능은 v1.1에서 다시 제공될 예정입니다." },
    { status: 410 }
  );
}
