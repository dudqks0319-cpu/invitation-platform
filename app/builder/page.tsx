import { BuilderStudio } from "@/components/builder/builder-studio";
import { CreateModeTabs } from "@/components/builder/create-mode-tabs";
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
            <p className="builder-hero-kicker">우리의 초대장</p>
            <h1>한 번에 다 쓰지 않아도 괜찮아요</h1>
            <p>
              먼저 날짜와 장소부터 적어보세요.
              <br />
              사진과 문구는 천천히 골라도 괜찮아요.
            </p>
            <div className="builder-hero-benefits" aria-label="템플릿 초대장 제작 특징">
              <span>행사별 템플릿</span>
              <span>모바일 미리보기</span>
              <span>주소 검색</span>
              <span>공유 링크</span>
            </div>
            <CreateModeTabs activeMode="template" />
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
