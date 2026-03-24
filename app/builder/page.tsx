import { BuilderStudio } from "@/components/builder/builder-studio";
import { SiteHeader } from "@/components/shared/site-header";

export default async function BuilderPage({
  searchParams
}: {
  searchParams: Promise<{ template?: string; invitationId?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="builder-page">
      <SiteHeader />
      <div className="builder-page-main">
        <section className="builder-hero-strip">
          <div className="section-inner">
            <h1>초대장 만들기</h1>
            <p>
              템플릿을 선택하고, 정보를 입력하고, 발행하세요. 무료입니다.
            </p>
          </div>
        </section>
        <section className="builder-section builder-section-page">
          <div className="section-inner">
            <BuilderStudio
              initialInvitationId={params.invitationId}
              initialTemplateId={params.template}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
