import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { consumeRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { ensureJsonRequest, publicRsvpSchema, readJsonBody } from "@/lib/supabase/public-write";

const WINDOW_MS = 60 * 1000;
const LIMIT = 5;

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
  const limitResult = await consumeRateLimit({
    admin,
    key: `rsvp:${slug}:${getClientIdentifier(request)}`,
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

  const parsed = publicRsvpSchema.safeParse(bodyResult.body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "입력값이 올바르지 않습니다.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (parsed.data.website) {
    return NextResponse.json({ success: true, message: "RSVP가 저장되었습니다." });
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

  const guestPhone = parsed.data.guestPhone || null;
  const rsvpPayload = {
    guest_phone: guestPhone,
    attending: parsed.data.attending,
    guests: parsed.data.guests,
    side: parsed.data.side,
    meal_preference: parsed.data.mealPreference,
    shuttle_needed: parsed.data.shuttleNeeded,
    companion_names: parsed.data.companionNames || null,
    memo: parsed.data.memo || null
  };

  const existingRsvpQuery = admin
    .from("rsvps")
    .select("id")
    .eq("invitation_id", invitation.id)
    .eq("guest_name", parsed.data.guestName);

  const { data: existingRsvp, error: existingRsvpError } = guestPhone
    ? await existingRsvpQuery.eq("guest_phone", guestPhone).maybeSingle()
    : await existingRsvpQuery.is("guest_phone", null).maybeSingle();

  if (existingRsvpError) {
    return NextResponse.json(
      { success: false, message: "RSVP 저장에 실패했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }

  const { error } = existingRsvp
    ? await admin
      .from("rsvps")
      .update(rsvpPayload)
      .eq("id", existingRsvp.id)
    : await admin.from("rsvps").insert({
      invitation_id: invitation.id,
      guest_name: parsed.data.guestName,
      ...rsvpPayload
    });

  if (error) {
    return NextResponse.json(
      { success: false, message: "RSVP 저장에 실패했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "RSVP가 저장되었습니다."
  });
}
