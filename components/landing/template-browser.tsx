"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  filterTemplateCatalog,
  getTemplateCategoryOptions,
  templateFeatureFilters,
  templatePhotoSlotFilters,
  templateProductGroups,
  templateSortOptions,
  templateStyleFilters,
  type TemplateFeatureFilter,
  type TemplatePhotoSlotFilter,
  type TemplateProductGroup,
  type TemplateSortKey,
  type TemplateStyleFilter
} from "@/lib/template-catalog";
import { templates, type TemplatePreset } from "@/lib/templates";
import { TemplateMarkup } from "@/components/landing/template-markup";

const FAVORITE_TEMPLATE_STORAGE_KEY = "invitehub_favorite_template_ids";
const RECENT_TEMPLATE_STORAGE_KEY = "invitehub_recent_template_ids";
const MAX_RECENT_TEMPLATES = 6;
const MAX_FAVORITE_TEMPLATES = 30;
const templateIdLookup = new Set(templates.map((template) => template.id));

function normalizeStoredTemplateIds(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  const ids: string[] = [];
  for (const item of value) {
    if (typeof item === "string" && templateIdLookup.has(item) && !ids.includes(item)) {
      ids.push(item);
    }
  }
  return ids;
}

function readStoredTemplateIds(key: string) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return normalizeStoredTemplateIds(JSON.parse(window.localStorage.getItem(key) ?? "[]"));
  } catch {
    return [];
  }
}

function writeStoredTemplateIds(key: string, ids: string[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(ids));
  }
}

type QuickTemplateView = "all" | "favorites" | "recent";

