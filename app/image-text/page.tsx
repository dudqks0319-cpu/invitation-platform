import { ImageTextStudio } from "@/components/builder/image-text-studio";
import { SiteHeader } from "@/components/shared/site-header";

export default function ImageTextBuilderPage() {
  return (
    <main className="builder-page image-text-page">
      <SiteHeader />
      <div className="builder-page-main">
        <section className="builder-hero-strip image-text-hero-strip">
          <div className="section-inner">
            <p className="section-kicker left">OSAM IMAGE INVITATION</p>
            <h1>이미지에 글자만 얹어 초대장 만들기</h1>
            <p>
              사용자가 준비한 사진, 일러스트, Canva 이미지 위에 초대장 문구를 자동 배치하고 직접 위치를 조정합니다.
              AI 이미지 생성이나 유료 기능 없이 무료 제작 흐름으로 제공합니다.
            </p>
          </div>
        </section>
        <section className="builder-section builder-section-page image-text-section-page">
          <div className="section-inner">
            <ImageTextStudio />
          </div>
        </section>
      </div>
    </main>
  );
}
