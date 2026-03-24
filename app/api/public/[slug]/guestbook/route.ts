import { NextRequest, NextResponse } from "next/server";
import { hashIp } from "@/lib/hash-ip";
import { checkGuestbookLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureJsonRequest, publicGuestbookSchema } from "@/lib/supabase/public-write";

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
    return NextResponse.json({ success: true, message: "방명록이 저장되었습니다." });
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
  const { allowed } = await checkGuestbookLimit(invitation.id, clientIp);
  if (!allowed) {
    return NextResponse.json({ error: "잠시 후 다시 시도해 주세요." }, { status: 429 });
  }

  const parsed = publicGuestbookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값이 올바르지 않습니다." }, { status: 400 });
  }

  const ipHash = await hashIp(clientIp);
  const anonymousId = typeof body.anonymous_id === "string" ? body.anonymous_id : "";
  const blockedFilters = anonymousId
    ? `ip_hash.eq.${ipHash},anonymous_id.eq.${anonymousId}`
    : `ip_hash.eq.${ipHash}`;

  const { data: blocked } = await admin
    .from("blocked_users")
    .select("id")
    .eq("invitation_id", invitation.id)
    .or(blockedFilters)
    .limit(1);

  if (blocked?.length) {
    return NextResponse.json({ success: true, message: "방명록이 저장되었습니다." });
  }

  const { error } = await admin.from("guestbook_entries").insert({
    invitation_id: invitation.id,
    nickname: parsed.data.nickname,
    message: parsed.data.message,
    is_approved: false,
    anonymous_id: anonymousId || null,
    ip_hash: ipHash
  });

  if (error) {
    console.error("Guestbook insert error:", error.message);
    return NextResponse.json({ error: "방명록 저장에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "관리자 승인 후 공개됩니다." });
}
