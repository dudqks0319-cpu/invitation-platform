"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TemplateMarkup } from "@/components/landing/template-markup";
import { templateCategories, templates, type TemplatePreset } from "@/lib/templates";
import { priorityCategories } from "@/lib/platform-playbook";

const categoryDescriptions: Record<string, string> = Object.fromEntries(
  priorityCategories.map((category) => [category.key, category.description])
) as Record<string, string>;

const fallbackCategoryDescriptions: Record<string, string> = {
  wedding: "두 사람의 새로운 시작을 함께 축하해주세요",
  dol: "사랑스러운 우리 아기의 첫 생일을 축하해 주세요",
  birthday: "소중한 사람의 특별한 하루를 축하해주세요",
  anniversary: "우리의 소중한 추억을 기념하며 마음을 전하세요",
  hwangap: "인생의 아름다운 순간, 축하의 마음을 전하세요",
  other: "다양한 상황에 맞는 초대장을 선택해보세요",
  bridal: "결혼을 앞둔 설렘을 부드럽게 담아보세요",
  baby: "새로운 가족을 맞이하는 따뜻한 시간을 전하세요",
  graduation: "새로운 출발을 축하하는 마음을 전하세요",
  housewarming: "새 보금자리의 따뜻한 시간을 초대하세요",
  business: "격식 있는 행사 안내를 차분하게 전달하세요"
};

const featuredCategoryOrder = priorityCategories.map((category) => category.key);

function getTemplatePreviewImage(template: TemplatePreset) {
  return template.html.match(/<img[^>]+src="([^"]+)"/)?.[1] ?? "";
}

function getCategoryLabel(categoryKey: string) {
  return templateCategories.find((category) => category.key === categoryKey)?.label ?? categoryKey;
}

function TemplateTile({
  compact = false,
  onPreview,
  template
}: {
  compact?: boolean;
  onPreview: () => void;
  template: TemplatePreset;
}) {
  const previewImage = getTemplatePreviewImage(template);

  return (
    <article className={compact ? "template-board-card is-compact" : "template-board-card"}>
      <Link aria-label={`${template.name} 템플릿 선택`} href={`/builder?template=${template.id}`}>
        <div className="template-board-thumb">
          {previewImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" className="template-board-image" height={485} src={previewImage} width={320} />
          ) : (
            <TemplateMarkup template={template} variant="browser" />
          )}
        </div>
      </Link>
      <div className="template-board-meta">
        <span>{template.badge}</span>
        <strong>{template.name}</strong>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onPreview();
          }}
          type="button"
        >
          미리보기
        </button>
      </div>
    </article>
  );
}

export function TemplateBrowser() {
  const [previewTarget, setPreviewTarget] = useState<TemplatePreset | null>(null);
  const primaryCategoryKeys = useMemo(() => new Set(priorityCategories.map((category) => category.key)), []);

  const groupedTemplates = useMemo(
    () => {
      const primaryGroups = priorityCategories.map((priority) => {
        const category = templateCategories.find((item) => item.key === priority.key) ?? priority;
        return {
          ...category,
          description: categoryDescriptions[category.key] ?? priority.description,
          tone: priority.tone,
          mustHave: priority.mustHave,
          items: templates.filter((template) => template.category === category.key)
        };
      });

      const extraGroups = templateCategories
        .filter((category) => !primaryCategoryKeys.has(category.key as (typeof priorityCategories)[number]["key"]))
        .map((category) => ({
          ...category,
          description: fallbackCategoryDescriptions[category.key] ?? "상황에 맞는 초대장을 선택해보세요",
          tone: "",
          mustHave: [] as string[],
          items: templates.filter((template) => template.category === category.key)
        }));

      return [...primaryGroups, ...extraGroups].filter((category) => category.items.length > 0);
    },
    [primaryCategoryKeys]
  );

  const featuredTemplates = useMemo(
    () =>
      featuredCategoryOrder
        .map((category) => templates.find((template) => template.category === category))
        .filter((template): template is TemplatePreset => Boolean(template)),
    []
  );

  return (
    <>
      <section className="categories invite-template-intro" id="categories">
        <div className="section-inner invite-template-intro-inner">
          <div className="invite-template-copy">
            <p className="section-kicker">핵심 카테고리</p>
            <h2 className="section-title">
              한국형 초대장에 맞춘
              <br />
              5개 제작 라인
            </h2>
            <p className="section-sub">
              국내 사용자가 자주 찾는 행사부터 고르고, 어울리는 초대장 분위기를 바로 확인해보세요.
            </p>
          </div>
          <nav className="invite-category-list" aria-label="템플릿 카테고리">
            {priorityCategories.map((category) => (
              <a href={`#templates-${category.key}`} key={category.key}>
                <span>{category.emoji}</span>
                <strong>{category.label}</strong>
                <small>{category.tone}</small>
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section className="templates-section invite-featured-templates" id="templates">
        <div className="section-inner">
          <p className="section-kicker">대표 디자인</p>
          <h2 className="section-title">핵심 행사별 첫 템플릿을 먼저 둘러보세요</h2>
          <div className="invite-featured-row">
            {featuredTemplates.map((template) => (
              <div className="invite-featured-item" key={template.id}>
                <p>{getCategoryLabel(template.category)} 템플릿</p>
                <TemplateTile
                  onPreview={() => setPreviewTarget(template)}
                  template={template}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="invite-template-board" aria-label="전체 초대장 템플릿">
        <div className="section-inner invite-template-board-inner">
          <h2>
            <span />다양한 초대장 템플릿<span />
          </h2>
          <p>행사 성격, 필수 기능, 분위기를 함께 보고 템플릿을 고를 수 있게 정리했습니다.</p>
          <div className="invite-template-sections">
            {groupedTemplates.map((category) => (
              <section className="invite-template-category" id={`templates-${category.key}`} key={category.key}>
                <header>
                  <div>
                    <span className="invite-category-icon">{category.emoji}</span>
                    <h3>{category.label} 템플릿</h3>
                  </div>
                  <p>{category.description}</p>
                </header>
                {category.mustHave.length ? (
                  <div className="invite-category-module-list" aria-label={`${category.label} 필수 모듈`}>
                    {category.mustHave.map((module) => (
                      <span key={module}>{module}</span>
                    ))}
                  </div>
                ) : null}
                <div className="invite-template-strip">
                  {category.items.map((template) => (
                    <TemplateTile
                      compact
                      key={template.id}
                      onPreview={() => setPreviewTarget(template)}
                      template={template}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <div className={`modal-overlay ${previewTarget ? "open" : ""}`} onClick={() => setPreviewTarget(null)}>
        <div className="preview-modal-box invite-preview-modal" onClick={(event) => event.stopPropagation()}>
          <button
            aria-label="미리보기 닫기"
            className="modal-close"
            onClick={() => setPreviewTarget(null)}
            type="button"
          >
            ×
          </button>
          {previewTarget ? (
            <>
              <div className="invite-preview-copy">
                <span>{previewTarget.badge}</span>
                <h2>{previewTarget.name}</h2>
                <p>{previewTarget.desc}</p>
              </div>
              <div className="invite-preview-frame">
                <TemplateMarkup template={previewTarget} />
              </div>
              <div className="preview-actions">
                <button className="btn-outline" onClick={() => setPreviewTarget(null)} type="button">
                  닫기
                </button>
                <Link className="btn-primary" href={`/builder?template=${previewTarget.id}`}>
                  이 템플릿으로 만들기
                </Link>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
