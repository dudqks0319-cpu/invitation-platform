"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { templateCategories, templates, type TemplatePreset } from "@/lib/templates";
import { TemplateMarkup } from "@/components/landing/template-markup";

function templatePriority(template: TemplatePreset) {
  if (template.id.includes("barunson")) return 0;
  if (template.id.includes("textspace")) return 1;
  if (template.id.includes("anime")) return 2;
  return 3;
}

export function TemplateBrowser() {
  const [activeCategory, setActiveCategory] = useState<string>(templateCategories[0].key);

  const categoryCounts = useMemo(
    () =>
      templateCategories.reduce<Record<string, number>>((counts, category) => {
        counts[category.key] = templates.filter((template) => template.category === category.key).length;
        return counts;
      }, {}),
    []
  );

  const filteredTemplates = useMemo(
    () =>
      templates
        .filter((template) => template.category === activeCategory)
        .slice()
        .sort((first: TemplatePreset, second: TemplatePreset) => templatePriority(first) - templatePriority(second)),
    [activeCategory]
  );

  return (
    <>
      <section className="categories" id="categories">
        <div className="section-inner">
          <p className="section-kicker">TEMPLATE COLLECTION</p>
          <h2 className="section-title">행사별 초대장 컬렉션</h2>
          <p className="section-sub">청첩장 쇼핑하듯 분위기를 먼저 보고 고르세요.</p>
          <div className="cat-tabs">
            {templateCategories.map((category) => (
              <button
                className={`cat-tab ${category.key === activeCategory ? "active" : ""}`}
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                type="button"
              >
                <span>{category.emoji}</span>
                <strong>{category.label}</strong>
                <small>{categoryCounts[category.key] ?? 0}</small>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="templates-section" id="templates">
        <div className="section-inner">
          <div className="templates-heading-row">
            <div>
              <p className="section-kicker left">CURATED DESIGN</p>
              <h2 className="section-title left">마음에 드는 템플릿을 골라보세요</h2>
              <p className="section-sub left">모든 템플릿은 무료로 미리 볼 수 있고, 바로 빌더로 이어집니다.</p>
            </div>
            <Link className="templates-heading-link" href="/builder">
              바로 제작하기
            </Link>
          </div>
          <div className="templates-grid">
            {filteredTemplates.map((template) => (
              <article
                aria-label={`${template.name} 템플릿 선택`}
                className="template-card"
                key={template.id}
              >
                <div className="template-thumb">
                  <TemplateMarkup template={template} variant="browser" />
                  <div className="template-overlay">
                    <div className="overlay-btns">
                      <Link
                        className="overlay-btn"
                        href={`/preview?template=${template.id}`}
                      >
                        미리보기
                      </Link>
                      <Link
                        className="overlay-btn primary"
                        href={`/builder?template=${template.id}`}
                      >
                        사용하기
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="template-info">
                  <span className="template-badge">{template.badge}</span>
                  <div className="template-name">{template.name}</div>
                  <div className="template-desc">{template.desc}</div>
                  <div className="template-tags">
                    {template.tags.map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="template-card-actions">
                    <Link className="template-card-preview-cta" href={`/preview?template=${template.id}`}>
                      미리보기
                    </Link>
                    <Link className="template-card-cta" href={`/builder?template=${template.id}`}>
                      사용하기
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
