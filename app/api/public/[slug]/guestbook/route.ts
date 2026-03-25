import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { consumeRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { ensureJsonRequest, publicGuestbookSchema } from "@/lib/supabase/public-write";

const GUESTBOOK_LIMIT = 3;
const GUESTBOOK_WINDOW_MS = 10 * 60 * 1000;

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  if (!ensureJsonRequest(request)) {
    return NextResponse.json(
      { success: false, message: "JSON 요청만 허용됩니다." },
      { status: 415 }
    );
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Supabase server configuration is incomplete." },
      { status: 503 }
    );
  }

  const { slug } = await context.params;
  const rateLimit = consumeRateLimit(`guestbook:${slug}:${getClientIdentifier(request)}`, GUESTBOOK_LIMIT, GUESTBOOK_WINDOW_MS);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: "방명록을 너무 빠르게 작성하고 있습니다. 잠시 후 다시 시도해 주세요."
      },
      {
        status: 429,
        headers: {
          "x-ratelimit-reset": String(rateLimit.resetAt)
        }
      }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = publicGuestbookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "입력값을 다시 확인해 주세요." },
      { status: 400 }
    );
  }

  const { data: invitation, error: invitationError } = await admin
    .from("invitations")
    .select("id, slug, status")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (invitationError || !invitation) {
    return NextResponse.json(
      { success: false, message: "공개된 초대장을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  const { error } = await admin.from("guestbook_entries").insert({
    invitation_id: invitation.id,
    nickname: parsed.data.nickname,
    message: parsed.data.message,
    approved: false
  });

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message || "방명록 저장에 실패했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { success: true, message: "방명록이 접수되었습니다." },
    { status: 201 }
  );
}
