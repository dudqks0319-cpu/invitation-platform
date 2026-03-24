import Link from "next/link";
import { TemplateBrowser } from "@/components/landing/template-browser";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";

const features = [
  { icon: "📊", title: "실시간 RSVP 관리", description: "하객 응답과 동행 인원을 한 번에 관리합니다." },
  { icon: "🗺️", title: "지도 & 교통 안내", description: "네이버 지도 링크와 교통 메모를 함께 전달합니다." },
  { icon: "💳", title: "계좌 & 카카오페이", description: "마음 전하실 곳 정보를 보기 좋게 정리합니다." },
  { icon: "✏️", title: "초안 저장과 발행", description: "작성 중인 초안과 발행된 링크를 분리해 운영합니다." }
];

const steps = [
  {
    badge: "STEP 1",
    title: "템플릿 선택",
    items: ["결혼식, 돌잔치, 환갑 등 30+ 템플릿", "카테고리별 탐색"]
  },
  {
    badge: "STEP 2",
    title: "내용 작성",
    items: ["5단계 빌더로 쉽게 작성", "사진 업로드, 계좌, 지도 설정"]
  },
  {
    badge: "STEP 3",
    title: "발행 & 공유",
    items: ["공개 링크 생성", "카카오톡, SNS로 바로 공유"]
  }
];

export default function HomePage() {
  return (
    <main className="app-shell">
      <SiteHeader />
      <section className="hero">
        <div className="hero-content">
          <p className="hero-badge">✨ 한국 결혼 문화에 맞춘 초대장 플랫폼</p>
          <h1 className="hero-title">
            소중한 순간을
            <br />
            특별하게 초대하세요
          </h1>
          <p className="hero-subtitle">
            양가 정보, 축의금 계좌, 네이버 지도, RSVP, 방명록까지
            <br />
            한국 결혼식에 필요한 모든 것을 담았습니다.
          </p>
          <p className="hero-badge" style={{ marginTop: "6px" }}>
            무료로 초대장을 만들고 바로 공유하세요.
          </p>
          <div className="hero-btns">
            <Link className="btn-hero-primary" href="/builder">
              무료로 만들기
            </Link>
            <a className="btn-hero-outline" href="#templates">
              템플릿 둘러보기
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <strong>30+</strong>
              <span>템플릿</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <strong>무료</strong>
              <span>MVP</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <strong>RSVP</strong>
              <span>실시간 관리</span>
            </div>
          </div>
        </div>
        <div className="hero-preview">
          <div className="phone-mock">
            <div className="phone-screen">
              <div className="wedding-preview">
                <div className="preview-flower">🌸</div>
                <p className="preview-sub">2026. 04. 12</p>
                <p className="preview-title font-display">Kim &amp; Lee</p>
                <p className="preview-msg">저희 두 사람이 하나가 됩니다</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TemplateBrowser />

      <section className="features-section" id="features">
        <div className="section-inner">
          <h2 className="section-title">왜 InviteHub인가요?</h2>
          <p className="section-sub">한국 결혼 문화에 특화된 디지털 초대장 플랫폼입니다.</p>
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

      <section className="pricing-section" id="pricing">
        <div className="section-inner">
          <h2 className="section-title">간단한 3단계</h2>
          <p className="section-sub">템플릿 선택 → 내용 작성 → 발행. 그게 끝입니다.</p>
          <div className="pricing-grid">
            {steps.map((step) => (
              <article className="price-card" key={step.title}>
                <div className="price-badge">{step.badge}</div>
                <h3>{step.title}</h3>
                <ul>
                  {step.items.map((item) => (
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
