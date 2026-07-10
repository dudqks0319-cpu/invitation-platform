import Link from "next/link";
import {
  ArrowRight,
  Check,
  Eye,
  Heart,
  ImageIcon,
  MessageCircle,
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
    title: "마음이 가는 디자인을 골라요",
    description: "좋아하는 분위기를 찾는 것부터 시작해요. 문구와 사진은 나중에 천천히 바꿔도 괜찮아요.",
    icon: Heart
  },
  {
    number: "02",
    title: "우리 이야기로 채워요",
    description: "이름과 날짜, 장소를 적고 가장 아끼는 사진을 더하면 자연스럽게 우리 초대장이 됩니다.",
    icon: ImageIcon
  },
  {
    number: "03",
    title: "링크 하나로 마음을 전해요",
    description: "카카오톡과 문자로 보내고, 참석 답변과 축하 메시지도 한곳에서 받아보세요.",
    icon: Send
  }
];

const servicePromises = [
  {
    icon: Eye,
    title: "보면서 만들어요",
    description: "입력한 내용이 실제 초대장에 어떻게 보이는지 곁에서 바로 확인할 수 있어요."
  },
  {
    icon: Smartphone,
    title: "작은 화면에서도 편안해요",
    description: "이름과 장소가 길어져도 읽기 좋게 정돈해, 받는 사람의 화면까지 생각했어요."
  },
  {
    icon: Sparkles,
    title: "행사에 맞게 시작해요",
    description: "결혼식, 첫돌, 생일, 집들이에 어울리는 문구와 구성을 준비해 두었어요."
  },
  {
    icon: MessageCircle,
    title: "초대한 뒤에도 이어져요",
    description: "참석 여부와 방명록을 한곳에서 확인하며 소중한 답장을 놓치지 않아요."
  }
];

