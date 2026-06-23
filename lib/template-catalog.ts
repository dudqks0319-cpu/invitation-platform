import { templateCategories, templates, type TemplatePreset } from "@/lib/templates";

export type TemplateProductGroup = "all" | "wedding" | "invitation" | "business" | "message_card";
export type TemplateStyleFilter =
  | "all"
  | "best"
  | "new"
  | "photo"
  | "illustration"
  | "minimal"
  | "traditional"
  | "premium"
  | "season";
export type TemplatePhotoSlotFilter =
  | "all"
  | "none"
  | "main"
  | "two"
  | "gallery"
  | "circle"
  | "polaroid"
  | "full";
export type TemplateFeatureFilter =
  | "all"
  | "rsvp"
  | "guestbook"
  | "qr"
  | "family"
  | "coworkers"
  | "business";
export type TemplateSortKey = "recommended" | "new" | "popular" | "name";

export type TemplateCatalogFilters = {
  productGroup: TemplateProductGroup;
  category: string;
  style: TemplateStyleFilter;
  photoSlot: TemplatePhotoSlotFilter;
  feature: TemplateFeatureFilter;
  query: string;
  sort: TemplateSortKey;
};

type TemplateCatalogMetadata = {
  productGroup: Exclude<TemplateProductGroup, "all">;
  styles: TemplateStyleFilter[];
  photoSlots: TemplatePhotoSlotFilter[];
  features: TemplateFeatureFilter[];
  popularity: number;
  freshness: number;
};

export const templateProductGroups: Array<{ key: TemplateProductGroup; label: string }> = [
  { key: "all", label: "전체" },
  { key: "wedding", label: "청첩장" },
  { key: "invitation", label: "초대장" },
  { key: "business", label: "비즈니스" },
  { key: "message_card", label: "메시지카드" }
];

export const templateStyleFilters: Array<{ key: TemplateStyleFilter; label: string }> = [
  { key: "all", label: "전체" },
  { key: "best", label: "베스트" },
  { key: "new", label: "신상품" },
  { key: "photo", label: "포토형" },
  { key: "illustration", label: "일러스트형" },
  { key: "minimal", label: "미니멀" },
  { key: "traditional", label: "전통" },
  { key: "premium", label: "프리미엄" },
  { key: "season", label: "시즌" }
];

export const templatePhotoSlotFilters: Array<{ key: TemplatePhotoSlotFilter; label: string }> = [
  { key: "all", label: "전체" },
  { key: "none", label: "사진 없음" },
  { key: "main", label: "대표 사진 1장" },
  { key: "two", label: "사진 2장" },
  { key: "gallery", label: "갤러리 중심" },
  { key: "circle", label: "원형 사진" },
  { key: "polaroid", label: "폴라로이드형" },
  { key: "full", label: "전체 배경 사진형" }
];

export const templateFeatureFilters: Array<{ key: TemplateFeatureFilter; label: string }> = [
  { key: "all", label: "전체" },
  { key: "rsvp", label: "RSVP 추천" },
  { key: "guestbook", label: "방명록 추천" },
  { key: "qr", label: "QR 추천" },
  { key: "family", label: "가족용 추천" },
  { key: "coworkers", label: "직장용 추천" },
  { key: "business", label: "기업행사 추천" }
];

export const templateSortOptions: Array<{ key: TemplateSortKey; label: string }> = [
  { key: "recommended", label: "추천순" },
  { key: "new", label: "신상품순" },
  { key: "popular", label: "인기순" },
  { key: "name", label: "이름순" }
];

const categoryProductGroups: Record<string, Exclude<TemplateProductGroup, "all">> = {
  wedding: "wedding",
  dol: "invitation",
  hwangap: "invitation",
  bridal: "invitation",
  birthday: "invitation",
  housewarming: "invitation",
  baby: "invitation",
  graduation: "invitation",
  business: "business"
};

