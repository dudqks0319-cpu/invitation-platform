import Link from "next/link";
import { TemplateBrowser } from "@/components/landing/template-browser";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";

const features = [
  {
    title: "5분이면 완성",
    description:
      "템플릿을 고르고 날짜와 장소를 적으면, 링크로 바로 보낼 수 있는 초대장이 완성됩니다."
  },
  {
    title: "참석 여부 자동 수집",
    description:
      "하객이 초대장에서 바로 RSVP를 남기면, 호스트는 대시보드에서 참석 인원을 한눈에 확인할 수 있습니다."
  },
  {
    title: "감성 디자인 템플릿",
    description:
      "결혼식, 돌잔치, 생일, 집들이까지. 행사 분위기에 맞는 디자인을 고르고 바로 적용할 수 있습니다."
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
    description: "행사 분위기에 어울리는 템플릿을 고르면 바로 빌더가 시작됩니다."
  },
  {
    step: "02",
    title: "내용 입력",
    description: "이름, 장소, 사진, 계좌 정보까지 차근차근 입력하면 미리보기로 바로 확인할 수 있습니다."
  },
  {
    step: "03",
    title: "발행 후 공유",
    description: "결제를 마치면 공개 링크가 생성되고, 참석 응답과 방명록도 함께 받을 수 있습니다."
  }
];

const pricing = [
  {
    badge: "체험",
    title: "무료 미리보기",
    price: "₩0",
    items: [
      "모든 템플릿 둘러보기",
      "회원가입 없이 빌더 체험",
      "미리보기 화면 확인"
    ]
  },
  {
    badge: "발행",
    title: "초대장 발행",
    price: "₩4,900",
    popular: true,
    items: [
      "커피 한 잔 가격",
      "공개 링크 자동 생성",
      "RSVP + 방명록 + 지도 포함"
    ]
  }
];

export default function HomePage() {
  return (
    <main className="app-shell">
      <SiteHeader />

      <section className="hero">
        <div className="hero-content">
          <p className="hero-badge">당신의 소중한 날을 위한 초대장</p>
          <h1 className="hero-title">
            마음을 담은 초대장,
            <br />
            5분이면 완성
          </h1>
          <p className="hero-subtitle">
            감성적인 디자인과 간편한 기능을 하나로 담았습니다.
            <br />
            템플릿을 고르고 정보를 입력하면, 바로 공유할 수 있는 모바일 초대장이 완성됩니다.
          </p>
          <div className="hero-proof-list">
            <span>50+ 디자인 템플릿</span>
            <span>결혼·돌잔치·생일 맞춤</span>
            <span>링크 하나로 참석 확인까지</span>
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
          <p className="section-kicker">왜 InviteHub인가요</p>
          <h2 className="section-title">
            예쁘기만 한 초대장이 아니라,
            <br />
            보내기까지 편한 초대장
          </h2>
          <p className="section-sub">
            디자인부터 참석 관리까지, 초대장에 필요한 핵심 기능만 깔끔하게 담았습니다.
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
          <p className="section-kicker">이렇게 간단해요</p>
          <h2 className="section-title">고르고, 쓰고, 바로 보내기</h2>
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
          <p className="section-kicker">가격</p>
          <h2 className="section-title">커피 한 잔 가격으로 초대장 완성</h2>
          <p className="section-sub">체험은 무료, 발행은 4,900원 한 번이면 끝입니다.</p>
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
