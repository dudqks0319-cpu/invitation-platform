import { NextResponse } from "next/server";
import {
  getStoredInvitationAssetPaths,
  INVITATION_ASSET_BUCKET,
  INVITATION_ASSET_PUBLIC_TTL_SECONDS,
  isOwnedInvitationAssetPath,
  isSafeSignedAssetUrl,
  withInvitationAssetTimeout
} from "@/lib/invitation-assets";
import { consumeRateLimits, getClientIdentifier, getPrivacySafeIdentifier } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeInvitationPayload } from "@/lib/supabase/invitation-payload";

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const DEPENDENCY_TIMEOUT_MS = 750;
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{2,62}$/i;

function unavailable() {
  return NextResponse.json(
    { success: false, message: "자산 보호 서비스를 일시적으로 사용할 수 없습니다." },
    { status: 503 }
  );
}

export async function GET(request: Request) {
  if (process.env.INVITATION_ASSET_ACCESS_ENABLED !== "true") return unavailable();

  const requestUrl = new URL(request.url);
  const keys = [...requestUrl.searchParams.keys()];
  if (
    keys.length !== 2 || !keys.includes("slug") || !keys.includes("path") ||
    requestUrl.searchParams.getAll("slug").length !== 1 ||
    requestUrl.searchParams.getAll("path").length !== 1
  ) {
    return NextResponse.json({ success: false, message: "잘못된 자산 요청입니다." }, { status: 400 });
  }

  const slug = requestUrl.searchParams.get("slug") ?? "";
  const path = requestUrl.searchParams.get("path") ?? "";
  if (!SLUG_PATTERN.test(slug) || path.length < 1 || path.length > 160 || path.includes("..") || path.includes("\\")) {
    return NextResponse.json({ success: false, message: "잘못된 자산 요청입니다." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const clientIdentifier = getClientIdentifier(request);
  const slugIdentifier = getPrivacySafeIdentifier("public_asset_slug", slug);
  if (!admin || !clientIdentifier || !slugIdentifier) return unavailable();

  const quota = await consumeRateLimits({
    admin,
    timeoutMs: DEPENDENCY_TIMEOUT_MS,
    policies: [
      { key: `public_asset:client:${clientIdentifier}:burst`, limit: 30, windowMs: MINUTE_MS },
      { key: `public_asset:client:${clientIdentifier}:rolling`, limit: 300, windowMs: HOUR_MS },
      { key: `public_asset:client:${clientIdentifier}:daily`, limit: 1_000, windowMs: DAY_MS },
      { key: `public_asset:slug:${slugIdentifier}:daily`, limit: 1_000, windowMs: DAY_MS },
      { key: "public_asset:global:daily", limit: 1_000, windowMs: DAY_MS }
    ]
  });
  if (!quota.ok) return unavailable();
  if (!quota.allowed) {
    return NextResponse.json(
      { success: false, message: "자산 요청이 너무 많습니다." },
      { status: 429, headers: { "Retry-After": String(Math.max(1, Math.ceil((quota.resetAt - Date.now()) / 1000))) } }
    );
  }

  let invitationResult: { data: { id: string; user_id: string; payload: unknown } | null; error: unknown };
  try {
    invitationResult = await withInvitationAssetTimeout(
      admin.from("invitations")
        .select("id, user_id, payload")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle(),
      DEPENDENCY_TIMEOUT_MS
    );
  } catch {
    return unavailable();
  }
  const { data: invitation, error } = invitationResult;
  if (error || !invitation) {
    return NextResponse.json({ success: false, message: "공개된 초대장을 찾을 수 없습니다." }, { status: 404 });
  }

  const allowedPaths = getStoredInvitationAssetPaths(normalizeInvitationPayload(invitation.payload));
  if (!allowedPaths.includes(path) || !isOwnedInvitationAssetPath(path, invitation.user_id)) {
    return NextResponse.json({ success: false, message: "허용되지 않은 자산입니다." }, { status: 404 });
  }

  let signedResult: { data: { signedUrl?: string } | null; error: unknown };
  try {
    signedResult = await withInvitationAssetTimeout(
      admin.storage.from(INVITATION_ASSET_BUCKET).createSignedUrl(path, INVITATION_ASSET_PUBLIC_TTL_SECONDS),
      DEPENDENCY_TIMEOUT_MS
    );
  } catch {
    return unavailable();
  }
  const signedUrl = signedResult.data?.signedUrl ?? "";
  if (signedResult.error || !isSafeSignedAssetUrl(signedUrl)) return unavailable();

  const response = NextResponse.redirect(signedUrl);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