const categorySearchAliases: Record<string, string[]> = {
  wedding: ["청첩장", "사진 1장", "결혼식", "예식"],
  dol: ["돌잔치", "파스텔", "아기 사진", "첫돌"],
  hwangap: ["환갑", "칠순", "전통", "부모님"],
  bridal: ["브라이덜샤워", "파티", "핑크"],
  birthday: ["생일", "생일축하", "파스텔"],
  housewarming: ["집들이", "미니멀", "새집"],
  baby: ["베이비샤워", "파스텔", "시즌"],
  graduation: ["졸업", "졸업파티", "네이비"],
  business: ["기업행사", "세미나", "전시", "오픈식", "네이비"]
};

const templateMetadataOverrides: Record<string, Partial<TemplateCatalogMetadata>> = {
  "wedding-classic": {
    styles: ["best", "photo", "premium"],
    photoSlots: ["main"],
    popularity: 100,
    freshness: 70
  },
  "wedding-nature": {
    styles: ["best", "photo", "premium"],
    photoSlots: ["main"],
    popularity: 92,
    freshness: 72
  },
  "wedding-green-arch": {
    styles: ["new", "photo", "minimal"],
    photoSlots: ["polaroid"],
    popularity: 82,
    freshness: 100
  },
  "hwangap-classic": {
    styles: ["best", "traditional"],
    photoSlots: ["none"],
    popularity: 76,
    freshness: 62
  },
  "business": {
    productGroup: "business",
    styles: ["best", "minimal", "premium"],
    photoSlots: ["none"],
    features: ["rsvp", "qr", "business"],
    popularity: 80,
    freshness: 80
  }
};

function uniqueFilters<T extends string>(values: T[]) {
  return Array.from(new Set(values));
}

export function getTemplateCategoryLabel(category: string) {
  return templateCategories.find((item) => item.key === category)?.label ?? category;
}

export function getTemplateCatalogMetadata(template: TemplatePreset): TemplateCatalogMetadata {
  const override = templateMetadataOverrides[template.id] ?? {};
  const productGroup = override.productGroup ?? categoryProductGroups[template.category] ?? "invitation";
  const baseStyles: TemplateStyleFilter[] = ["photo"];
  const searchableText = `${template.id} ${template.name} ${template.desc} ${template.tags.join(" ")}`.toLowerCase();

  if (template.category === "wedding" || template.category === "dol") {
    baseStyles.push("best");
  }
  if (template.id.includes("photo") || searchableText.includes("사진") || searchableText.includes("폴라로이드")) {
    baseStyles.push("photo");
  }
  if (searchableText.includes("미니멀") || searchableText.includes("여백")) {
    baseStyles.push("minimal");
  }
  if (searchableText.includes("전통") || template.category === "hwangap") {
    baseStyles.push("traditional");
  }
  if (searchableText.includes("프리미엄") || searchableText.includes("골드") || searchableText.includes("품격")) {
    baseStyles.push("premium");
  }
  if (["baby", "birthday", "housewarming"].includes(template.category)) {
    baseStyles.push("season");
  }
  if (template.id.startsWith("wedding-") && !["wedding-classic", "wedding-nature"].includes(template.id)) {
    baseStyles.push("new");
  }

  const basePhotoSlots: TemplatePhotoSlotFilter[] =
    template.category === "business" || template.category === "hwangap" ? ["none"] : ["main"];
  if (searchableText.includes("폴라로이드")) {
    basePhotoSlots.push("polaroid");
  }
  if (template.id.includes("photo") || searchableText.includes("배경")) {
    basePhotoSlots.push("full");
  }
  if (template.category === "dol" || template.category === "birthday") {
    basePhotoSlots.push("circle");
  }
  if (template.category === "wedding") {
    basePhotoSlots.push("two", "gallery");
  }

  const baseFeatures: TemplateFeatureFilter[] = ["rsvp", "guestbook", "qr"];
  if (template.category === "wedding" || template.category === "hwangap") {
    baseFeatures.push("family");
  }
  if (template.category === "wedding" || template.category === "business") {
    baseFeatures.push("coworkers");
  }
  if (template.category === "business") {
    baseFeatures.push("business");
  }

  return {
    productGroup,
    styles: uniqueFilters([...(override.styles ?? []), ...baseStyles]),
    photoSlots: uniqueFilters([...(override.photoSlots ?? []), ...basePhotoSlots]),
    features: uniqueFilters([...(override.features ?? []), ...baseFeatures]),
    popularity: override.popularity ?? Math.max(30, 75 - templates.findIndex((item) => item.id === template.id)),
    freshness: override.freshness ?? Math.max(20, 60 + templates.findIndex((item) => item.id === template.id))
  };
}

