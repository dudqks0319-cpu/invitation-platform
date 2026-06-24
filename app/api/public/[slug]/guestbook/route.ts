import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isInvitationSectionAllowed } from "@/lib/invitation-payload";
import { resolvePublishedInvitationBySlug } from "@/lib/invitation-variants";
import { checkPublicAbuseBlock } from "@/lib/public-abuse";
import { checkPublicGuestbookContent } from "@/lib/public-content-policy";
import { consumeRateLimit, getClientIdentifier, hashClientIdentifier } from "@/lib/rate-limit";
import { ensureJsonRequest, publicGuestbookSchema, readJsonBody } from "@/lib/supabase/public-write";

const WINDOW_MS = 60 * 1000;
const LIMIT = 3;

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
      { success: false, message: "서버 설정이 완료되지 않았습니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 }
    );
  }

  const { slug } = await context.params;
  const clientIdentifier = getClientIdentifier(request);
  const clientHash = hashClientIdentifier(clientIdentifier);
  const limitResult = await consumeRateLimit({
    admin,
    key: `guestbook:${slug}:${clientHash}`,
    limit: LIMIT,
    windowMs: WINDOW_MS
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

  const bodyResult = await readJsonBody(request);
  if (!bodyResult.ok) {
    return NextResponse.json(
      { success: false, message: bodyResult.message },
      { status: 400 }
    );
  }

  const parsed = publicGuestbookSchema.safeParse(bodyResult.body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "입력값이 올바르지 않습니다.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (parsed.data.website) {
    return NextResponse.json({ success: true, message: "방명록이 접수되었습니다." });
  }

  const contentPolicy = checkPublicGuestbookContent({
    nickname: parsed.data.nickname,
    message: parsed.data.message
  });

  if (!contentPolicy.ok) {
    return NextResponse.json(
      { success: false, message: contentPolicy.message },
      { status: 400 }
    );
  }

  const lookup = await resolvePublishedInvitationBySlug(admin, slug);

  if (!lookup) {
    return NextResponse.json(
      { success: false, message: "유효하지 않은 초대장입니다." },
      { status: 404 }
    );
  }

  if (!isInvitationSectionAllowed(lookup.payload, "guestbook", "submit")) {
    return NextResponse.json(
      { success: false, message: "이 초대장은 방명록 기능이 꺼져 있습니다." },
      { status: 403 }
    );
  }

  const abuseBlock = await checkPublicAbuseBlock({
    admin,
    invitationId: lookup.invitation.id,
    clientHash
  });

  if (!abuseBlock.ok) {
    return NextResponse.json(
      { success: false, message: "요청 보호 서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 }
    );
  }

  if (abuseBlock.blocked) {
    return NextResponse.json(
      { success: false, message: "운영 정책에 따라 공개 응답 제출이 제한되었습니다." },
      { status: 403 }
    );
  }

  const { error } = await admin.from("guestbook_entries").insert({
    invitation_id: lookup.invitation.id,
    variant_id: lookup.variant?.id ?? null,
    nickname: parsed.data.nickname,
    message: parsed.data.message,
    approved: false,
    client_hash: clientHash
  });

  if (error) {
    return NextResponse.json(
      { success: false, message: "방명록 저장에 실패했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "방명록이 접수되었습니다. 확인 후 공개됩니다."
  });
}
