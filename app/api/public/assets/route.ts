import { NextResponse } from "next/server";
import {
  getStoredInvitationAssetPaths,
  INVITATION_ASSET_BUCKET
} from "@/lib/invitation-assets";
import { consumeRateLimitPolicies, getClientFingerprint } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeInvitationPayload } from "@/lib/supabase/invitation-payload";

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const PUBLIC_SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{2,30}[a-z0-9]$/i;

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const slug = requestUrl.searchParams.get("slug") ?? "";
  const path = requestUrl.searchParams.get("path") ?? "";
  const admin = createSupabaseAdminClient();

  if (
    !admin ||
    !PUBLIC_SLUG_PATTERN.test(slug) ||
    path.length < 1 ||
    path.length > 512 ||
    path.includes("\0")
  ) {
    return NextResponse.json({ success: false, message: "잘못된 자산 요청입니다." }, { status: 400 });
  }

  const client = getClientFingerprint(request);
  if (!client.ok) {
    return NextResponse.json({ success: false, message: "자산 요청 보호 서비스를 확인할 수 없습니다." }, { status: 503 });
  }

  const quota = await consumeRateLimitPolicies({
    admin,
    policies: [
      { name: "burst", key: `public_asset:burst:${client.fingerprint}`, limit: 120, windowMs: MINUTE_MS },
      { name: "rolling_hour", key: `public_asset:hour:${client.fingerprint}`, limit: 1500, windowMs: HOUR_MS },
      { name: "daily", key: `public_asset:daily:${client.fingerprint}`, limit: 6000, windowMs: DAY_MS },
      { name: "global_burst", key: "public_asset:global:burst", limit: 10_000, windowMs: MINUTE_MS },
      { name: "global_daily", key: "public_asset:global:daily", limit: 500_000, windowMs: DAY_MS }
    ]
  });
  if (!quota.ok) {
    return NextResponse.json({ success: false, message: "자산 요청 보호 서비스를 사용할 수 없습니다." }, { status: 503 });
  }
  if (!quota.allowed) {
    return NextResponse.json(
      { success: false, message: "사진 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
      { status: 429 }
    );
  }

  const { data: invitation, error } = await admin
    .from("invitations")
    .select("payload")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !invitation) {
    return NextResponse.json({ success: false, message: "공개된 초대장을 찾을 수 없습니다." }, { status: 404 });
  }

  const payload = normalizeInvitationPayload(invitation.payload);
  const allowedPaths = getStoredInvitationAssetPaths(payload);

  if (!allowedPaths.includes(path)) {
    return NextResponse.json({ success: false, message: "허용되지 않은 자산입니다." }, { status: 404 });
  }

  const { data: signedUrlData, error: signedUrlError } = await admin.storage
    .from(INVITATION_ASSET_BUCKET)
    .createSignedUrl(path, 60 * 5);

  if (signedUrlError || !signedUrlData?.signedUrl) {
    return NextResponse.json({ success: false, message: "자산 URL을 생성하지 못했습니다." }, { status: 500 });
  }

  const response = NextResponse.redirect(signedUrlData.signedUrl);
  response.headers.set("Cache-Control", "public, max-age=300, s-maxage=300, stale-while-revalidate=86400");
  return response;
}
