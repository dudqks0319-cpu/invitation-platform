import Link from "next/link";
import Image from "next/image";
import { TemplateBrowser } from "@/components/landing/template-browser";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";

const features = [
  {
    title: "카테고리별 디자인",
    description: "결혼식, 돌잔치, 생일, 집들이까지 행사별 무드에 맞춰 고릅니다."
  },
  {
    title: "모바일 미리보기",
    description: "이름, 날짜, 장소를 넣으면 실제 공유 화면 기준으로 바로 확인합니다."
  },
  {
    title: "이미지 초대장 보조 제작",
    description: "직접 준비한 이미지 위에 글자만 얹는 화면도 따로 사용할 수 있습니다."
  }
];

const processSteps = [
  {
    step: "01",
    title: "템플릿 선택",
    description: "행사 종류와 분위기에 맞는 초대장 템플릿을 고릅니다."
  },
  {
    step: "02",
    title: "정보 입력",
    description: "날짜, 장소, 이름, 연락처 등 필요한 내용을 차근차근 입력합니다."
  },
  {
    step: "03",
    title: "미리보기와 공유",
    description: "모바일 초대장 화면을 확인하고 저장 또는 공유 단계로 이어갑니다."
  }
];

const heroShowcaseCards = [
  {
    alt: "애니 웨딩 청첩장 예시",
    badge: "Wedding",
    src: "/images/custom/barunson-category-anime-2026/wedding-02.jpg",
    title: "김민준 · 이서연"
  },
  {
    alt: "돌잔치 초대장 예시",
    badge: "Dol party",
    src: "/images/custom/barunson-category-anime-2026/dol-01.jpg",
    title: "하준 첫돌"
  }
];

export default function HomePage() {
  return (
    <main className="app-shell home-page">
      <SiteHeader />

      <section className="hero">
        <div className="hero-preview" aria-label="오삼오삼 대표 초대장 이미지">
          <div className="hero-showcase">
            <div className="phone-mock hero-phone-main">
              <div className="phone-screen">
                <div className="wedding-preview">
                  <Image
                    alt="오삼오삼 모바일 청첩장 예시"
                    className="hero-promo-image"
                    fill
                    priority
                    sizes="(max-width: 600px) 260px, 330px"
                    src="/images/custom/barunson-category-anime-2026/wedding-01.jpg"
                  />
                  <div className="hero-promo-copy">
                    <p className="preview-sub">Wedding Invitation</p>
                    <p className="preview-title font-display">김민준 ♡ 이서연</p>
                    <p className="preview-msg">서로의 계절이 되어 함께 걷겠습니다</p>
                  </div>
                  <div className="preview-chip-row">
                    <span>2026. 05. 10</span>
                    <span>라비에벨 가든홀</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="hero-showcase-cards" aria-label="다른 초대장 예시">
              {heroShowcaseCards.map((card) => (
                <article className="hero-mini-card" key={card.src}>
                  <div className="hero-mini-image">
                    <Image alt={card.alt} fill sizes="120px" src={card.src} />
                  </div>
                  <div>
                    <span>{card.badge}</span>
                    <strong>{card.title}</strong>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
        <div className="hero-content">
          <p className="hero-badge">모바일 초대장 템플릿</p>
          <h1 className="hero-title">
            마음에 드는 초대장을
            <br />
            고르면 제작은
            <br />
            1분이면 충분해요
          </h1>
          <p className="hero-subtitle">
            청첩장, 돌잔치, 생일, 집들이까지.
            <br />
            완성된 디자인을 먼저 보고
            <br />
            필요한 정보만 채우세요.
          </p>
          <div className="hero-proof-list">
            <span>프리미엄 청첩장</span>
            <span>돌잔치 초대장</span>
            <span>행사별 템플릿</span>
            <span>모바일 공유</span>
          </div>
          <div className="hero-btns">
            <Link className="btn-hero-primary" href="/builder">
              무료로 초대장 만들기
            </Link>
            <Link className="btn-hero-outline" href="/image-text">
              내 이미지로 만들기
            </Link>
          </div>
          <div className="hero-stats" aria-label="오삼오삼 템플릿 특징">
            <div className="stat">
              <strong>80+</strong>
              <span>모바일 템플릿</span>
            </div>
            <span className="stat-divider" />
            <div className="stat">
              <strong>9:16</strong>
              <span>공유 최적화</span>
            </div>
            <span className="stat-divider" />
            <div className="stat">
              <strong>무료</strong>
              <span>무료 제작</span>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="section-inner">
          <p className="section-kicker">핵심 기능</p>
          <h2 className="section-title">
            디자인을 먼저 보고,
            <br />
            필요한 정보만 채웁니다
          </h2>
          <p className="section-sub">
            템플릿 초대장을 기본 제작 방식으로 두고, 직접 준비한 이미지는 별도 제작 화면에서 사용할 수 있습니다.
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
          <h2 className="section-title">고르고, 채우고, 바로 확인</h2>
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
