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
            <p className="builder-hero-kicker">TEMPLATE INVITATION</p>
            <h1>
              디자인을 고르고,
              <br />
              정보만 채우세요
            </h1>
            <p>바른손카드처럼 템플릿을 먼저 둘러보고 선택한 뒤, 이름과 날짜, 장소를 입력해 모바일 초대장을 완성합니다.</p>
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
