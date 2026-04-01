import Link from "next/link";
import { TemplateBrowser } from "@/components/landing/template-browser";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";

const features = [
  {
    title: "현재 디자인은 무료",
    description:
      "지금 공개된 템플릿은 비용 걱정 없이 고르고 바로 초대장을 시작할 수 있습니다."
  },
  {
    title: "옵션만 필요한 만큼",
    description:
      "인물사진, 배경사진, 갤러리처럼 필요한 요소만 추가해서 부담 없이 완성도를 높일 수 있습니다."
  },
  {
    title: "응답과 방명록까지",
    description:
      "링크를 보낸 뒤에는 참석 여부와 축하 메시지까지 한 번에 받을 수 있습니다."
  },
  {
    title: "링크 하나로 공유",
    description:
      "카카오톡, 문자, SNS 어디든. 링크 하나로 초대장, 지도, 계좌 안내, 방명록까지 함께 전달됩니다."
  }
];

const processSteps = [
  {
    step: "01",
    title: "디자인 선택",
    description: "현재 공개된 무료 디자인 중 마음에 드는 템플릿을 고르면 바로 시작됩니다."
  },
  {
    step: "02",
    title: "내용 입력",
    description: "이름, 장소, 문구를 채우고 필요하면 사진 옵션만 더해 완성도를 높입니다."
  },
  {
    step: "03",
    title: "바로 발행 · 공유",
    description: "무료 구성은 바로 발행하고, 옵션이 있으면 필요한 만큼만 결제해 링크로 보낼 수 있습니다."
  }
];

const pricing = [
  {
    badge: "무료",
    title: "현재 디자인 전체",
    price: "₩0",
    items: [
      "현재 공개 템플릿 전부 무료",
      "링크 · RSVP · 방명록 포함",
      "부담 없이 바로 시작 가능"
    ]
  },
  {
    badge: "옵션",
    title: "사진 애드온",
    price: "필요한 만큼",
    popular: true,
    items: [
      "인물사진 추가 500원",
      "배경사진 추가 500원",
      "갤러리 10장당 1,000원"
    ]
  }
];

export default function HomePage() {
  return (
    <main className="app-shell">
      <SiteHeader />

      <section className="hero">
        <div className="hero-content">
          <p className="hero-badge">지금 있는 디자인, 전부 무료</p>
          <h1 className="hero-title">
            예쁜 초대장,
            <br />
            지금은 무료로 시작
          </h1>
          <p className="hero-subtitle">
            현재 공개된 디자인은 모두 무료예요.
            <br />
            필요한 경우에만 사진 옵션을 더해, 부담 없이 시작하고 정성껏 완성해 보세요.
          </p>
          <div className="hero-proof-list">
            <span>현재 디자인 전부 무료</span>
            <span>사진 옵션만 필요한 만큼</span>
            <span>링크 · RSVP · 방명록 한 번에</span>
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
            필요한 만큼만 더하기
          </h2>
          <p className="section-sub">
            초대장 자체는 무료로 만들고, 사진 옵션만 선택적으로 추가하는 방식으로 부담을 낮췄습니다.
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
          <h2 className="section-title">디자인 고르고, 내용 넣고, 원하는 옵션만</h2>
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

      <section className="pricing-section" id="pricing">
        <div className="section-inner">
          <p className="section-kicker">요금 안내</p>
          <h2 className="section-title">현재 디자인은 모두 무료예요</h2>
          <p className="section-sub">나중에 새로 공개되는 특별 디자인만 유료로 운영하고, 지금은 사진 옵션만 추가 비용이 있습니다.</p>
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
