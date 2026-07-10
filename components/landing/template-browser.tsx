"use client";

import Link from "next/link";
import { ArrowRight, Eye, X } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { templateCategories, templates, type TemplatePreset } from "@/lib/templates";
import { TemplateMarkup } from "@/components/landing/template-markup";

function getTemplateStartUrl(templateId: string) {
  return `/builder/start?template=${encodeURIComponent(templateId)}`;
}

export function TemplateBrowser() {
  const dialogTitleId = useId();
  const [activeCategory, setActiveCategory] = useState<string>(templateCategories[0].key);
  const [previewTarget, setPreviewTarget] = useState<TemplatePreset | null>(null);

  const filteredTemplates = useMemo(
    () => templates.filter((template) => template.category === activeCategory),
    [activeCategory]
  );
  const activeCategoryMeta = templateCategories.find((category) => category.key === activeCategory) ?? templateCategories[0];

  useEffect(() => {
    if (!previewTarget) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPreviewTarget(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [previewTarget]);

  return (
    <section className="os-template-browser" id="templates">
      <div className="section-inner">
        <div className="os-section-heading">
          <p className="os-eyebrow">모든 디자인</p>
          <h2>행사와 마음에 맞는 초대장을 찾아보세요.</h2>
          <p>결혼식부터 첫돌, 생일, 집들이까지. 크게 살펴본 뒤 마음에 드는 디자인으로 시작하세요.</p>
        </div>

        <div aria-label="행사 종류" className="cat-tabs os-category-tabs" role="tablist">
          {templateCategories.map((category) => (
            <button
              aria-selected={category.key === activeCategory}
              className={`cat-tab ${category.key === activeCategory ? "active" : ""}`}
              key={category.key}
              onClick={() => setActiveCategory(category.key)}
              role="tab"
              type="button"
            >
              <span aria-hidden="true">{category.emoji}</span>
              {category.label}
            </button>
          ))}
        </div>

        <div className="os-template-result-head">
          <strong>{activeCategoryMeta.label}</strong>
          <span>{filteredTemplates.length}개의 디자인</span>
        </div>

        <div className="templates-grid os-templates-grid">
          {filteredTemplates.map((template) => (
            <article className="template-card os-template-card" key={template.id}>
              <button
                aria-label={`${template.name} 디자인 크게 보기`}
                className="os-template-preview-button"
                onClick={() => setPreviewTarget(template)}
                type="button"
              >
                <div className="template-thumb">
                  <TemplateMarkup template={template} variant="browser" />
                  <span className="os-template-preview-chip">
                    <Eye aria-hidden="true" size={16} />
                    크게 보기
                  </span>
                </div>
              </button>
              <div className="template-info os-template-info">
                <div className="os-template-meta-row">
                  <span className="template-badge">{template.badge}</span>
                  <span>{activeCategoryMeta.label}</span>
                </div>
                <h3 className="template-name">{template.name}</h3>
                <p className="template-desc">{template.desc}</p>
                <div className="template-tags">
                  {template.tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="os-template-actions">
                  <button className="os-template-secondary" onClick={() => setPreviewTarget(template)} type="button">
                    미리보기
                  </button>
                  <Link className="os-template-primary" href={getTemplateStartUrl(template.id)}>
                    이 디자인으로 시작하기
                    <ArrowRight aria-hidden="true" size={17} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {previewTarget ? (
        <div className="modal-overlay os-modal-overlay open" onMouseDown={() => setPreviewTarget(null)}>
          <section
            aria-labelledby={dialogTitleId}
            aria-modal="true"
            className="preview-modal-box os-preview-modal"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="os-preview-modal-head">
              <div>
                <span className="template-badge">{previewTarget.badge}</span>
                <h2 id={dialogTitleId}>{previewTarget.name}</h2>
                <p>{previewTarget.desc}</p>
              </div>
              <button aria-label="미리보기 닫기" className="os-modal-close" onClick={() => setPreviewTarget(null)} type="button">
                <X aria-hidden="true" size={21} />
              </button>
            </div>
            <div className="os-preview-canvas">
              <TemplateMarkup template={previewTarget} />
            </div>
            <div className="preview-actions os-preview-actions">
              <button className="os-template-secondary" onClick={() => setPreviewTarget(null)} type="button">
                다른 디자인 보기
              </button>
              <Link className="os-template-primary" href={getTemplateStartUrl(previewTarget.id)}>
                이 디자인으로 시작하기
                <ArrowRight aria-hidden="true" size={17} />
              </Link>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
