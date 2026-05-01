import Link from "next/link";
import { redirect } from "next/navigation";
import { TemplateAdminStudio } from "@/components/admin/template-admin-studio";
import { SiteHeader } from "@/components/shared/site-header";
import { isTemplateAdminEmail } from "@/lib/template-admin";
import { fetchSafeTemplates } from "@/lib/template-repository";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AdminTemplatesPage() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return (
      <main className="admin-page">
        <SiteHeader />
        <section className="admin-page-hero">
          <div className="section-inner">
            <h1>템플릿 관리자</h1>
            <p>Supabase URL과 Anon Key를 먼저 설정해야 관리자 인증을 사용할 수 있습니다.</p>
          </div>
        </section>
      </main>
    );
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/sign-in?next=${encodeURIComponent("/admin/templates")}`);
  }

  const canManageTemplates = isTemplateAdminEmail(user.email);
  const templates = await fetchSafeTemplates({ includeInactive: true });

  return (
    <main className="admin-page">
      <SiteHeader />
      <section className="admin-page-hero">
        <div className="section-inner">
          <p className="section-kicker">SAFE TEMPLATE ADMIN</p>
          <h1>한국형 초대장 이미지 템플릿</h1>
          <p>
            배경 이미지만 업로드하고, 이름/일시/장소 문구는 앱이 안전영역 안에 직접 렌더링합니다.
          </p>
        </div>
      </section>
      <section className="admin-page-body">
        <div className="section-inner">
          {canManageTemplates ? (
            <TemplateAdminStudio initialTemplates={templates} />
          ) : (
            <div className="admin-denied">
              <h2>관리자 권한이 필요합니다</h2>
              <p>TEMPLATE_ADMIN_EMAILS 환경변수에 현재 로그인 이메일을 추가해 주세요.</p>
              <Link className="btn-outline" href="/dashboard">
                대시보드로 이동
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

