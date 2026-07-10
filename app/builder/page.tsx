import { BuilderStudio } from "@/components/builder/builder-studio";
import { SiteHeader } from "@/components/shared/site-header";

export default async function BuilderPage({
  searchParams
}: {
  searchParams: Promise<{ template?: string; intent?: string; invitationId?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="builder-page os-builder-page">
      <SiteHeader mode="focus" />
      <div className="builder-page-main">
        <section className="builder-hero-strip">
          <div className="section-inner os-builder-intro">
            <div>
              <p className="os-eyebrow">초대장 만들기</p>
              <h1>필요한 내용만 차근차근 입력하세요</h1>
              <p>오른쪽 미리보기를 확인하며 작성하고, 마지막 단계에서 공개 링크를 만들 수 있어요.</p>
            </div>
            <ol className="os-builder-roadmap" aria-label="초대장 제작 순서">
              <li>
                <strong>1</strong>
                내용 입력
              </li>
              <li>
                <strong>2</strong>
                사진 추가
              </li>
              <li>
                <strong>3</strong>
                미리보기 · 공유
              </li>
            </ol>
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
