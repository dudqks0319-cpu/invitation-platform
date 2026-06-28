import Link from "next/link";
import { TemplateBrowser } from "@/components/landing/template-browser";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";

const features = [
  {
    title: "이미지는 사용자가 준비",
    description: "사진, 일러스트, Canva 결과물 등 원하는 이미지를 올리고 그 위에 초대장 글자를 얹습니다."
  },
  {
    title: "글자 위치 자동 배치",
    description: "이미지의 밝기를 보고 읽기 좋은 글자색과 기본 위치를 자동으로 잡습니다."
  },
  {
    title: "직접 위치 조정",
    description: "자동 배치가 마음에 들지 않으면 미리보기에서 글자를 끌어서 위치를 바꿀 수 있습니다."
  }
];

const processSteps = [
  {
    step: "01",
    title: "이미지 업로드",
    description: "사용자가 가진 사진이나 디자인 이미지를 올립니다."
  },
  {
    step: "02",
    title: "문구 자동완성",
    description: "결혼식, 돌잔치, 생일, 모임에 맞는 기본 문구를 바로 채웁니다."
  },
  {
    step: "03",
    title: "위치 조정",
    description: "자동 배치된 글자를 드래그하거나 슬라이더로 자연스럽게 맞춥니다."
  }
];

export default function HomePage() {
  return (
    <main className="app-shell">
      <SiteHeader />

      <section className="hero">
        <div className="hero-content">
          <p className="hero-badge">이미지 기반 초대장</p>
          <h1 className="hero-title">
            이미지 한 장에,
            <br />
            초대장 글자만 자연스럽게
          </h1>
          <p className="hero-subtitle">
            오삼오삼은 이미지 생성 플랫폼이 아닙니다.
            <br />
            사용자가 준비한 이미지 위에 문구를 자동 배치하고 직접 조정할 수 있게 돕습니다.
          </p>
          <div className="hero-proof-list">
            <span>이미지 업로드</span>
            <span>문구 자동완성</span>
            <span>글자 위치 수정</span>
          </div>
          <div className="hero-btns">
            <Link className="btn-hero-primary" href="/image-text">
              이미지로 만들기
            </Link>
            <Link className="btn-hero-outline" href="/builder">
              기존 초대장 빌더
            </Link>
          </div>
        </div>
        <div className="hero-preview">
          <div className="phone-mock">
            <div className="phone-screen">
              <div
                className="wedding-preview"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgba(251,245,238,0.42), rgba(20,20,20,0.52)), url(/images/genspark/cncrue0H.jpg)"
                }}
              >
                <p className="preview-sub">Wedding Invitation</p>
                <p className="preview-title font-display">Minjun &amp; Sua</p>
                <p className="preview-msg">소중한 분들을 초대합니다</p>
                <div className="preview-chip-row">
                  <span>2026. 05. 10</span>
                  <span>서울 더파인홀</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="section-inner">
          <p className="section-kicker">핵심 기능</p>
          <h2 className="section-title">
            플랫폼을 무겁게 만들지 않고,
            <br />
            글자 합성에 집중합니다
          </h2>
          <p className="section-sub">
            많은 디자인 템플릿을 직접 만들기보다 사용자가 준비한 이미지를 바로 초대장처럼 보이게 만드는 흐름입니다.
          </p>
          <div className="features-grid">
            {features.map((feature, index) => (
              <article className="feature-card" key={feature.title}>
                <div className="feature-icon">{String(index + 1).padStart(2, "0")}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="process-section">
        <div className="section-inner">
          <p className="section-kicker">이렇게 진행돼요</p>
          <h2 className="section-title">이미지 올리고, 문구 넣고, 위치만 맞추기</h2>
          <div className="process-grid">
            {processSteps.map((step) => (
              <article className="process-card" key={step.step}>
                <span>{step.step}</span>
                <strong>{step.title}</strong>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <TemplateBrowser />

      <SiteFooter />
    </main>
  );
}
