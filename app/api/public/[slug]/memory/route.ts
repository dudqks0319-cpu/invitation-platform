import { NextResponse } from "next/server";
import { INVITATION_ASSET_BUCKET } from "@/lib/invitation-assets";
import { consumeRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { maxUploadBytes, storageMimeTypes } from "@/lib/supabase/public-write";

const WINDOW_MS = 60 * 1000;
const LIMIT = 3;

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "사진 업로드 서비스를 준비 중입니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 }
    );
  }

  const { slug } = await context.params;
  const limitResult = await consumeRateLimit({
    admin,
    key: `memory:${slug}:${getClientIdentifier(request)}`,
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
      { success: false, message: "사진 업로드 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((limitResult.resetAt - Date.now()) / 1000))
        }
      }
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

  const formData = await request.formData();
  const file = formData.get("file");
  const nickname = String(formData.get("nickname") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const website = String(formData.get("website") || "").trim();

  if (website) {
    return NextResponse.json({ success: true, message: "사진이 접수되었습니다." });
  }

  if (!nickname || nickname.length > 30) {
    return NextResponse.json(
      { success: false, message: "이름은 1~30자 사이로 입력해 주세요." },
      { status: 400 }
    );
  }

  if (message.length > 200) {
    return NextResponse.json(
      { success: false, message: "사진 설명은 200자 이하로 입력해 주세요." },
      { status: 400 }
    );
  }

  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, message: "업로드할 사진을 선택해 주세요." },
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
  const storagePath = `memory/${invitation.id}/${Date.now()}-${sanitizeFilename(file.name || `memory.${fileExtension}`)}`;
  const { data: uploaded, error: uploadError } = await admin.storage
    .from(INVITATION_ASSET_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false
    });

  if (uploadError || !uploaded) {
    return NextResponse.json(
      { success: false, message: "사진을 업로드하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }

  const { error: insertError } = await admin.from("memory_photos").insert({
    invitation_id: invitation.id,
    nickname,
    message: message || null,
    storage_path: uploaded.path,
    approved: false
  });

  if (insertError) {
    await admin.storage.from(INVITATION_ASSET_BUCKET).remove([uploaded.path]);
    return NextResponse.json(
      { success: false, message: "사진 접수에 실패했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "사진이 접수되었습니다. 호스트 확인 후 공개됩니다."
  });
}
