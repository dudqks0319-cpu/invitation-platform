import { NextResponse } from "next/server";
import {
  normalizeSafeTemplate,
  safeTemplateCreateSchema,
  templateSlugFromTitle
} from "@/lib/safe-templates";
import { isTemplateAdminEmail } from "@/lib/template-admin";
import { fetchSafeTemplates, toTemplateInsert } from "@/lib/template-repository";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ensureJsonRequest, readJsonBody } from "@/lib/supabase/public-write";

async function getAdminUser() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { status: 503 as const, user: null, message: "Supabase 인증 설정이 필요합니다." };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: 401 as const, user: null, message: "로그인이 필요합니다." };
  }

  if (!isTemplateAdminEmail(user.email)) {
    return { status: 403 as const, user: null, message: "템플릿 관리자 권한이 필요합니다." };
  }

  return { status: 200 as const, user, message: "" };
}

export async function GET() {
  const adminCheck = await getAdminUser();
  if (!adminCheck.user) {
    return NextResponse.json({ success: false, message: adminCheck.message }, { status: adminCheck.status });
  }

  const templates = await fetchSafeTemplates({ includeInactive: true });

  return NextResponse.json({ success: true, templates });
}

export async function POST(request: Request) {
  const adminCheck = await getAdminUser();
  if (!adminCheck.user) {
    return NextResponse.json({ success: false, message: adminCheck.message }, { status: adminCheck.status });
  }

  if (!ensureJsonRequest(request)) {
    return NextResponse.json({ success: false, message: "JSON 요청만 허용됩니다." }, { status: 415 });
  }

  const json = await readJsonBody(request);
  if (!json.ok) {
    return NextResponse.json({ success: false, message: json.message }, { status: 400 });
  }

  const parsed = safeTemplateCreateSchema.safeParse(json.body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "템플릿 입력값을 확인해 주세요.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ success: false, message: "템플릿 저장용 서버 키 설정이 필요합니다." }, { status: 503 });
  }

  const template = normalizeSafeTemplate({
    ...parsed.data,
    id: parsed.data.id || templateSlugFromTitle(parsed.data.title),
    ornament: "imageBackground",
    isActive: parsed.data.isActive ?? true
  });

  const { error } = await admin
    .from("invitation_templates")
    .upsert(toTemplateInsert(template, adminCheck.user.id), { onConflict: "id" });

  if (error) {
    return NextResponse.json(
      { success: false, message: "템플릿을 저장하지 못했습니다. Supabase 마이그레이션 적용 여부를 확인해 주세요." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, template });
}

