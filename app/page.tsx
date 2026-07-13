import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ClipboardCheck,
  LayoutGrid,
  MapPinned,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { TemplateBrowser } from "@/components/landing/template-browser";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { featuredGensparkImages, gensparkAssetCount } from "@/lib/genspark-gallery";

const features = [
  { icon: Sparkles, title: "프리미엄 카드 무드", description: "종이 카드처럼 정돈된 레이아웃과 수채화 플로럴 자산을 기본 무드로 제공합니다." },
  { icon: ClipboardCheck, title: "실시간 RSVP 관리", description: "하객 응답과 동행 인원을 공개 링크에서 바로 수집하고 대시보드에서 확인합니다." },
  { icon: MapPinned, title: "지도 · 교통 · 계좌", description: "오시는 길, 교통 안내, 마음 전하실 곳 정보를 한 화면에 정리합니다." },
  { icon: ShieldCheck, title: "초안과 발행 분리", description: "작성 중인 초안과 결제 후 공개 링크 상태를 분리해 실제 운영 흐름에 맞춥니다." }
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
      <section
        className="hero"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0.74)), url(${featuredGensparkImages[0].src})`
        }}
      >
        <div className="hero-content">
          <p className="hero-badge">
            <Sparkles aria-hidden="true" size={15} strokeWidth={2} />
            INVITEHUB MOBILE INVITATION
          </p>
          <h1 className="hero-title">
            모바일 초대장,
            <br />
            <span>InviteHub</span>
          </h1>
          <p className="hero-subtitle">
            종이 카드의 여백과 감성은 그대로.
            만들기부터 RSVP, 공개 링크까지 한 번에 완성하세요.
          </p>
          <div className="hero-proof-list">
            <span><Check aria-hidden="true" size={15} />{gensparkAssetCount}개 무드 자산</span>
            <span><Check aria-hidden="true" size={15} />8가지 행사</span>
            <span><Check aria-hidden="true" size={15} />RSVP 실시간 수집</span>
          </div>
          <div className="hero-btns">
            <Link className="btn-hero-primary" href="/builder">
              <span>초대장 만들기</span>
              <ArrowRight aria-hidden="true" size={18} strokeWidth={2.2} />
            </Link>
            <a className="btn-hero-outline" href="#templates">
              <LayoutGrid aria-hidden="true" size={18} strokeWidth={2} />
              <span>템플릿 보기</span>
            </a>
          </div>
        </div>
        <a aria-label="추천 무드 보기" className="hero-scroll-cue" href="#curation" title="추천 무드 보기">
          <ChevronDown aria-hidden="true" size={20} />
        </a>
      </section>

      <section className="curation-section" id="curation">
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

      <TemplateBrowser />

      <section className="features-section" id="features">
        <div className="section-inner">
          <p className="section-kicker">WHY INVITEHUB</p>
          <h2 className="section-title">보기 좋은 것에서 끝나지 않는 초대장</h2>
          <p className="section-sub">무드와 운영 플로우가 함께 살아 있는 실제 서비스형 구조로 정리했습니다.</p>
          <div className="features-grid">
            {features.map(({ icon: FeatureIcon, title, description }) => (
              <article className="feature-card" key={title}>
                <div className="feature-icon">
                  <FeatureIcon aria-hidden="true" size={22} strokeWidth={1.8} />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
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
                      <Check aria-hidden="true" size={16} strokeWidth={2.2} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link className={`btn-price ${plan.title === "실제 발행" ? "btn-primary" : ""}`} href="/builder">
                  <span>시작하기</span>
                  <ArrowRight aria-hidden="true" size={16} strokeWidth={2.2} />
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
