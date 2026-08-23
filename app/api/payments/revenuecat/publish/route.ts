import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";
import { buildPublishedInvitationAssetPayload } from "@/lib/invitation-assets";
import { getInvitationPricing } from "@/lib/payments/pricing";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeInvitationPayload } from "@/lib/supabase/invitation-payload";
import { ensureJsonRequest, readJsonBody } from "@/lib/supabase/public-write";

export const dynamic = "force-dynamic";

const publishSchema = z.object({
  invitationId: z.string().uuid()
});

function noStoreJson(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Vary", "Authorization");
  return response;
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? "";
}

async function getAuthenticatedUser(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return { user: null };
  }

  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  const {
    data: { user },
    error
  } = await authClient.auth.getUser(token);

  if (error || !user) {
    return { user: null };
  }

  return { user };
}

export async function POST(request: Request) {
  const { user } = await getAuthenticatedUser(request);

  if (!user) {
    return noStoreJson({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
  }

  if (!ensureJsonRequest(request)) {
    return noStoreJson({ success: false, message: "JSON 요청만 허용됩니다." }, { status: 415 });
  }

  const json = await readJsonBody(request, 16 * 1024);
  if (!json.ok) {
    return noStoreJson({ success: false, message: json.message }, { status: 400 });
  }

  const parsed = publishSchema.safeParse(json.body);
  if (!parsed.success) {
    return noStoreJson({ success: false, message: "초대장 ID가 필요합니다." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return noStoreJson({ success: false, message: "발행권 서버 설정이 완료되지 않았습니다." }, { status: 503 });
  }

  const { data: invitation, error: invitationError } = await admin
    .from("invitations")
    .select("*")
    .eq("id", parsed.data.invitationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (invitationError || !invitation) {
    return noStoreJson({ success: false, message: "초대장을 찾을 수 없습니다." }, { status: 404 });
  }

  const normalizedPayload = normalizeInvitationPayload(invitation.payload);
  const pricing = getInvitationPricing(normalizedPayload);

  if (pricing.isFree) {
    return noStoreJson(
      { success: false, message: "무료 구성은 발행권을 사용하지 않고 무료 발행 경로를 사용해야 합니다." },
      { status: 409 }
    );
  }

  const publishedPayload = buildPublishedInvitationAssetPayload(invitation.slug, normalizedPayload);
  const { data, error } = await admin.rpc("publish_invitation_with_credit", {
    p_invitation_id: invitation.id,
    p_paid_payload_snapshot: normalizedPayload,
    p_published_payload: publishedPayload,
    p_user_id: user.id
  });

  if (error) {
    return noStoreJson({ success: false, message: "발행권 사용에 실패했습니다." }, { status: 500 });
  }

  const result = Array.isArray(data) ? data[0] : data;
  if (!result?.success) {
    return noStoreJson(
      { success: false, message: "사용 가능한 발행권이 아직 없습니다.", remainingCredits: result?.remaining_credits ?? 0 },
      { status: 402 }
    );
  }

  return noStoreJson({
    success: true,
    invitationId: invitation.id,
    remainingCredits: result.remaining_credits,
    slug: invitation.slug
  });
}
