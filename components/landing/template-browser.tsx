"use client";

import Link from "next/link";
import { ArrowRight, Eye, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { GensparkArtwork } from "@/lib/genspark-gallery";
import { templateCategories, templates, type TemplatePreset } from "@/lib/templates";
import { TemplateMarkup } from "@/components/landing/template-markup";

export function TemplateBrowser({
  featuredImages = [],
  archiveImages = []
}: {
  featuredImages?: GensparkArtwork[];
  archiveImages?: readonly string[];
}) {
  const [activeCategory, setActiveCategory] = useState<string>(templateCategories[0].key);
  const [previewTarget, setPreviewTarget] = useState<TemplatePreset | null>(null);

  const filteredTemplates = useMemo(
    () => templates.filter((template) => template.category === activeCategory),
    [activeCategory]
  );

  return (
    <>
      {featuredImages.length ? (
        <section className="template-showcase-section">
          <div className="section-inner template-showcase-grid">
            <div className="template-showcase-copy">
              <p className="section-kicker">ART DIRECTION</p>
              <h2 className="section-title left">바른손카드처럼 첫인상부터 신뢰가 가는 무드</h2>
              <p className="section-sub left">
                실제 카드 브랜드가 쓰는 여백, 종이 톤, 플로럴 프레임 감성을 기준으로
                랜딩과 템플릿 탐색의 시작점을 더 고급스럽게 다듬었습니다.
              </p>
              <div className="template-showcase-meta">
                <span>프리미엄 페이퍼 톤</span>
                <span>수채화 플로럴 자산</span>
                <span>모바일 퍼스트 카드 구성</span>
              </div>
            </div>
            <div className="template-showcase-cards">
              {featuredImages.slice(0, 4).map((image) => (
                <article className="showcase-art-card" key={image.src}>
                  <div className="showcase-art-image" style={{ backgroundImage: `url(${image.src})` }} />
                  <div className="showcase-art-copy">
                    <p>{image.tone}</p>
                    <strong>{image.title}</strong>
                    <span>{image.note}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="categories" id="categories">
        <div className="section-inner">
          <p className="section-kicker">CATEGORY SELECTOR</p>
          <h2 className="section-title">어떤 행사를 준비하시나요?</h2>
          <p className="section-sub">목적에 맞는 템플릿을 바로 찾아보세요</p>
          <div className="cat-tabs">
            {templateCategories.map((category) => (
              <button
                aria-pressed={category.key === activeCategory}
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
          <p className="section-kicker">TEMPLATE PREVIEW</p>
          <h2 className="section-title">인기 템플릿</h2>
          <p className="section-sub">감성 가득한 디자인으로 마음을 전하세요</p>
          <div className="templates-grid">
            {filteredTemplates.map((template) => (
              <article className="template-card" key={template.id}>
                <div className="template-thumb">
                  <TemplateMarkup template={template} />
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
                    <button
                      className="template-action"
                      onClick={() => setPreviewTarget(template)}
                      type="button"
                    >
                      <Eye aria-hidden="true" size={16} />
                      <span>미리보기</span>
                    </button>
                    <Link className="template-action primary" href={`/builder?template=${template.id}`}>
                      <span>사용하기</span>
                      <ArrowRight aria-hidden="true" size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {archiveImages.length ? (
        <section className="archive-section" id="genspark-archive">
          <div className="section-inner">
            <p className="section-kicker">FULL GENSPARK ARCHIVE</p>
            <h2 className="section-title">Genspark 이미지 {archiveImages.length}장 전체 보관</h2>
            <p className="section-sub">
              확인된 자산을 전부 로컬에 내려받아, 카드 무드보드처럼 한 화면에서 바로 비교할 수 있게 정리했습니다.
            </p>
            <div className="archive-grid">
              {archiveImages.map((image, index) => (
                <div
                  className={`archive-thumb ${index % 8 === 0 ? "tall" : index % 5 === 0 ? "wide" : ""}`}
                  key={image}
                  style={{ backgroundImage: `url(${image})` }}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <div className={`modal-overlay ${previewTarget ? "open" : ""}`} onClick={() => setPreviewTarget(null)}>
        <div className="preview-modal-box" onClick={(event) => event.stopPropagation()}>
          <button aria-label="미리보기 닫기" className="modal-close" onClick={() => setPreviewTarget(null)} type="button">
            <X aria-hidden="true" size={18} />
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
              <div style={{ padding: "16px 24px 0", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {previewTarget.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className="preview-actions">
                <button className="btn-outline" onClick={() => setPreviewTarget(null)} type="button">
                  <X aria-hidden="true" size={16} />
                  <span>닫기</span>
                </button>
                <Link className="btn-primary" href={`/builder?template=${previewTarget.id}`}>
                  <span>이 템플릿 사용하기</span>
                  <ArrowRight aria-hidden="true" size={16} />
                </Link>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
