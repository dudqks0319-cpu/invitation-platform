import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { maxUploadBytes, storageMimeTypes } from "@/lib/supabase/public-write";

const STORAGE_BUCKET = "invitation-assets";

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
  const { supabase, admin, user } = await getAuthenticatedClients();

  if (!supabase || !admin) {
    return NextResponse.json(
      { success: false, message: "Supabase server configuration is incomplete." },
      { status: 503 }
    );
  }

  if (!user) {
    return NextResponse.json(
      { success: false, message: "로그인이 필요합니다." },
      { status: 401 }
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

  if (!storageMimeTypes.includes(file.type as (typeof storageMimeTypes)[number])) {
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

  const fileExtension = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/${Date.now()}-${sanitizeFilename(file.name || `upload.${fileExtension}`)}`;

  const { data, error } = await admin.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false
  });

  if (error || !data) {
    return NextResponse.json(
      { success: false, message: error?.message ?? "업로드에 실패했습니다." },
      { status: 500 }
    );
  }

  const { data: publicUrlData } = admin.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);

  return NextResponse.json({
    success: true,
    publicUrl: publicUrlData.publicUrl,
    path: data.path
  });
}

export async function DELETE(request: Request) {
  const { supabase, admin, user } = await getAuthenticatedClients();

  if (!supabase || !admin) {
    return NextResponse.json(
      { success: false, message: "Supabase server configuration is incomplete." },
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

  const { error } = await admin.storage.from(STORAGE_BUCKET).remove([path]);

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
