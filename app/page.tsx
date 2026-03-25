import Link from "next/link";
import { TemplateBrowser } from "@/components/landing/template-browser";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { featuredGensparkImages, gensparkArchiveImages, gensparkAssetCount } from "@/lib/genspark-gallery";

const features = [
  { icon: "✉️", title: "프리미엄 카드 무드", description: "종이 카드처럼 정돈된 레이아웃과 수채화 플로럴 자산을 기본 무드로 제공합니다." },
  { icon: "📊", title: "실시간 RSVP 관리", description: "하객 응답과 동행 인원을 공개 링크에서 바로 수집하고 대시보드에서 확인합니다." },
  { icon: "🗺️", title: "지도 · 교통 · 계좌", description: "오시는 길, 교통 안내, 마음 전하실 곳 정보를 한 화면에 정리합니다." },
  { icon: "🔒", title: "초안과 발행 분리", description: "작성 중인 초안과 결제 후 공개 링크 상태를 분리해 실제 운영 흐름에 맞춥니다." }
];

const pricing = [
  {
    badge: "TRY",
    title: "무드 탐색",
    price: "₩0",
    items: ["템플릿 탐색", "비회원 빌더", "미리보기 체험"]
  },
  {
    badge: "LIVE",
    title: "실제 발행",
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

const processSteps = [
  { step: "01", title: "무드 선택", description: "행사 성격에 맞는 카드 톤과 템플릿을 먼저 고릅니다." },
  { step: "02", title: "정보 입력", description: "일시, 장소, 연락처, 계좌, 사진을 실제 발행 기준으로 정리합니다." },
  { step: "03", title: "발행 · 수집", description: "결제 후 공개 링크를 발행하고 RSVP와 방명록을 바로 수집합니다." }
];

export default function HomePage() {
  return (
    <main className="app-shell">
      <SiteHeader />
      <section className="hero">
        <div className="hero-content">
          <p className="hero-badge">PREMIUM MOBILE INVITATION</p>
          <h1 className="hero-title">
            종이 카드의 품격을
            <br />
            모바일 초대장으로 옮기세요
          </h1>
          <p className="hero-subtitle">
            바른손카드처럼 첫인상이 고급스럽고,
            실제 RSVP와 공개 링크 운영까지 되는 초대장 웹 앱을 목표로 다시 다듬었습니다.
          </p>
          <div className="hero-proof-list">
            <span>68개 Genspark 아트워크 자산</span>
            <span>행사별 템플릿 탐색</span>
            <span>공개 링크 · RSVP · 방명록</span>
          </div>
          <div className="hero-btns">
            <Link className="btn-hero-primary" href="/builder">
              지금 초대장 만들기
            </Link>
            <a className="btn-hero-outline" href="#templates">
              템플릿 둘러보기
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <strong>{gensparkAssetCount}</strong>
              <span>무드 자산</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <strong>8+</strong>
              <span>행사 카테고리</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <strong>LIVE</strong>
              <span>발행 플로우</span>
            </div>
          </div>
        </div>
        <div className="hero-preview">
          <div className="phone-mock">
            <div className="phone-screen">
              <div className="wedding-preview" style={{ backgroundImage: `linear-gradient(180deg, rgba(251,245,238,0.72), rgba(244,235,226,0.9)), url(${featuredGensparkImages[0].src})` }}>
                <p className="preview-sub">Premium Floral Card</p>
                <p className="preview-title font-display">Minjun &amp; Sua</p>
                <p className="preview-msg">소중한 날의 여백과 꽃을 모바일 초대장 톤으로 담았습니다.</p>
                <div className="preview-chip-row">
                  <span>{featuredGensparkImages[0].tone}</span>
                  <span>RSVP Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="curation-section">
        <div className="section-inner">
          <p className="section-kicker">CURATED ARTWORK</p>
          <h2 className="section-title">무드가 먼저 보이는 첫 화면</h2>
          <p className="section-sub">Genspark에서 정리한 플로럴 아트워크를 실제 랜딩 자산으로 연결했습니다.</p>
          <div className="curation-grid">
            {featuredGensparkImages.slice(0, 6).map((image) => (
              <article className="curation-card" key={image.src}>
                <div className="curation-image" style={{ backgroundImage: `url(${image.src})` }} />
                <div className="curation-copy">
                  <p>{image.tone}</p>
                  <strong>{image.title}</strong>
                  <span>{image.note}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <TemplateBrowser archiveImages={gensparkArchiveImages} featuredImages={featuredGensparkImages} />

      <section className="features-section" id="features">
        <div className="section-inner">
          <p className="section-kicker">WHY INVITEHUB</p>
          <h2 className="section-title">보기 좋은 것에서 끝나지 않는 초대장</h2>
          <p className="section-sub">무드와 운영 플로우가 함께 살아 있는 실제 서비스형 구조로 정리했습니다.</p>
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

      <section className="process-section">
        <div className="section-inner">
          <p className="section-kicker">FLOW</p>
          <h2 className="section-title">고르고, 쓰고, 바로 발행하는 흐름</h2>
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

      <section className="ops-section" id="ops">
        <div className="section-inner">
          <p className="section-kicker">OPS</p>
          <h2 className="section-title">현재 빌드 방향</h2>
          <p className="section-sub">디자인 감성은 유지하고, 저장/공개/응답 플로우는 실제 앱 기준으로 정렬했습니다.</p>
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
          <p className="section-kicker">PRICING</p>
          <h2 className="section-title">실행 단계</h2>
          <p className="section-sub">체험부터 실제 발행까지, 현재 웹 MVP 완성에 집중하고 있습니다.</p>
          <div className="pricing-grid">
            {pricing.map((plan) => (
              <article className={`price-card ${plan.title === "실제 발행" ? "popular" : ""}`} key={plan.title}>
                <div className={`price-badge ${plan.badge === "TRY" ? "free" : plan.badge === "LIVE" ? "popular-badge" : "premium"}`}>
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