export function TemplateBrowser() {
  const router = useRouter();
  const [activeProductGroup, setActiveProductGroup] = useState<TemplateProductGroup>("all");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeStyle, setActiveStyle] = useState<TemplateStyleFilter>("all");
  const [activePhotoSlot, setActivePhotoSlot] = useState<TemplatePhotoSlotFilter>("all");
  const [activeFeature, setActiveFeature] = useState<TemplateFeatureFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<TemplateSortKey>("recommended");
  const [previewTarget, setPreviewTarget] = useState<TemplatePreset | null>(null);
  const [favoriteTemplateIds, setFavoriteTemplateIds] = useState<string[]>([]);
  const [recentTemplateIds, setRecentTemplateIds] = useState<string[]>([]);
  const [quickView, setQuickView] = useState<QuickTemplateView>("all");

  const categoryOptions = useMemo(() => getTemplateCategoryOptions(activeProductGroup), [activeProductGroup]);
  const templateById = useMemo(() => new Map(templates.map((template) => [template.id, template])), []);

  const catalogTemplates = useMemo(
    () =>
      filterTemplateCatalog({
        productGroup: activeProductGroup,
        category: activeCategory,
        style: activeStyle,
        photoSlot: activePhotoSlot,
        feature: activeFeature,
        query,
        sort
      }),
    [activeProductGroup, activeCategory, activeStyle, activePhotoSlot, activeFeature, query, sort]
  );
  const favoriteTemplates = useMemo(
    () => favoriteTemplateIds.map((id) => templateById.get(id)).filter((template): template is TemplatePreset => Boolean(template)),
    [favoriteTemplateIds, templateById]
  );
  const recentTemplates = useMemo(
    () => recentTemplateIds.map((id) => templateById.get(id)).filter((template): template is TemplatePreset => Boolean(template)),
    [recentTemplateIds, templateById]
  );
  const filteredTemplates = useMemo(() => {
    if (quickView === "all") {
      return catalogTemplates;
    }

    const catalogTemplateIds = new Set(catalogTemplates.map((template) => template.id));
    const sourceTemplates = quickView === "favorites" ? favoriteTemplates : recentTemplates;
    return sourceTemplates.filter((template) => catalogTemplateIds.has(template.id));
  }, [catalogTemplates, favoriteTemplates, quickView, recentTemplates]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setFavoriteTemplateIds(readStoredTemplateIds(FAVORITE_TEMPLATE_STORAGE_KEY).slice(0, MAX_FAVORITE_TEMPLATES));
      setRecentTemplateIds(readStoredTemplateIds(RECENT_TEMPLATE_STORAGE_KEY).slice(0, MAX_RECENT_TEMPLATES));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function updateProductGroup(productGroup: TemplateProductGroup) {
    setActiveProductGroup(productGroup);
    setActiveCategory("all");
  }

  function recordRecentTemplate(templateId: string) {
    setRecentTemplateIds((current) => {
      const nextIds = [templateId, ...current.filter((id) => id !== templateId)].slice(0, MAX_RECENT_TEMPLATES);
      writeStoredTemplateIds(RECENT_TEMPLATE_STORAGE_KEY, nextIds);
      return nextIds;
    });
  }

  function toggleFavoriteTemplate(templateId: string) {
    setFavoriteTemplateIds((current) => {
      const nextIds = current.includes(templateId)
        ? current.filter((id) => id !== templateId)
        : [templateId, ...current].slice(0, MAX_FAVORITE_TEMPLATES);
      writeStoredTemplateIds(FAVORITE_TEMPLATE_STORAGE_KEY, nextIds);
      return nextIds;
    });
  }

  function openBuilder(templateId: string) {
    recordRecentTemplate(templateId);
    router.push(`/builder?template=${templateId}`);
  }

  function openPreview(template: TemplatePreset) {
    recordRecentTemplate(template.id);
    setPreviewTarget(template);
  }

  function formatTemplateNames(items: TemplatePreset[]) {
    return items.slice(0, 3).map((template) => template.name).join(", ") || "없음";
  }

  return (
    <>
      <section className="categories" id="categories">
        <div className="section-inner">
          <p className="section-kicker">행사별 디자인</p>
          <h2 className="section-title">어떤 날을 준비하시나요?</h2>
          <p className="section-sub">행사 분위기에 맞는 템플릿을 골라보세요.</p>
          <div className="catalog-filter-block">
            <div className="catalog-filter-label">상품군</div>
            <div className="cat-tabs catalog-tabs">
              {templateProductGroups.map((group) => (
                <button
                  className={`cat-tab ${group.key === activeProductGroup ? "active" : ""}`}
                  key={group.key}
                  onClick={() => updateProductGroup(group.key)}
                  type="button"
                >
                  {group.label}
                </button>
              ))}
            </div>
          </div>
          <div className="catalog-filter-block">
            <div className="catalog-filter-label">행사 목적</div>
            <div className="cat-tabs catalog-tabs">
              <button
                className={`cat-tab ${activeCategory === "all" ? "active" : ""}`}
                onClick={() => setActiveCategory("all")}
                type="button"
              >
                전체
              </button>
              {categoryOptions.map((category) => (
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
          <div className="template-search-row">
            <label className="template-search-label">
              <span>검색</span>
              <input
                className="template-search-input"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="사진 1장 청첩장, 돌잔치 파스텔, 기업행사 네이비"
                type="search"
                value={query}
              />
            </label>
            <label className="template-sort-label">
              <span>정렬</span>
              <select
                className="template-sort-select"
                onChange={(event) => setSort(event.target.value as TemplateSortKey)}
                value={sort}
              >
                {templateSortOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="catalog-filter-panel">
            <div className="catalog-filter-group">
              <div className="catalog-filter-label">스타일</div>
              <div className="catalog-chip-row">
                {templateStyleFilters.map((style) => (
                  <button
                    className={`catalog-chip ${style.key === activeStyle ? "active" : ""}`}
                    key={style.key}
                    onClick={() => setActiveStyle(style.key)}
                    type="button"
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="catalog-filter-group">
              <div className="catalog-filter-label">사진 슬롯</div>
              <div className="catalog-chip-row">
                {templatePhotoSlotFilters.map((photoSlot) => (
                  <button
                    className={`catalog-chip ${photoSlot.key === activePhotoSlot ? "active" : ""}`}
                    key={photoSlot.key}
                    onClick={() => setActivePhotoSlot(photoSlot.key)}
                    type="button"
                  >
                    {photoSlot.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="catalog-filter-group">
              <div className="catalog-filter-label">운영 기능</div>
              <div className="catalog-chip-row">
                {templateFeatureFilters.map((feature) => (
                  <button
                    className={`catalog-chip ${feature.key === activeFeature ? "active" : ""}`}
                    key={feature.key}
                    onClick={() => setActiveFeature(feature.key)}
                    type="button"
                  >
                    {feature.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="template-memory-panel" aria-label="템플릿 저장 목록">
            <div className="catalog-chip-row template-memory-actions">
              <button
                className={`catalog-chip ${quickView === "all" ? "active" : ""}`}
                onClick={() => setQuickView("all")}
                type="button"
              >
                전체 보기
              </button>
              <button
                className={`catalog-chip ${quickView === "favorites" ? "active" : ""}`}
                onClick={() => setQuickView("favorites")}
                type="button"
              >
                찜한 템플릿 {favoriteTemplates.length}
              </button>
              <button
                className={`catalog-chip ${quickView === "recent" ? "active" : ""}`}
                onClick={() => setQuickView("recent")}
                type="button"
              >
                최근 본 템플릿 {recentTemplates.length}
              </button>
            </div>
            <div className="template-memory-summary">
              <span>찜 {formatTemplateNames(favoriteTemplates)}</span>
              <span>최근 {formatTemplateNames(recentTemplates)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="templates-section" id="templates">
        <div className="section-inner">
          <p className="section-kicker">인기 디자인</p>
          <h2 className="section-title">마음에 드는 템플릿을 골라보세요</h2>
          <p className="section-sub">모든 템플릿은 무료로 미리 볼 수 있고, 바로 빌더로 이어집니다. 현재 조건 {filteredTemplates.length}개</p>
          <div className="templates-grid">
            {filteredTemplates.length ? filteredTemplates.map((template) => (
              <div
                aria-label={`${template.name} 템플릿 선택`}
                className="template-card"
                key={template.id}
                onClick={() => openBuilder(template.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openBuilder(template.id);
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
                        onClick={(event) => {
                          event.stopPropagation();
                          openPreview(template);
                        }}
                        type="button"
                      >
                        미리보기
                      </button>
                      <Link
                        className="overlay-btn primary"
                        href={`/builder?template=${template.id}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          recordRecentTemplate(template.id);
                        }}
                      >
                        사용하기
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="template-info">
                  <div className="template-info-topline">
                    <span className="template-badge">{template.badge}</span>
                    <button
                      aria-label={`${template.name} 찜 ${favoriteTemplateIds.includes(template.id) ? "해제" : "추가"}`}
                      aria-pressed={favoriteTemplateIds.includes(template.id)}
                      className={`template-favorite-btn ${favoriteTemplateIds.includes(template.id) ? "active" : ""}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleFavoriteTemplate(template.id);
                      }}
                      title={favoriteTemplateIds.includes(template.id) ? "찜 해제" : "찜 추가"}
                      type="button"
                    >
                      {favoriteTemplateIds.includes(template.id) ? "★" : "☆"}
                    </button>
                  </div>
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
            )) : (
              <div className="catalog-empty" role="status">
                조건에 맞는 템플릿이 없습니다. 검색어를 줄이거나 필터를 전체로 바꿔보세요.
              </div>
            )}
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
                <Link className="btn-primary" href={`/builder?template=${previewTarget.id}`} onClick={() => recordRecentTemplate(previewTarget.id)}>
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
