import Link from "next/link";
import { TemplateBrowser } from "@/components/landing/template-browser";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";

const freeFeatures = [
  {
    title: "청첩장 제작과 발행 무료",
    description:
      "현재 공개된 템플릿은 만들기, 미리보기, 공개 링크 발행까지 무료로 사용할 수 있습니다."
  },
  {
    title: "사진까지 무료로 반영",
    description:
      "메인 사진, 배경 사진, 갤러리 이미지를 올려도 추가 비용 없이 초대장에 반영됩니다."
  },
  {
    title: "참석 여부와 방명록까지",
    description:
      "링크를 보낸 뒤에는 참석 여부와 축하 메시지까지 한 번에 받을 수 있습니다."
  },
  {
    title: "링크 하나로 공유",
    description:
      "카카오톡, 문자, SNS 어디든. 링크 하나로 초대장, 지도, 계좌 안내, 방명록까지 함께 전달됩니다."
  }
];

const freeProcessSteps = [
  {
    step: "01",
    title: "디자인 선택",
    description: "현재 공개된 무료 디자인 중 마음에 드는 템플릿을 고르면 바로 시작됩니다."
  },
  {
    step: "02",
    title: "내용 입력",
    description: "이름, 장소, 문구를 채우고 초대장 미리보기를 확인합니다."
  },
  {
    step: "03",
    title: "바로 발행 · 공유",
    description: "사진이 포함된 구성도 무료로 발행하고 링크로 보낼 수 있습니다."
  }
];

const pricing = [
  {
    badge: "무료",
    title: "초대장 제작",
    price: "무료",
    popular: false,
    items: [
      "현재 공개 템플릿 전부 무료",
      "메인 · 배경 · 갤러리 사진 포함",
      "링크 공유 · 참석 여부 · 방명록 포함"
    ]
  }
];

export default function HomePage() {
  return (
    <main className="app-shell">
      <SiteHeader />

      <section className="hero">
        <div className="hero-content">
          <p className="hero-badge">기본 청첩장은 무료</p>
          <h1 className="hero-title">
            무료로 만들고,
            <br />
            바로 공유하세요
          </h1>
          <p className="hero-subtitle">
            청첩장은 무료로 만들고 미리보기할 수 있어요.
            <br />
            사용자 사진을 올려도 추가 비용 없이 공개 링크를 발행할 수 있습니다.
          </p>
          <div className="hero-proof-list">
            <span>초대장 제작 무료</span>
            <span>사진 업로드 무료</span>
            <span>링크 공유 · 참석 여부 · 방명록</span>
          </div>
          <div className="hero-btns">
            <Link className="btn-hero-primary" href="/builder">
              무료로 시작하기
            </Link>
            <a className="btn-hero-outline" href="#templates">
              디자인 둘러보기
            </a>
          </div>
        </div>
        <div className="hero-preview">
          <div className="phone-mock">
            <div className="phone-screen">
              <div
                className="wedding-preview"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgba(251,245,238,0.72), rgba(244,235,226,0.9)), url(/images/genspark/cncrue0H.jpg)"
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

      <TemplateBrowser />

      <section className="features-section" id="features">
        <div className="section-inner">
          <p className="section-kicker">가볍게 시작하세요</p>
          <h2 className="section-title">
            기본은 무료,
            <br />
            필요한 정보만 채우면 공유
          </h2>
          <p className="section-sub">
            템플릿 선택, 사진 업로드, 초안 작성, 미리보기, 공개 링크 발행까지 무료 발행 흐름으로 제공합니다.
          </p>
          <div className="features-grid">
            {freeFeatures.map((feature, index) => (
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
          <h2 className="section-title">디자인 고르고, 내용 넣고, 바로 발행</h2>
          <div className="process-grid">
            {freeProcessSteps.map((step) => (
              <article className="process-card" key={step.step}>
                <span>{step.step}</span>
                <strong>{step.title}</strong>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pricing-section" id="pricing">
        <div className="section-inner">
          <p className="section-kicker">요금 안내</p>
          <h2 className="section-title">
            모든 현재 기능을 무료로 시작
          </h2>
          <p className="section-sub">
            템플릿 선택, 초안 작성, 미리보기, 사진 업로드, 공개 링크 발행을 무료로 제공합니다.
          </p>
          <div className="pricing-grid">
            {pricing.map((plan) => (
              <article className={`price-card ${plan.popular ? "popular" : ""}`} key={plan.title}>
                <div className={`price-badge ${plan.popular ? "popular-badge" : "free"}`}>
                  {plan.badge}
                </div>
                <h3>{plan.title}</h3>
                <div className="price">{plan.price}</div>
                <ul>
                  {plan.items.map((item) => (
                    <li key={item}>
                      <span>•</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link className="btn-price" href="/builder">
                  시작하기
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
