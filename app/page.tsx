import Link from "next/link";
import { TemplateBrowser } from "@/components/landing/template-browser";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav";

const features = [
  {
    icon: "FREE",
    title: "기본 청첩장은 무료",
    description:
      "현재 공개된 템플릿은 무료로 만들고 미리보기할 수 있어 부담 없이 초대장을 시작할 수 있습니다."
  },
  {
    icon: "3,300",
    title: "사진까지 담고 싶다면 3,300원",
    description:
      "사진 포함 발행권 한 번이면 프로필 사진, 배경 사진, 갤러리 사진까지 모두 담아 완성할 수 있습니다."
  },
  {
    icon: "RSVP",
    title: "참석 여부와 방명록까지",
    description:
      "링크를 보낸 뒤에는 참석 여부와 축하 메시지까지 한 번에 받을 수 있습니다."
  },
  {
    icon: "LINK",
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
    description: "이름, 장소, 문구를 채우고 사진이 필요하면 사진 포함 발행권으로 한 번에 준비합니다."
  },
  {
    step: "03",
    title: "바로 발행 · 공유",
    description: "기본 구성은 무료로 발행하고, 사진이 포함되면 3,300원 발행권으로 마무리해 링크로 보낼 수 있습니다."
  }
];

const pricing = [
  {
    badge: "무료",
    title: "기본 청첩장",
    price: "무료",
    items: [
      "현재 공개 템플릿 전부 무료",
      "링크 공유 · 참석 여부 · 방명록 포함",
      "사진 없이 바로 발행 가능"
    ]
  },
  {
    badge: "인기",
    title: "사진 포함 발행권",
    price: "₩3,300",
    popular: true,
    items: [
      "프로필 사진 포함",
      "배경 사진 포함",
      "갤러리 사진 전체 포함",
      "한 번 구매로 초대장 1건 발행"
    ]
  }
];

export default function HomePage() {
  return (
    <main className="app-shell">
      <SiteHeader />

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-badge">기본 청첩장 무료 · 사진 포함 3,300원</p>
          <h1 className="hero-title">
            당신의 특별한 순간을
            <br />
            초대장으로 전하세요
          </h1>
          <p className="hero-subtitle">
            결혼, 돌잔치, 생일, 기념일까지.
            <br />
            다양한 템플릿으로 나만의 초대장을 무료로 만들어 보세요.
          </p>
          <div className="hero-proof-list">
            <span>기본 청첩장 무료</span>
            <span>사진 포함 발행권 3,300원</span>
            <span>링크 공유 · 참석 여부 · 방명록</span>
          </div>
          <div className="hero-btns">
            <Link className="btn-hero-primary" href="/builder">
              초대장 만들기
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
                <p className="preview-title font-display">이준서 &amp; 김은재</p>
                <p className="preview-msg">소중한 분들을 초대합니다</p>
                <div className="preview-chip-row">
                  <span>2025. 06. 21</span>
                  <span>더마음웨딩홀</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TemplateBrowser />

      {/* Features */}
      <section className="features-section" id="features">
        <div className="section-inner">
          <p className="section-kicker">WHY INVITE</p>
          <h2 className="section-title">
            가볍게 시작하고,
            <br />
            특별하게 완성하세요
          </h2>
          <p className="section-sub">
            기본 청첩장은 무료로 만들고, 사진이 포함된 초대장을 발행할 때만 3,300원 발행권을 사용합니다.
          </p>
          <div className="features-grid">
            {features.map((feature) => (
              <article className="feature-card" key={feature.title}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="process-section">
        <div className="section-inner">
          <p className="section-kicker">HOW IT WORKS</p>
          <h2 className="section-title">디자인 고르고, 내용 넣고, 바로 발행</h2>
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

      {/* Pricing */}
      <section className="pricing-section" id="pricing">
        <div className="section-inner">
          <p className="section-kicker">PRICING</p>
          <h2 className="section-title">무료로 시작하고, 사진이 들어가면 3,300원</h2>
          <p className="section-sub">사진이 포함된 초대장을 발행할 때만 3,300원 발행권이 필요하며, 프로필·배경·갤러리 사진이 모두 포함됩니다.</p>
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
                <Link className={`btn-price ${plan.popular ? "btn-primary" : ""}`} href="/builder">
                  시작하기
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
      <MobileBottomNav />
    </main>
  );
}
