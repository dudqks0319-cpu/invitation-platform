import { NextResponse } from "next/server";
import {
  getStoredInvitationAssetPaths,
  INVITATION_ASSET_BUCKET
} from "@/lib/invitation-assets";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeInvitationPayload } from "@/lib/supabase/invitation-payload";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const slug = requestUrl.searchParams.get("slug") ?? "";
  const path = requestUrl.searchParams.get("path") ?? "";
  const admin = createSupabaseAdminClient();

  if (!admin || !slug || !path) {
    return NextResponse.json({ success: false, message: "잘못된 자산 요청입니다." }, { status: 400 });
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

  return NextResponse.redirect(signedUrlData.signedUrl);
}
