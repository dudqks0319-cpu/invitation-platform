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
              <p className="os-eyebrow">우리의 초대장</p>
              <h1>한 번에 다 쓰지 않아도 괜찮아요</h1>
              <p>먼저 날짜와 장소부터 적어보세요. 오른쪽에서 실제 모습을 보며 천천히 완성할 수 있어요.</p>
            </div>
            <ol className="os-builder-roadmap" aria-label="초대장 제작 순서">
              <li>
                <strong>1</strong>
                기본 내용
              </li>
              <li>
                <strong>2</strong>
                사진과 이야기
              </li>
              <li>
                <strong>3</strong>
                확인하고 보내기
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
