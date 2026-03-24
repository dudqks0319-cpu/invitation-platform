import { BuilderStudio } from "@/components/builder/builder-studio";
import { SiteHeader } from "@/components/shared/site-header";

export default async function BuilderPage({
  searchParams
}: {
  searchParams: Promise<{ template?: string; intent?: string; invitationId?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="builder-page">
      <SiteHeader />
      <div className="builder-page-main">
        <section className="builder-hero-strip">
          <div className="section-inner">
            <h1>초대장 만들기</h1>
            <p>기존 InviteHub의 시각 언어를 유지하면서, 초안 저장과 발행이 가능한 웹 빌더로 다시 구성했습니다.</p>
          </div>
        </section>
        <section className="builder-section builder-section-page">
          <div className="section-inner">
            <BuilderStudio
              initialInvitationId={params.invitationId}
              initialTemplateId={params.template}
              intentCheckout={params.intent === "checkout"}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
