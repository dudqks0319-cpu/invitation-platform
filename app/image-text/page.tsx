import { ImageTextStudio } from "@/components/builder/image-text-studio";
import { CreateModeTabs } from "@/components/builder/create-mode-tabs";
import { SiteHeader } from "@/components/shared/site-header";

export default function ImageTextBuilderPage() {
  return (
    <main className="image-invite-page">
      <SiteHeader />
      <section className="image-invite-hero">
        <div className="section-inner">
          <h1>이미지 한 장을 올리면 초대장 글자가 바로 얹어집니다</h1>
          <p>
            사진, 일러스트, Canva 이미지에 행사 정보를 넣고 자동 배치한 뒤
            위치만 살짝 조정해 9:16 PNG로 저장하세요.
          </p>
          <CreateModeTabs activeMode="image" />
          <ol className="image-invite-steps" aria-label="이미지 초대장 제작 순서">
            <li>
              <span>1</span>
              이미지 올리기
            </li>
            <li>
              <span>2</span>
              문구 자동완성
            </li>
            <li>
              <span>3</span>
              글자 위치 조정
            </li>
            <li>
              <span>4</span>
              PNG 저장
            </li>
          </ol>
        </div>
      </section>
      <section className="image-invite-section-page">
        <div className="section-inner">
          <ImageTextStudio />
        </div>
      </section>
    </main>
  );
}
