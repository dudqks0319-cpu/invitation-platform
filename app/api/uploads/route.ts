import { NextResponse } from "next/server";
import { INVITATION_ASSET_BUCKET, INVITATION_ASSET_TTL_SECONDS } from "@/lib/invitation-assets";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  ensureSameOriginRequest,
  exceedsMultipartUploadLimit,
  isStorageMimeType,
  isValidImageFile,
  maxUploadBytes
} from "@/lib/supabase/public-write";

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "-");
}

async function getAuthenticatedClients() {
  const supabase = await createServerSupabaseClient();
  const admin = createSupabaseAdminClient();

  if (!supabase || !admin) {
    return {
      supabase: null,
      admin: null,
      user: null
    };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return {
    supabase,
    admin,
    user
  };
}

export async function POST(request: Request) {
  if (!ensureSameOriginRequest(request)) {
    return NextResponse.json({ success: false, message: "허용되지 않은 요청입니다." }, { status: 403 });
  }

  const { supabase, admin, user } = await getAuthenticatedClients();

  if (!supabase || !admin) {
    return NextResponse.json(
      { success: false, message: "현재 업로드 서비스를 준비 중입니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 }
    );
  }

  if (!user) {
    return NextResponse.json(
      { success: false, message: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  if (exceedsMultipartUploadLimit(request)) {
    return NextResponse.json(
      { success: false, message: "이미지 크기는 5MB 이하여야 합니다." },
      { status: 413 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, message: "업로드할 파일이 없습니다." },
      { status: 400 }
    );
  }

  if (!isStorageMimeType(file.type)) {
    return NextResponse.json(
      { success: false, message: "JPEG, PNG, WebP 이미지만 업로드할 수 있습니다." },
      { status: 400 }
    );
  }

  if (file.size > maxUploadBytes) {
    return NextResponse.json(
      { success: false, message: "이미지 크기는 5MB 이하여야 합니다." },
      { status: 400 }
    );
  }

  if (!(await isValidImageFile(file))) {
    return NextResponse.json(
      { success: false, message: "이미지 파일 형식이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  const fileExtension = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/${Date.now()}-${sanitizeFilename(file.name || `upload.${fileExtension}`)}`;

  const { data, error } = await admin.storage.from(INVITATION_ASSET_BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false
  });

  if (error || !data) {
    return NextResponse.json(
      { success: false, message: "이미지를 업로드하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }

  const { data: signedUrlData, error: signedUrlError } = await admin.storage
    .from(INVITATION_ASSET_BUCKET)
    .createSignedUrl(data.path, INVITATION_ASSET_TTL_SECONDS);

  if (signedUrlError || !signedUrlData?.signedUrl) {
    return NextResponse.json(
      { success: false, message: "이미지 미리보기 URL을 생성하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    publicUrl: signedUrlData.signedUrl,
    path: data.path
  });
}

export async function DELETE(request: Request) {
  if (!ensureSameOriginRequest(request)) {
    return NextResponse.json({ success: false, message: "허용되지 않은 요청입니다." }, { status: 403 });
  }

  const { supabase, admin, user } = await getAuthenticatedClients();

  if (!supabase || !admin) {
    return NextResponse.json(
      { success: false, message: "현재 업로드 서비스를 준비 중입니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 }
    );
  }

  if (!user) {
    return NextResponse.json(
      { success: false, message: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  const { path } = (await request.json().catch(() => ({ path: "" }))) as { path?: string };

  if (!path) {
    return NextResponse.json(
      { success: false, message: "삭제할 파일 경로가 없습니다." },
      { status: 400 }
    );
  }

  const ownerPrefix = `${user.id}/`;
  if (!path.startsWith(ownerPrefix)) {
    return NextResponse.json(
      { success: false, message: "본인 소유 파일만 삭제할 수 있습니다." },
      { status: 403 }
    );
  }

  const { error } = await admin.storage.from(INVITATION_ASSET_BUCKET).remove([path]);

  if (error) {
    return NextResponse.json(
      { success: false, message: "이미지를 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
