import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { consumeRateLimits, getClientIdentifier } from "@/lib/rate-limit";
import {
  ensureJsonRequest,
  getIdempotencyKey,
  hashPublicWrite,
  publicGuestbookSchema,
  publicSlugSchema,
  readJsonBody
} from "@/lib/supabase/public-write";

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

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

  const { slug } = await context.params;
  if (!publicSlugSchema.safeParse(slug).success) {
    return NextResponse.json(
      { success: false, message: "유효하지 않은 초대장입니다." },
      { status: 404 }
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

  const idempotencyKey = getIdempotencyKey(request);
  if (!idempotencyKey) {
    return NextResponse.json(
      { success: false, message: "요청 식별자가 올바르지 않습니다." },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "서버 설정이 완료되지 않았습니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 }
    );
  }

  const { data: invitation, error: invitationError } = await admin
    .from("invitations")
    .select("id, status")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (invitationError || !invitation) {
    return NextResponse.json(
      { success: false, message: "유효하지 않은 초대장입니다." },
      { status: 404 }
    );
  }

  const clientIdentifier = getClientIdentifier(request);
  if (!clientIdentifier) {
    return NextResponse.json(
      { success: false, message: "요청 보호 서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 }
    );
  }

  const idempotencyHash = hashPublicWrite(
    "guestbook",
    invitation.id,
    clientIdentifier,
    idempotencyKey
  );
  const requestHash = hashPublicWrite("guestbook-request", JSON.stringify(parsed.data));

  const limitResult = await consumeRateLimits({
    admin,
    policies: [
      { key: `guestbook:client:${clientIdentifier}:burst`, limit: 3, windowMs: MINUTE_MS },
      { key: `guestbook:client:${clientIdentifier}:rolling`, limit: 15, windowMs: HOUR_MS },
      { key: `guestbook:client:${clientIdentifier}:daily`, limit: 30, windowMs: DAY_MS },
      { key: `guestbook:invitation:${invitation.id}:daily`, limit: 2000, windowMs: DAY_MS },
      { key: "guestbook:global:daily", limit: 20_000, windowMs: DAY_MS }
    ]
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
          "Retry-After": String(Math.max(1, Math.ceil((limitResult.resetAt - Date.now()) / 1000)))
        }
      }
    );
  }

  const verifiedAdmin = admin;
  const invitationId = invitation.id;
  async function findExisting() {
    return verifiedAdmin
      .from("guestbook_entries")
      .select("id, request_hash")
      .eq("invitation_id", invitationId)
      .eq("idempotency_key_hash", idempotencyHash)
      .maybeSingle();
  }

  const existing = await findExisting();
  if (existing.error) {
    return NextResponse.json(
      { success: false, message: "방명록 저장 상태를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 }
    );
  }
  if (existing.data) {
    if (existing.data.request_hash !== requestHash) {
      return NextResponse.json(
        { success: false, message: "같은 요청 식별자를 다른 방명록 내용에 재사용할 수 없습니다." },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: true, message: "방명록이 접수되었습니다. 확인 후 공개됩니다." });
  }

  const { error } = await admin.from("guestbook_entries").insert({
    invitation_id: invitation.id,
    nickname: parsed.data.nickname,
    message: parsed.data.message,
    approved: false,
    idempotency_key_hash: idempotencyHash,
    request_hash: requestHash
  });

  if (error) {
    if (typeof error === "object" && "code" in error && error.code === "23505") {
      const replay = await findExisting();
      if (!replay.error && replay.data?.request_hash === requestHash) {
        return NextResponse.json({ success: true, message: "방명록이 접수되었습니다. 확인 후 공개됩니다." });
      }
    }
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
