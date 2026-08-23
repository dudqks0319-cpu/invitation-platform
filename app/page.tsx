import Link from "next/link";
import {
  Check,
  Eye,
  Heart,
  ImageIcon,
  MapPinned,
  MessageCircle,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles
} from "lucide-react";
import { TemplateBrowser } from "@/components/landing/template-browser";
import { TemplateMarkup } from "@/components/landing/template-markup";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { templateCategories, templates } from "@/lib/templates";

const quickEvents = [
  { category: "wedding", label: "결혼식", note: "두 사람의 첫인사" },
  { category: "dol", label: "첫돌", note: "아이의 첫 번째 생일" },
  { category: "birthday", label: "생일", note: "함께 축하할 하루" },
  { category: "housewarming", label: "집들이", note: "새로운 공간의 시작" }
];

const floralCeremonyTemplateIds = [
  "wedding-barunson-anime-04",
  "wedding-barunson-anime-05",
  "wedding-barunson-anime-06",
  "wedding-barunson-anime-07",
  "wedding-barunson-anime-08"
];
const weddingPhotoTemplateIds = [
  "wedding-barunson-anime-09",
  "wedding-barunson-anime-10",
  "wedding-barunson-anime-11",
  "wedding-barunson-anime-12",
  "wedding-barunson-anime-13",
  "wedding-barunson-anime-14",
  "wedding-barunson-anime-15",
  "wedding-barunson-anime-16",
  "wedding-barunson-anime-17",
  "wedding-barunson-anime-18"
];
const illustrationTemplateIds = [
  "wedding-barunson-anime-19",
  "wedding-barunson-anime-20",
  "wedding-barunson-anime-21",
  "wedding-barunson-anime-22",
  "wedding-barunson-anime-23",
  "wedding-barunson-anime-24"
];
const featuredTemplateIds = [
  ...illustrationTemplateIds,
  ...floralCeremonyTemplateIds,
  ...weddingPhotoTemplateIds
];
const featuredTemplates = featuredTemplateIds
  .map((id) => templates.find((template) => template.id === id))
  .filter((template): template is NonNullable<typeof template> => Boolean(template));
const heroTemplateIds = [
  "wedding-barunson-anime-04",
  "wedding-barunson-anime-09",
  "wedding-barunson-anime-10"
];
const heroTemplates = heroTemplateIds
  .map((id) => templates.find((template) => template.id === id))
  .filter((template): template is NonNullable<typeof template> => Boolean(template));

const trustNotes = [
  {
    icon: Eye,
    title: "가입 전에 충분히 둘러보기",
    description: "로그인하지 않아도 디자인과 미리보기를 먼저 확인할 수 있어요."
  },
  {
    icon: ShieldCheck,
    title: "작성 중인 내용을 저장했어요",
    description: "한 번에 끝내지 않아도 다시 이어서 차분히 완성할 수 있어요."
  },
  {
    icon: Send,
    title: "완성된 초대장은 링크로 공유",
    description: "카카오톡과 문자로 가볍게 마음을 전해보세요."
  }
];

const processSteps = [
  {
    step: "01",
    title: "마음이 가는 디자인을 골라요",
    description: "행사와 분위기에 어울리는 디자인을 먼저 살펴보세요."
  },
  {
    step: "02",
    title: "우리 이야기로 채워요",
    description: "이름과 날짜, 장소를 적고 가장 아끼는 사진과 문구를 더해요."
  },
  {
    step: "03",
    title: "완성 모습을 확인해요",
    description: "받는 사람이 보게 될 모습을 확인한 뒤 저장하고 공개해요."
  }
];

const features = [
  {
    icon: Smartphone,
    title: "보면서 만들어요",
    description: "작성하는 동안 모바일 미리보기로 완성 모습을 바로 확인할 수 있어요."
  },
  {
    icon: ImageIcon,
    title: "내 이미지로도 만들 수 있어요",
    description: "사진이나 Canva 이미지를 올리고 필요한 문구를 더해 9:16 PNG로 저장해요."
  },
  {
    icon: MapPinned,
    title: "오시는 길을 쉽게 전해요",
    description: "주소를 검색하고 지도 버튼을 더해 장소를 헤매지 않도록 안내해요."
  },
  {
    icon: MessageCircle,
    title: "초대한 뒤에도 이어져요",
    description: "참석 여부와 방명록을 한곳에서 확인하며 소중한 답장을 모아요."
  }
];

type HomePageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const requestedCategory = params.category ?? "";
  const initialCategory = templateCategories.some((category) => category.key === requestedCategory)
    ? requestedCategory
    : templateCategories[0].key;

  return (
    <main className="app-shell os-home">
      <SiteHeader />

      <section aria-labelledby="home-hero-title" className="os-release-hero" id="hero">
        <div className="os-release-shell os-release-hero-grid">
          <div className="os-release-hero-copy">
            <p className="os-release-eyebrow">초대는 짧지만, 기억은 오래 남으니까</p>
            <h1 id="home-hero-title">
              소중한 날의 <span className="os-release-mobile-title-break">첫인사,</span>
              <br />
              우리답게.
            </h1>
            <p className="os-release-hero-description">
              결혼식부터 첫돌, 생일, 집들이까지.
              <br />
              마음에 드는 디자인을 고르고
              <br />
              사진과 문구만 바꿔보세요.
              <br />
              받는 사람의 화면까지 단정하게 준비해 드릴게요.
            </p>
            <div className="os-release-hero-actions">
              <Link className="os-release-primary-cta" href="#featured-templates">
                디자인 먼저 보기
              </Link>
              <Link className="os-release-secondary-cta" href="/image-text">
                내 이미지로 만들기
              </Link>
            </div>
            <ul aria-label="오삼오삼 이용 특징" className="os-release-proof-list">
              <li><Check aria-hidden="true" size={16} /> 가입 없이 디자인 보기</li>
              <li><Check aria-hidden="true" size={16} /> 공개 전 완성 모습 확인</li>
              <li><Check aria-hidden="true" size={16} /> 링크로 간편하게 공유</li>
            </ul>
          </div>

          <div aria-label="오삼오삼 웨딩 추천 디자인" className="os-release-hero-art">
            <div className="os-release-hero-art-label">
              <Sparkles aria-hidden="true" size={16} />
              오삼오삼 셀렉션
            </div>
            <div className="os-release-card-stack">
              {heroTemplates.map((template, index) => (
                <Link
                  aria-label={`${template.name} 미리보기`}
                  className={`os-release-stack-card os-release-stack-card-${index + 1}`}
                  href={`/preview?template=${template.id}`}
                  key={template.id}
                >
                  <TemplateMarkup template={template} variant="browser" />
                  <span>
                    <small>{template.badge}</small>
                    <strong>{template.name}</strong>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="quick-event-title" className="os-release-section os-release-quick-events" id="quick-events">
        <div className="os-release-shell">
          <div className="os-release-section-heading">
            <p className="os-release-eyebrow">행사별 빠른 선택</p>
            <h2 id="quick-event-title">어떤 날을 준비하고 있나요?</h2>
          </div>
          <div className="os-release-quick-grid">
            {quickEvents.map((event) => (
              <Link href={`/?category=${event.category}#templates`} key={event.category}>
                <span>{event.label}</span>
                <small>{event.note}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="featured-title" className="os-release-section os-release-featured" id="featured-templates">
        <div className="os-release-shell">
          <div className="os-release-heading-row">
            <div className="os-release-section-heading os-release-section-heading-left">
              <p className="os-release-eyebrow">오삼오삼 셀렉션</p>
              <h2 id="featured-title">먼저, 마음이 가는 디자인을 골라보세요.</h2>
              <p>큰 여백과 작은 일러스트가 어우러진 새 디자인부터 플로럴과 웨딩 포토까지 모았어요.</p>
            </div>
            <Link className="os-release-text-link" href="#templates">전체 디자인 보기</Link>
          </div>
          <div className="os-release-featured-grid">
            {featuredTemplates.map((template) => (
              <article className="os-release-featured-card" key={template.id}>
                <Link
                  aria-label={`${template.name} 디자인 미리보기`}
                  className="os-release-featured-preview"
                  href={`/preview?template=${template.id}`}
                >
                  <TemplateMarkup template={template} variant="browser" />
                  <span className="os-release-featured-badge">
                    {illustrationTemplateIds.includes(template.id)
                      ? "ILLUSTRATION PICK"
                      : floralCeremonyTemplateIds.includes(template.id)
                        ? "FLORAL PICK"
                        : "PHOTO PICK"}
                  </span>
                </Link>
                <div className="os-release-featured-copy">
                  <span>{template.badge}</span>
                  <h3>{template.name}</h3>
                  <p>{template.desc}</p>
                  <Link href={`/builder?template=${template.id}`}>이 디자인으로 시작하기</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="create-methods-title" className="os-release-section os-release-create-methods" id="create-methods">
        <div className="os-release-shell">
          <div className="os-release-section-heading">
            <p className="os-release-eyebrow">제작 방식 선택</p>
            <h2 id="create-methods-title">준비한 것에 맞춰 시작하세요.</h2>
          </div>
          <div className="os-release-method-grid">
            <article>
              <div className="os-release-method-icon"><Heart aria-hidden="true" size={24} /></div>
              <h3>템플릿으로 만들기</h3>
              <p>행사와 분위기에 맞는 디자인을 고르고<br />이름, 날짜, 장소와 사진만 바꾸면 됩니다.</p>
              <Link className="os-release-primary-cta" href="#templates">템플릿 둘러보기</Link>
            </article>
            <article>
              <div className="os-release-method-icon"><ImageIcon aria-hidden="true" size={24} /></div>
              <h3>내 이미지로 만들기</h3>
              <p>직접 만든 사진, 일러스트, Canva 이미지가 있다면<br />이미지를 올리고 필요한 문구만 더해 완성합니다.</p>
              <Link className="os-release-secondary-cta" href="/image-text">이미지 초대장 만들기</Link>
            </article>
          </div>
        </div>
      </section>

      <section aria-label="오삼오삼 이용 안심 안내" className="os-release-assurance">
        <div className="os-release-shell os-release-assurance-grid">
          {trustNotes.map(({ icon: Icon, title, description }) => (
            <article key={title}>
              <span><Icon aria-hidden="true" size={18} /></span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <TemplateBrowser initialCategory={initialCategory} key={initialCategory} />

      <section aria-labelledby="process-title" className="os-release-section os-release-process" id="how-it-works">
        <div className="os-release-shell">
          <div className="os-release-section-heading">
            <p className="os-release-eyebrow">제작 과정</p>
            <h2 id="process-title">처음 만들어도 어렵지 않아요.</h2>
            <p>오늘은 디자인 하나만 골라도 충분해요. 사진과 문구는 천천히 바꿔도 괜찮아요.</p>
          </div>
          <div className="os-release-process-grid">
            {processSteps.map((step) => (
              <article key={step.step}>
                <span>{step.step}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="features-title" className="os-release-section os-release-features" id="features">
        <div className="os-release-shell">
          <div className="os-release-section-heading os-release-section-heading-left">
            <p className="os-release-eyebrow">핵심 기능</p>
            <h2 id="features-title">초대하는 사람도, 받는 사람도 편안하게.</h2>
            <p>만드는 동안에는 안심할 수 있고, 받아보는 순간에는 필요한 내용을 자연스럽게 찾을 수 있어요.</p>
          </div>
          <div className="os-release-feature-grid">
            {features.map(({ icon: Icon, title, description }) => (
              <article key={title}>
                <div><Icon aria-hidden="true" size={24} /></div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="brand-story-title" className="os-release-section os-release-brand-story" id="brand-story">
        <div className="os-release-shell os-release-brand-grid">
          <div>
            <p className="os-release-eyebrow">오삼오삼이 만드는 초대</p>
            <h2 id="brand-story-title">한 번 열어보는 링크에도<br />마음은 오래 남도록.</h2>
            <p>화려한 기능보다 사진이 잘 보이고, 문장이 편하게 읽히고, 초대받은 사람이 날짜와 장소를 자연스럽게 찾는 화면을 먼저 생각했습니다.</p>
            <ul>
              <li><Check aria-hidden="true" size={17} /> 사진과 문구가 서로 가리지 않도록</li>
              <li><Check aria-hidden="true" size={17} /> 긴 이름과 장소도 편안하게 읽히도록</li>
              <li><Check aria-hidden="true" size={17} /> 필요한 정보만 단정하게 보이도록</li>
            </ul>
          </div>
          <blockquote>
            <Sparkles aria-hidden="true" size={22} />
            “좋은 초대장은 받는 사람의 마음까지 생각합니다.”
          </blockquote>
        </div>
      </section>

      <section aria-labelledby="final-cta-title" className="os-release-final-cta">
        <div className="os-release-shell os-release-final-inner">
          <div>
            <p className="os-release-eyebrow">마음을 전할 준비가 되셨나요?</p>
            <h2 id="final-cta-title">초대는 짧지만, 기억은 오래 남으니까.</h2>
            <p>마음에 드는 디자인 하나에서 우리다운 초대를 시작해 보세요.</p>
          </div>
          <Link className="os-release-light-cta" href="#templates">내 초대장 시작하기</Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
