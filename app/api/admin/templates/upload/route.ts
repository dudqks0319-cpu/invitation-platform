import { NextResponse } from "next/server";
import { TEMPLATE_ASSET_BUCKET } from "@/lib/invitation-assets";
import { isTemplateAdminEmail } from "@/lib/template-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { maxUploadBytes, storageMimeTypes } from "@/lib/supabase/public-write";

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const admin = createSupabaseAdminClient();

  if (!supabase || !admin) {
    return NextResponse.json({ success: false, message: "업로드 서비스 설정이 필요합니다." }, { status: 503 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
  }

  if (!isTemplateAdminEmail(user.email)) {
    return NextResponse.json({ success: false, message: "템플릿 관리자 권한이 필요합니다." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, message: "업로드할 이미지가 없습니다." }, { status: 400 });
  }

  if (!storageMimeTypes.includes(file.type as (typeof storageMimeTypes)[number])) {
    return NextResponse.json({ success: false, message: "JPEG, PNG, WebP 이미지만 업로드할 수 있습니다." }, { status: 400 });
  }

  if (file.size > maxUploadBytes) {
    return NextResponse.json({ success: false, message: "이미지 크기는 5MB 이하여야 합니다." }, { status: 400 });
  }

  const fallbackName = `template-${Date.now()}.jpg`;
  const path = `${user.id}/templates/${Date.now()}-${sanitizeFilename(file.name || fallbackName)}`;
  const { data, error } = await admin.storage.from(TEMPLATE_ASSET_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false
  });

  if (error || !data) {
    return NextResponse.json({ success: false, message: "이미지를 저장하지 못했습니다." }, { status: 500 });
  }

  const { data: publicUrlData } = admin.storage.from(TEMPLATE_ASSET_BUCKET).getPublicUrl(data.path);

  return NextResponse.json({
    success: true,
    publicUrl: publicUrlData.publicUrl,
    path: data.path
  });
}
