"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { templateCategories, templates, type TemplatePreset } from "@/lib/templates";
import { TemplateMarkup } from "@/components/landing/template-markup";

const styleFilters = [
  { key: "all", label: "전체", markers: [] },
  { key: "photo", label: "사진형", markers: ["사진", "포토", "스튜디오", "프리웨딩", "폴라로이드", "웨딩사진"] },
  { key: "illustration", label: "일러스트형", markers: ["애니", "일러스트", "플라워", "보태니컬", "곰돌이", "풍선", "케이크", "리본", "구름"] },
  { key: "anime", label: "애니 감성", markers: ["애니"] },
  { key: "simple", label: "심플", markers: ["심플", "미니멀", "여백", "화이트", "정보형", "텍스트공간"] },
  { key: "classic", label: "클래식", markers: ["클래식", "포멀", "격식", "보더", "로즈골드"] },
  { key: "traditional", label: "전통", markers: ["전통", "한옥", "서예", "한자", "모란", "정통"] },
  { key: "cute", label: "귀여운", markers: ["귀여운", "곰돌이", "풍선", "러블리", "파스텔", "케이크", "아기", "공주"] },
  { key: "luxury", label: "고급스러운", markers: ["고급", "프리미엄", "럭셔리", "골드", "호텔", "볼룸", "품격", "하이엔드"] }
] as const;

type StyleFilterKey = (typeof styleFilters)[number]["key"];

function templatePriority(template: TemplatePreset) {
  if (template.id.includes("barunson")) return 0;
  if (template.id.includes("textspace")) return 1;
  if (template.id.includes("anime")) return 2;
  return 3;
}

function templateSearchText(template: TemplatePreset) {
  return [template.id, template.name, template.desc, ...template.tags]
    .join(" ")
    .replaceAll("#", "")
    .toLocaleLowerCase("ko-KR");
}

function matchesStyleFilter(template: TemplatePreset, filterKey: StyleFilterKey) {
  if (filterKey === "all") {
    return true;
  }

  const filter = styleFilters.find((item) => item.key === filterKey);
  if (!filter) {
    return true;
  }

  const searchText = templateSearchText(template);
  return filter.markers.some((marker) => searchText.includes(marker.toLocaleLowerCase("ko-KR")));
}

export function TemplateBrowser({ initialCategory = templateCategories[0].key }: { initialCategory?: string }) {
  const safeInitialCategory = templateCategories.some((category) => category.key === initialCategory)
    ? initialCategory
    : templateCategories[0].key;
  const [activeCategory, setActiveCategory] = useState<string>(safeInitialCategory);
  const [activeStyle, setActiveStyle] = useState<StyleFilterKey>("all");

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
        .filter((template) => matchesStyleFilter(template, activeStyle))
        .slice()
        .sort((first: TemplatePreset, second: TemplatePreset) => templatePriority(first) - templatePriority(second)),
    [activeCategory, activeStyle]
  );

  const activeCategoryMeta = templateCategories.find((category) => category.key === activeCategory) ?? templateCategories[0];
  const activeStyleMeta = styleFilters.find((filter) => filter.key === activeStyle) ?? styleFilters[0];

  return (
    <section aria-labelledby="template-collection-title" className="os-release-template-browser" id="templates">
      <div className="os-release-shell">
        <div className="os-release-section-heading">
          <p className="os-release-eyebrow">행사별 디자인</p>
          <h2 id="template-collection-title">마음에 드는 디자인을 골라보세요.</h2>
          <p>행사와 분위기를 고른 뒤 미리보기로 받는 사람이 보게 될 모습을 확인하세요.</p>
        </div>

        <div aria-label="행사 종류" className="os-release-filter-scroll os-release-category-filters">
          {templateCategories.map((category) => (
            <button
              aria-pressed={category.key === activeCategory}
              className={category.key === activeCategory ? "is-active" : ""}
              key={category.key}
              onClick={() => setActiveCategory(category.key)}
              type="button"
            >
              <span aria-hidden="true">{category.emoji}</span>
              <strong>{category.label}</strong>
              <small>{categoryCounts[category.key] ?? 0}</small>
            </button>
          ))}
        </div>

        <div aria-label="디자인 분위기" className="os-release-filter-scroll os-release-style-filters">
          {styleFilters.map((filter) => (
            <button
              aria-pressed={filter.key === activeStyle}
              className={filter.key === activeStyle ? "is-active" : ""}
              key={filter.key}
              onClick={() => setActiveStyle(filter.key)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div aria-live="polite" className="os-release-results-heading">
          <strong>{activeCategoryMeta.label} · {activeStyleMeta.label}</strong>
          <span>{filteredTemplates.length}개의 디자인</span>
        </div>

        {filteredTemplates.length > 0 ? (
          <div aria-label="선택 가능한 초대장 디자인" className="templates-grid os-release-template-grid">
            {filteredTemplates.map((template) => (
              <article aria-label={`${template.name} 템플릿 선택`} className="template-card os-release-template-card" key={template.id}>
                <Link
                  aria-label={`${template.name} 미리보기`}
                  className="os-release-template-preview"
                  href={`/preview?template=${template.id}`}
                >
                  <div className="template-thumb">
                    <TemplateMarkup template={template} variant="browser" />
                    <span>미리보기</span>
                  </div>
                </Link>
                <div className="template-info">
                  <span className="template-badge">{template.badge}</span>
                  <h3 className="template-name">{template.name}</h3>
                  <p className="template-desc">{template.desc}</p>
                  <div className="template-tags">
                    {template.tags.map((tag) => (
                      <span className="tag" key={tag}>{tag}</span>
                    ))}
                  </div>
                  <div className="template-card-actions os-release-template-actions">
                    <Link className="template-card-preview-cta" href={`/preview?template=${template.id}`}>
                      미리보기
                    </Link>
                    <Link className="template-card-cta" href={`/builder?template=${template.id}`}>
                      이 디자인으로 시작하기
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="os-release-empty-results" role="status">
            <strong>이 분위기의 디자인을 준비하고 있어요.</strong>
            <p>다른 분위기를 선택하면 더 많은 디자인을 볼 수 있어요.</p>
            <button onClick={() => setActiveStyle("all")} type="button">전체 디자인 보기</button>
          </div>
        )}
      </div>
    </section>
  );
}
