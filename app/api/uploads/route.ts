import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { maxUploadBytes, storageMimeTypes } from "@/lib/supabase/public-write";

const STORAGE_BUCKET = "invitation-assets";

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9가-힣._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .slice(0, 100);
}

async function getAuthenticatedClients() {
  const admin = createSupabaseAdminClient();
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  return { supabase, admin, user };
}

export async function POST(request: Request) {
  const clients = await getAuthenticatedClients();
  if (!clients) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  }

  if (!storageMimeTypes.has(file.type)) {
    return NextResponse.json(
      { error: `허용되지 않는 파일 형식입니다. JPEG, PNG, WebP만 업로드 가능합니다. (받은 형식: ${file.type})` },
      { status: 400 }
    );
  }

  if (file.size > maxUploadBytes) {
    return NextResponse.json(
      { error: `파일 크기가 10MB를 초과합니다. (현재: ${(file.size / 1024 / 1024).toFixed(1)}MB)` },
      { status: 400 }
    );
  }

  const uploadClient = clients.admin ?? clients.supabase;
  const safeName = sanitizeFilename(file.name);
  const path = `${clients.user.id}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await uploadClient.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false
    });

  if (uploadError) {
    return NextResponse.json(
      { error: "업로드에 실패했습니다.", message: uploadError.message },
      { status: 500 }
    );
  }

  const {
    data: { publicUrl }
  } = uploadClient.storage.from(STORAGE_BUCKET).getPublicUrl(path);

  return NextResponse.json({ publicUrl, path });
}

export async function DELETE(request: Request) {
  const clients = await getAuthenticatedClients();
  if (!clients) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = (await request.json()) as { path?: string };
  if (!body.path || typeof body.path !== "string") {
    return NextResponse.json({ error: "삭제할 파일 경로가 없습니다." }, { status: 400 });
  }

  if (!body.path.startsWith(`${clients.user.id}/`)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const deleteClient = clients.admin ?? clients.supabase;
  const { error } = await deleteClient.storage
    .from(STORAGE_BUCKET)
    .remove([body.path]);

  if (error) {
    return NextResponse.json(
      { error: "삭제에 실패했습니다.", message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
