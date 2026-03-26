"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { templateCategories, templates, type TemplatePreset } from "@/lib/templates";
import { TemplateMarkup } from "@/components/landing/template-markup";

export function TemplateBrowser() {
  const [activeCategory, setActiveCategory] = useState<string>(templateCategories[0].key);
  const [previewTarget, setPreviewTarget] = useState<TemplatePreset | null>(null);

  const filteredTemplates = useMemo(
    () => templates.filter((template) => template.category === activeCategory),
    [activeCategory]
  );

  return (
    <>
      <section className="categories" id="categories">
        <div className="section-inner">
          <p className="section-kicker">행사별 디자인</p>
          <h2 className="section-title">어떤 날을 준비하시나요?</h2>
          <p className="section-sub">행사 분위기에 맞는 템플릿을 골라보세요.</p>
          <div className="cat-tabs">
            {templateCategories.map((category) => (
              <button
                className={`cat-tab ${category.key === activeCategory ? "active" : ""}`}
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                type="button"
              >
                <span>{category.emoji}</span> {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="templates-section" id="templates">
        <div className="section-inner">
          <p className="section-kicker">인기 디자인</p>
          <h2 className="section-title">마음에 드는 템플릿을 골라보세요</h2>
          <p className="section-sub">모든 템플릿은 무료로 미리 볼 수 있고, 바로 빌더로 이어집니다.</p>
          <div className="templates-grid">
            {filteredTemplates.map((template) => (
              <div className="template-card" key={template.id}>
                <div className="template-thumb">
                  <TemplateMarkup template={template} variant="browser" />
                  <div className="template-overlay">
                    <div className="overlay-btns">
                      <button
                        className="overlay-btn"
                        onClick={() => setPreviewTarget(template)}
                        type="button"
                      >
                        미리보기
                      </button>
                      <Link className="overlay-btn primary" href={`/builder?template=${template.id}`}>
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className={`modal-overlay ${previewTarget ? "open" : ""}`} onClick={() => setPreviewTarget(null)}>
        <div className="preview-modal-box" onClick={(event) => event.stopPropagation()}>
          <button className="modal-close" onClick={() => setPreviewTarget(null)} type="button">
            ×
          </button>
          {previewTarget ? (
            <>
              <div style={{ padding: "24px 24px 0" }}>
                <span className="template-badge">{previewTarget.badge}</span>
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", margin: "8px 0 4px" }}>
                  {previewTarget.name}
                </h2>
                <p style={{ color: "var(--text-mid)", fontSize: "0.85rem", marginBottom: "16px" }}>
                  {previewTarget.desc}
                </p>
              </div>
              <div style={{ padding: "0 24px" }}>
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
