import { NextRequest, NextResponse } from "next/server";
import { hashIp } from "@/lib/hash-ip";
import { checkRsvpLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureJsonRequest, publicRsvpSchema } from "@/lib/supabase/public-write";

function getClientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!ensureJsonRequest(request)) {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const { slug } = await params;
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return NextResponse.json({ error: "서버 구성이 불완전합니다." }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  if (typeof body.website === "string" && body.website.length > 0) {
    return NextResponse.json({ success: true, message: "RSVP가 저장되었습니다." });
  }

  const { data: invitation } = await admin
    .from("invitations")
    .select("id")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!invitation) {
    return NextResponse.json({ error: "초대장을 찾을 수 없습니다." }, { status: 404 });
  }

  const clientIp = getClientIp(request);
  const { allowed } = await checkRsvpLimit(invitation.id, clientIp);
  if (!allowed) {
    return NextResponse.json({ error: "잠시 후 다시 시도해 주세요." }, { status: 429 });
  }

  const parsed = publicRsvpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값이 올바르지 않습니다." }, { status: 400 });
  }

  const ipHash = await hashIp(clientIp);
  const { error } = await admin.from("rsvps").insert({
    invitation_id: invitation.id,
    name: parsed.data.guestName,
    phone: parsed.data.guestPhone || null,
    attending: parsed.data.attending,
    guest_count: parsed.data.guests,
    memo: parsed.data.memo || null,
    ip_hash: ipHash
  });

  if (error) {
    console.error("RSVP insert error:", error.message);
    return NextResponse.json({ error: "RSVP 저장에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "RSVP가 저장되었습니다." });
}