function normalizeSearchTerm(value: string) {
  return value.trim().toLowerCase().replace(/^#/, "");
}

export function getTemplateSearchText(template: TemplatePreset) {
  const metadata = getTemplateCatalogMetadata(template);
  const categoryLabel = getTemplateCategoryLabel(template.category);
  const groupLabel = templateProductGroups.find((item) => item.key === metadata.productGroup)?.label ?? "";
  const styleLabels = metadata.styles
    .map((style) => templateStyleFilters.find((item) => item.key === style)?.label ?? "")
    .join(" ");
  const photoLabels = metadata.photoSlots
    .map((photoSlot) => templatePhotoSlotFilters.find((item) => item.key === photoSlot)?.label ?? "")
    .join(" ");
  const featureLabels = metadata.features
    .map((feature) => templateFeatureFilters.find((item) => item.key === feature)?.label ?? "")
    .join(" ");

  return normalizeSearchTerm([
    template.id,
    template.name,
    template.badge,
    template.desc,
    template.tags.join(" "),
    (categorySearchAliases[template.category] ?? []).join(" "),
    categoryLabel,
    groupLabel,
    styleLabels,
    photoLabels,
    featureLabels
  ].join(" "));
}

export function getTemplateCategoryOptions(productGroup: TemplateProductGroup) {
  return templateCategories.filter((category) => {
    if (productGroup === "all") {
      return true;
    }

    return categoryProductGroups[category.key] === productGroup;
  });
}

export function filterTemplateCatalog(filters: TemplateCatalogFilters) {
  const queryTerms = normalizeSearchTerm(filters.query)
    .split(/\s+/)
    .filter(Boolean);

  return [...templates]
    .filter((template) => {
      const metadata = getTemplateCatalogMetadata(template);

      if (filters.productGroup !== "all" && metadata.productGroup !== filters.productGroup) {
        return false;
      }
      if (filters.category !== "all" && template.category !== filters.category) {
        return false;
      }
      if (filters.style !== "all" && !metadata.styles.includes(filters.style)) {
        return false;
      }
      if (filters.photoSlot !== "all" && !metadata.photoSlots.includes(filters.photoSlot)) {
        return false;
      }
      if (filters.feature !== "all" && !metadata.features.includes(filters.feature)) {
        return false;
      }

      if (!queryTerms.length) {
        return true;
      }

      const searchText = getTemplateSearchText(template);
      return queryTerms.every((term) => searchText.includes(term));
    })
    .sort((left, right) => {
      const leftMetadata = getTemplateCatalogMetadata(left);
      const rightMetadata = getTemplateCatalogMetadata(right);

      if (filters.sort === "new") {
        return rightMetadata.freshness - leftMetadata.freshness;
      }
      if (filters.sort === "popular") {
        return rightMetadata.popularity - leftMetadata.popularity;
      }
      if (filters.sort === "name") {
        return left.name.localeCompare(right.name, "ko-KR");
      }

      return rightMetadata.popularity + rightMetadata.freshness - (leftMetadata.popularity + leftMetadata.freshness);
    });
}
