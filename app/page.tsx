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

const pricing = [
  {
    badge: "START",
    title: "체험",
    price: "₩0",
    items: ["템플릿 탐색", "비회원 빌더", "미리보기 체험"]
  },
  {
    badge: "NOW",
    title: "초대장 발행",
    price: "₩4,900",
    items: ["커피 한 잔 가격으로 완성", "결제 후 자동 발행", "공개 링크 + RSVP + 방명록"]
  },
  {
    badge: "NEXT",
    title: "확장 단계",
    price: "추가 예정",
    items: ["결제", "카카오 알림", "모바일 앱"]
  }
];

export default function HomePage() {
  return (
    <main className="app-shell">
      <SiteHeader />
      <section className="hero">
        <div className="hero-content">
          <p className="hero-badge">✨ 초대장의 감성은 그대로, 구조는 다시</p>
          <h1 className="hero-title">
            소중한 순간을
            <br />
            특별하게 초대하세요
          </h1>
          <p className="hero-subtitle">
            기존 InviteHub 디자인 언어를 유지한 채,
            <br />
            저장, 발행, RSVP, 방명록까지 이어지는 실제 웹 앱으로 재구성했습니다.
          </p>
          <p className="hero-badge" style={{ marginTop: "6px" }}>
            커피 한 잔 가격으로 초대장 완성. 지금은 4,900원에 초대장을 보내세요.
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
              <strong>1</strong>
              <span>빌더 경험</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <strong>MVP</strong>
              <span>웹 앱 기반</span>
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
          <p className="section-sub">디자인 감성은 유지하고, 운영 가능한 구조로 바꿨습니다.</p>
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

      <section className="ops-section" id="ops">
        <div className="section-inner">
          <h2 className="section-title">현재 빌드 방향</h2>
          <p className="section-sub">디자인은 유지하고, 저장/공개/응답 플로우를 실제 앱 기준으로 정렬했습니다.</p>
          <div className="ops-grid">
            <article className="ops-card">
              <h3>데모 모드</h3>
              <p className="ops-value">즉시 사용 가능</p>
              <p className="ops-note">환경 변수가 없어도 빌더와 미리보기, 디자인 검토가 가능합니다.</p>
            </article>
            <article className="ops-card">
              <h3>Supabase 모드</h3>
              <p className="ops-value">실제 저장/발행</p>
              <p className="ops-note">환경 변수를 넣으면 로그인, 초안 저장, 공개 링크, RSVP, 방명록이 실제 데이터로 동작합니다.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="pricing-section" id="pricing">
        <div className="section-inner">
          <h2 className="section-title">실행 단계</h2>
          <p className="section-sub">현재 저장소 재구축은 웹 MVP 완성에 집중합니다.</p>
          <div className="pricing-grid">
            {pricing.map((plan) => (
              <article className={`price-card ${plan.title === "웹 MVP" ? "popular" : ""}`} key={plan.title}>
                <div className={`price-badge ${plan.badge === "FREE" ? "free" : plan.badge === "MVP" ? "popular-badge" : "premium"}`}>
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
                <Link className={`btn-price ${plan.title === "웹 MVP" ? "btn-primary" : ""}`} href="/builder">
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
