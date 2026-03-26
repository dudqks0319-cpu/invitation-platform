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
            <p>정보와 사진을 차근차근 입력하시면 초대장을 저장하고, 결제 후 바로 공유하실 수 있습니다.</p>
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
