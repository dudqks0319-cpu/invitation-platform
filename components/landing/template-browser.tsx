"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { templateCategories, templates, type TemplatePreset } from "@/lib/templates";
import { TemplateMarkup } from "@/components/landing/template-markup";

const categorySubtitles: Record<string, string> = {
  wedding: "두 사람의 새로운 시작을 축하해주세요",
  dol: "첫 번째 생일을 특별하게 기념해요",
  hwangap: "인생의 소중한 순간을 함께해요",
  bridal: "결혼 전 특별한 파티를 준비해요",
  birthday: "행복한 생일 파티에 초대하세요",
  housewarming: "새 보금자리로 초대합니다",
  baby: "새 생명의 탄생을 축하해요",
  graduation: "빛나는 졸업을 축하해요",
  business: "비즈니스 행사에 초대합니다",
};

function TemplateCard({
  template,
  onPreview,
}: {
  template: TemplatePreset;
  onPreview: (t: TemplatePreset) => void;
}) {
  const router = useRouter();
  return (
    <div
      aria-label={`${template.name} 템플릿 선택`}
      className="template-card"
      onClick={() => router.push(`/builder?template=${template.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(`/builder?template=${template.id}`);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="template-thumb">
        <TemplateMarkup template={template} variant="browser" />
        <div className="template-overlay">
          <div className="overlay-btns">
            <button
              className="overlay-btn"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(template);
              }}
              type="button"
            >
              미리보기
            </button>
            <Link
              className="overlay-btn primary"
              href={`/builder?template=${template.id}`}
              onClick={(e) => e.stopPropagation()}
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
      </div>
    </div>
  );
}

function CategoryGroup({
  categoryKey,
  label,
  emoji,
  onPreview,
}: {
  categoryKey: string;
  label: string;
  emoji: string;
  onPreview: (t: TemplatePreset) => void;
}) {
  const categoryTemplates = useMemo(
    () => templates.filter((t) => t.category === categoryKey),
    [categoryKey]
  );

  if (categoryTemplates.length === 0) return null;

  return (
    <div className="tpl-category-group">
      <div className="tpl-category-header">
        <div>
          <div className="tpl-category-title">
            <span>{emoji}</span>
            {label} 템플릿
          </div>
          <p className="tpl-category-sub">{categorySubtitles[categoryKey] ?? ""}</p>
        </div>
        <Link href={`/builder`} className="tpl-category-more">
          전체보기 →
        </Link>
      </div>
      <div className="templates-grid-wide">
        {categoryTemplates.map((template) => (
          <TemplateCard key={template.id} template={template} onPreview={onPreview} />
        ))}
      </div>
    </div>
  );
}

export function TemplateBrowser() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [previewTarget, setPreviewTarget] = useState<TemplatePreset | null>(null);

  const filteredTemplates = useMemo(
    () =>
      activeCategory === "all"
        ? templates
        : templates.filter((t) => t.category === activeCategory),
    [activeCategory]
  );

  const displayCategories = templateCategories.filter((c) => c.key !== "all");

  return (
    <>
      {/* Category selector */}
      <section className="categories" id="categories">
        <div className="section-inner">
          <p className="section-kicker">어떤 날을 준비하시나요?</p>
          <h2 className="section-title" style={{ marginBottom: "28px" }}>카테고리별 초대장</h2>
          <div className="cat-icons">
            {templateCategories.map((category) => (
              <button
                className={`cat-icon-btn ${category.key === activeCategory ? "active" : ""}`}
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                type="button"
              >
                <div className="cat-icon-circle">
                  <span>{category.emoji}</span>
                </div>
                <span className="cat-icon-label">{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section className="templates-section" id="templates">
        <div className="section-inner">
          {activeCategory === "all" ? (
            /* All categories grouped view */
            <>
              {displayCategories.map((cat) => (
                <CategoryGroup
                  key={cat.key}
                  categoryKey={cat.key}
                  label={cat.label}
                  emoji={cat.emoji}
                  onPreview={setPreviewTarget}
                />
              ))}
            </>
          ) : (
            /* Single category view */
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <p className="section-kicker" style={{ textAlign: "left", marginBottom: "4px" }}>
                    추천 템플릿
                  </p>
                  <h2
                    className="section-title"
                    style={{ textAlign: "left", marginBottom: 0, fontSize: "1.1rem" }}
                  >
                    {templateCategories.find((c) => c.key === activeCategory)?.label} 초대장
                  </h2>
                </div>
                <Link
                  href="/builder"
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--text-mid)",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  전체보기 →
                </Link>
              </div>
              <div className="templates-grid">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onPreview={setPreviewTarget}
                  />
                ))}
              </div>
            </>
          )}

          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <Link
              href="/builder"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 32px",
                borderRadius: "50px",
                background: "var(--text-dark)",
                color: "#fff",
                fontSize: "0.9rem",
                fontWeight: 700,
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              }}
            >
              초대장 만들기
            </Link>
          </div>
        </div>
      </section>

      {/* Preview modal */}
      <div className={`modal-overlay ${previewTarget ? "open" : ""}`} onClick={() => setPreviewTarget(null)}>
        <div className="preview-modal-box" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setPreviewTarget(null)} type="button">
            ×
          </button>
          {previewTarget ? (
            <>
              <div style={{ padding: "24px 24px 0" }}>
                <span className="template-badge">{previewTarget.badge}</span>
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", margin: "8px 0 4px" }}>
                  {previewTarget.name}
                </h2>
                <p style={{ color: "var(--text-mid)", fontSize: "0.82rem", marginBottom: "14px" }}>
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
