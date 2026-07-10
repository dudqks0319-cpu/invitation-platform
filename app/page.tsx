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
import { TemplateMarkup } from "@/components/landing/template-markup";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { templates } from "@/lib/templates";

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

const featuredTemplateIds = ["dol-cute", "birthday-fun", "bridal-pink", "house-warm"];
const featuredTemplates = featuredTemplateIds
  .map((id) => templates.find((template) => template.id === id))
  .filter((template): template is NonNullable<typeof template> => Boolean(template));

function getTemplateStartUrl(templateId: string) {
  return `/builder/start?template=${encodeURIComponent(templateId)}`;
}

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
              <Link className="os-primary-cta" href={getTemplateStartUrl(featuredTemplates[0]?.id ?? "dol-cute")}>
                애니 감성으로 만들기
                <ArrowRight aria-hidden="true" size={19} />
              </Link>
              <a className="os-secondary-cta" href="#featured-templates">
                메인 디자인 보기
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

          <div className="os-hero-visual os-anime-showcase" aria-label="오삼오삼 애니 감성 초대장 예시">
            <div className="os-anime-showcase-label">
              <Sparkles aria-hidden="true" size={16} />
              먼저 보는 애니 감성 디자인
            </div>
            <div className="os-anime-card-stack">
              {featuredTemplates.slice(0, 3).map((template, index) => (
                <Link
                  aria-label={`${template.name} 템플릿으로 만들기`}
                  className={`os-anime-template-card os-anime-template-card-${index + 1}`}
                  href={getTemplateStartUrl(template.id)}
                  key={template.id}
                >
                  <TemplateMarkup template={template} variant="browser" />
                  <span className="os-anime-template-caption">
                    <small>{template.badge}</small>
                    <strong>{template.name}</strong>
                  </span>
                </Link>
              ))}
            </div>
            <p className="os-anime-showcase-help">카드를 누르면 선택한 디자인으로 바로 시작해요.</p>
          </div>
        </div>
      </section>

      <section className="os-featured-templates" id="featured-templates" aria-labelledby="featured-template-title">
        <div className="os-shell">
          <div className="os-featured-heading-row">
            <div className="os-section-heading os-section-heading-left">
              <p className="os-eyebrow">오삼오삼 메인 디자인</p>
              <h2 id="featured-template-title">따뜻한 애니 감성 템플릿부터</h2>
              <p>처음 들어오자마자 인기 일러스트 디자인을 보고 바로 만들 수 있어요.</p>
            </div>
            <a className="os-featured-all-link" href="#templates">
              전체 템플릿 보기 <ArrowRight aria-hidden="true" size={17} />
            </a>
          </div>
          <div className="os-featured-template-grid">
            {featuredTemplates.map((template) => (
              <article className="os-featured-template-card" key={template.id}>
                <Link
                  aria-label={`${template.name} 템플릿 미리보기와 제작 시작`}
                  className="os-featured-template-preview"
                  href={getTemplateStartUrl(template.id)}
                >
                  <TemplateMarkup template={template} variant="browser" />
                  <span className="os-featured-template-badge">애니 감성</span>
                </Link>
                <div className="os-featured-template-copy">
                  <div>
                    <span>{template.badge}</span>
                    <h3>{template.name}</h3>
                    <p>{template.desc}</p>
                  </div>
                  <Link className="os-featured-template-action" href={getTemplateStartUrl(template.id)}>
                    이 디자인으로 만들기
                    <ArrowRight aria-hidden="true" size={16} />
                  </Link>
                </div>
              </article>
            ))}
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
