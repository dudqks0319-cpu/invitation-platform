import { NextResponse } from "next/server";
import { verifyGuestOwnerToken } from "@/lib/guest-owner-token";
import { consumeRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureJsonRequest, readJsonBody } from "@/lib/supabase/public-write";

type OwnerDeleteRequest = {
  ownerToken?: string;
  website?: string;
};

type InvitationOwnerRow = {
  id: string;
  guest_owner_token_hash: string | null;
};

const DELETE_WINDOW_MS = 60 * 1000;
const DELETE_LIMIT = 5;
const MAX_BODY_BYTES = 8 * 1024;
const PUBLIC_SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{2,30}[a-z0-9]$/i;

function isPublicSlug(value: string) {
  return PUBLIC_SLUG_PATTERN.test(value);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  if (!ensureJsonRequest(request)) {
    return NextResponse.json({ success: false, message: "JSON 요청만 허용됩니다." }, { status: 415 });
  }

  const { slug } = await context.params;
  if (!isPublicSlug(slug)) {
    return NextResponse.json({ success: false, message: "유효하지 않은 초대장입니다." }, { status: 404 });
  }

  const bodyResult = await readJsonBody(request, MAX_BODY_BYTES);
  if (!bodyResult.ok) {
    return NextResponse.json({ success: false, message: bodyResult.message }, { status: 400 });
  }

  const body = bodyResult.body as OwnerDeleteRequest;
  if ((body.website ?? "").trim().length > 0) {
    return NextResponse.json({ success: true, message: "삭제 요청이 접수되었습니다." });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "서버 설정이 완료되지 않았습니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 }
    );
  }

  const clientIdentifier = getClientIdentifier(request);
  if (!clientIdentifier) {
    return NextResponse.json(
      { success: false, message: "요청 보호 서비스 설정을 확인할 수 없습니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 }
    );
  }

  const limitResult = await consumeRateLimit({
    admin,
    key: `guest_owner_delete:${slug}:${clientIdentifier}`,
    limit: DELETE_LIMIT,
    windowMs: DELETE_WINDOW_MS
  });

  if (!limitResult.ok) {
    return NextResponse.json(
      { success: false, message: "요청 보호 서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 }
    );
  }

  if (!limitResult.allowed) {
    return NextResponse.json(
      { success: false, message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((limitResult.resetAt - Date.now()) / 1000))
        }
      }
    );
  }

  const { data: invitation, error: invitationError } = await admin
    .from("invitations")
    .select("id, guest_owner_token_hash")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle<InvitationOwnerRow>();

  if (invitationError || !invitation) {
    return NextResponse.json({ success: false, message: "유효하지 않은 초대장입니다." }, { status: 404 });
  }

  if (!verifyGuestOwnerToken(body.ownerToken ?? "", invitation.guest_owner_token_hash)) {
    return NextResponse.json({ success: false, message: "삭제 권한을 확인하지 못했습니다." }, { status: 403 });
  }

  await admin.from("guestbook_entries").delete().eq("invitation_id", invitation.id);
  await admin.from("rsvps").delete().eq("invitation_id", invitation.id);
  await admin.from("view_logs").delete().eq("invitation_id", invitation.id);

  const { error: deleteError } = await admin.from("invitations").delete().eq("id", invitation.id);
  if (deleteError) {
    return NextResponse.json(
      { success: false, message: "초대장을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, message: "초대장이 삭제되었습니다." });
}
