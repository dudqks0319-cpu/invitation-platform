import Link from "next/link";
import {
  ArrowRight,
  Check,
  ImageIcon,
  MessageCircle,
  MousePointer2,
  Send,
  Smartphone,
  Sparkles
} from "lucide-react";
import { TemplateBrowser } from "@/components/landing/template-browser";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";

const processSteps = [
  {
    number: "01",
    title: "디자인 고르기",
    description: "행사에 어울리는 템플릿을 한 번만 선택하세요.",
    icon: MousePointer2
  },
  {
    number: "02",
    title: "사진과 글 바꾸기",
    description: "이름, 날짜, 장소와 사진만 내 정보로 바꾸면 됩니다.",
    icon: ImageIcon
  },
  {
    number: "03",
    title: "링크로 보내기",
    description: "완성된 초대장을 카카오톡과 문자로 바로 공유하세요.",
    icon: Send
  }
];

const productBenefits = [
  {
    icon: Smartphone,
    title: "휴대폰에서 바로 완성",
    description: "복잡한 디자인 도구 없이 손가락으로 차근차근 만들 수 있어요."
  },
  {
    icon: Sparkles,
    title: "행사별 템플릿 제공",
    description: "결혼, 돌잔치, 생일, 집들이 등 상황에 맞는 디자인을 골라요."
  },
  {
    icon: MessageCircle,
    title: "참석 여부와 방명록",
    description: "초대장을 보낸 뒤 참석 답변과 축하 메시지를 한곳에서 확인해요."
  }
];

export default function HomePage() {
  return (
    <main className="app-shell os-home">
      <SiteHeader />

      <section className="os-hero">
        <div className="os-shell os-hero-grid">
          <div className="os-hero-copy">
            <p className="os-eyebrow">
              <span aria-hidden="true">✦</span>
              초대장은 어렵지 않게
            </p>
            <h1>
              사진 고르고,
              <br />
              문구 바꾸면 끝.
            </h1>
            <p className="os-hero-description">
              오삼오삼은 누구나 쉽게 만드는 모바일 초대장이에요.
              <br className="os-desktop-break" />
              디자인을 고른 뒤 필요한 내용만 채워 바로 공유하세요.
            </p>
            <div className="os-hero-actions">
              <Link className="os-primary-cta" href="/builder">
                무료로 만들기
                <ArrowRight aria-hidden="true" size={19} />
              </Link>
              <a className="os-secondary-cta" href="#templates">
                템플릿 둘러보기
              </a>
            </div>
            <div className="os-proof-list" aria-label="서비스 특징">
              <span>
                <Check aria-hidden="true" size={16} /> 가입 없이 미리보기
              </span>
              <span>
                <Check aria-hidden="true" size={16} /> 모바일에 최적화
              </span>
              <span>
                <Check aria-hidden="true" size={16} /> 링크로 간편 공유
              </span>
            </div>
          </div>

          <div className="os-hero-visual" aria-label="오삼오삼 초대장 예시">
            <div className="os-floating-step os-floating-step-one">
              <strong>1</strong>
              디자인 선택
            </div>
            <div className="os-phone-frame">
              <div className="os-phone-camera" />
              <div className="os-phone-screen">
                <div
                  className="os-invitation-cover"
                  style={{
                    backgroundImage:
                      "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(33,25,20,0.58)), url(/images/genspark/cncrue0H.jpg)"
                  }}
                >
                  <div className="os-cover-topline">WEDDING INVITATION</div>
                  <div className="os-cover-copy">
                    <p>소중한 분들을 초대합니다</p>
                    <h2>민준 · 수아</h2>
                    <div className="os-cover-meta">
                      <span>2026. 05. 10</span>
                      <span>서울 더파인홀</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="os-floating-step os-floating-step-two">
              <strong>2</strong>
              사진과 문구 수정
            </div>
            <div className="os-floating-step os-floating-step-three">
              <strong>3</strong>
              링크로 공유 완료
            </div>
          </div>
        </div>
      </section>

      <section className="os-process" id="how-it-works">
        <div className="os-shell">
          <div className="os-section-heading">
            <p className="os-eyebrow">3단계면 충분해요</p>
            <h2>처음 만들어도 헤매지 않도록</h2>
            <p>한 화면에 한 가지 일만 보여드려요.</p>
          </div>
          <div className="os-process-grid">
            {processSteps.map(({ number, title, description, icon: Icon }) => (
              <article className="os-process-card" key={number}>
                <div className="os-process-icon">
                  <Icon aria-hidden="true" size={22} />
                </div>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <TemplateBrowser />

      <section className="os-benefits" id="features">
        <div className="os-shell">
          <div className="os-section-heading os-section-heading-left">
            <p className="os-eyebrow">필요한 기능만 담았어요</p>
            <h2>만들 때도, 보낼 때도 간단하게</h2>
            <p>예쁜 화면보다 실제로 끝까지 완성할 수 있는 경험을 먼저 생각했습니다.</p>
          </div>
          <div className="os-benefit-grid">
            {productBenefits.map(({ icon: Icon, title, description }) => (
              <article className="os-benefit-card" key={title}>
                <div className="os-benefit-icon">
                  <Icon aria-hidden="true" size={24} />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="os-final-cta">
        <div className="os-shell os-final-cta-inner">
          <div>
            <p className="os-eyebrow">지금 바로 시작하세요</p>
            <h2>내 초대장, 오늘 완성해 보세요.</h2>
            <p>템플릿을 고르면 작성 화면으로 바로 이어집니다.</p>
          </div>
          <Link className="os-primary-cta os-primary-cta-light" href="/builder">
            무료로 만들기
            <ArrowRight aria-hidden="true" size={19} />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