const trustNotes = [
  {
    title: "가입 전에 충분히 둘러보기",
    description: "마음에 드는 디자인인지 먼저 확인하세요."
  },
  {
    title: "작성 내용은 이 기기에 임시 저장",
    description: "한 번에 끝내지 않아도 다시 이어서 만들 수 있어요."
  },
  {
    title: "완성된 초대장은 링크로 공유",
    description: "카카오톡과 문자로 가볍게 마음을 전하세요."
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
  const storyTemplate = featuredTemplates[0];

  return (
    <main className="app-shell os-home">
      <SiteHeader />

      <aside className="os-home-notice" aria-label="오삼오삼 안내">
        <div className="os-shell os-home-notice-inner">
          <span>결혼식 · 첫돌 · 생일 · 집들이</span>
          <strong>좋은 초대장은 마음이 가는 디자인 하나에서 시작돼요.</strong>
          <a href="#templates">
            모든 디자인 보기
            <ArrowRight aria-hidden="true" size={15} />
          </a>
        </div>
      </aside>

      <section className="os-hero">
        <div className="os-shell os-hero-grid">
          <div className="os-hero-copy">
            <p className="os-eyebrow">
              <span aria-hidden="true">✦</span>
              초대는 짧지만, 기억은 오래 남으니까
            </p>
            <h1>
              소중한 날의 첫인사,
              <br />
              우리답게.
            </h1>
            <p className="os-hero-description">
              결혼식도 첫돌도 생일도, 마음에 드는 디자인을 고르고
              <br className="os-desktop-break" />
              사진과 문구만 바꿔보세요. 받는 사람의 화면까지 단정하게 준비해 드릴게요.
            </p>
            <div className="os-hero-actions">
              <a className="os-primary-cta" href="#featured-templates">
                디자인 먼저 보기
                <ArrowRight aria-hidden="true" size={19} />
              </a>
              <Link className="os-secondary-cta" href="/builder">
                빈 초대장부터 만들기
              </Link>
            </div>
            <div className="os-proof-list" aria-label="서비스 특징">
              <span>
                <Check aria-hidden="true" size={16} /> 가입 없이 미리보기
              </span>
              <span>
                <Check aria-hidden="true" size={16} /> 발행 전 전체 화면 확인
              </span>
              <span>
                <Check aria-hidden="true" size={16} /> 링크로 간편하게 공유
              </span>
            </div>
          </div>

          <div className="os-hero-visual os-anime-showcase" aria-label="오삼오삼 추천 초대장 디자인">
            <div className="os-anime-showcase-label">
              <Sparkles aria-hidden="true" size={16} />
              오삼오삼 셀렉션
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
            <p className="os-anime-showcase-help">마음이 가는 카드를 누르면 그 디자인으로 바로 시작해요.</p>
          </div>
        </div>
      </section>

      <section className="os-assurance-strip" aria-label="오삼오삼 이용 안내">
        <div className="os-shell os-assurance-grid">
          {trustNotes.map((note) => (
            <article className="os-assurance-item" key={note.title}>
              <span className="os-assurance-check" aria-hidden="true">
                <Check size={15} />
              </span>
              <div>
                <strong>{note.title}</strong>
                <p>{note.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="os-featured-templates" id="featured-templates" aria-labelledby="featured-template-title">
        <div className="os-shell">
          <div className="os-featured-heading-row">
            <div className="os-section-heading os-section-heading-left">
              <p className="os-eyebrow">오삼오삼 셀렉션</p>
              <h2 id="featured-template-title">먼저, 마음이 가는 디자인을 골라보세요.</h2>
              <p>좋은 초대장은 설명보다 첫인상이 먼저예요. 오래 보아도 질리지 않는 디자인부터 차분히 모았습니다.</p>
            </div>
            <a className="os-featured-all-link" href="#templates">
              전체 디자인 보기 <ArrowRight aria-hidden="true" size={17} />
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
                  <span className="os-featured-template-badge">EDITOR&apos;S PICK</span>
                </Link>
                <div className="os-featured-template-copy">
                  <div>
                    <span>{template.badge}</span>
                    <h3>{template.name}</h3>
                    <p>{template.desc}</p>
                  </div>
                  <Link className="os-featured-template-action" href={getTemplateStartUrl(template.id)}>
                    이 디자인으로 시작하기
                    <ArrowRight aria-hidden="true" size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="os-brand-story" aria-labelledby="brand-story-title">
        <div className="os-shell os-brand-story-grid">
          <div className="os-brand-story-copy">
            <p className="os-eyebrow">오삼오삼이 만드는 초대</p>
            <h2 id="brand-story-title">
              한 번 열어보는 링크에도
              <br />
              마음은 오래 남도록.
            </h2>
            <p>
              화려한 기능을 늘어놓기보다 사진이 잘 보이고, 문장이 편하게 읽히고,
              초대받은 사람이 필요한 정보를 자연스럽게 찾을 수 있는 화면을 먼저 생각했습니다.
            </p>
            <ul className="os-brand-story-list">
              <li>
                <Check aria-hidden="true" size={16} />
                사진이 가장 먼저 눈에 들어오도록
              </li>
              <li>
                <Check aria-hidden="true" size={16} />
                작은 글씨도 편안하게 읽히도록
              </li>
              <li>
                <Check aria-hidden="true" size={16} />
                날짜와 장소를 한눈에 찾을 수 있도록
              </li>
            </ul>
            <a className="os-story-link" href="#templates">
              내 마음에 맞는 디자인 찾기
              <ArrowRight aria-hidden="true" size={17} />
            </a>
          </div>

          {storyTemplate ? (
            <div className="os-brand-story-art" aria-label={`${storyTemplate.name} 디자인 예시`}>
              <div className="os-brand-story-card">
                <TemplateMarkup template={storyTemplate} variant="browser" />
              </div>
              <blockquote>“좋은 초대장은 받는 사람의 마음까지 생각합니다.”</blockquote>
            </div>
          ) : null}
        </div>
      </section>

      <section className="os-process" id="how-it-works">
        <div className="os-shell">
          <div className="os-section-heading">
            <p className="os-eyebrow">만드는 방법</p>
            <h2>오늘은 디자인 하나만 골라도 충분해요.</h2>
            <p>문구와 사진은 천천히 바꿔도 괜찮아요. 오삼오삼이 순서대로 안내해 드립니다.</p>
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
            <p className="os-eyebrow">오삼오삼이 지키는 것</p>
            <h2>초대하는 사람도, 받는 사람도 편안하게.</h2>
            <p>만드는 동안에는 안심할 수 있고, 받아보는 순간에는 자연스럽게 읽히도록 세심하게 정돈했습니다.</p>
          </div>
          <div className="os-benefit-grid">
            {servicePromises.map(({ icon: Icon, title, description }) => (
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
            <p className="os-eyebrow">마음을 전할 준비가 되셨나요?</p>
            <h2>좋은 초대는, 좋은 디자인 하나에서 시작돼요.</h2>
            <p>지금은 마음에 드는 카드를 고르는 것만으로 충분합니다.</p>
          </div>
          <a className="os-primary-cta os-primary-cta-light" href="#featured-templates">
            내 초대장 시작하기
            <ArrowRight aria-hidden="true" size={19} />
          </a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
