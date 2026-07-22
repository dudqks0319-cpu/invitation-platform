import type { MobileTemplateCategory, MobileTemplateGalleryItem } from "./template-gallery";

export const TEMPLATE_DISCOVERY_QUERY_MAX_LENGTH = 80;
const TEMPLATE_DISCOVERY_FIELD_MAX_LENGTH = 160;

export type TemplateDiscoveryCategoryKey = "all" | string;

export type TemplateDiscoveryFilters = {
  query: string;
  category: TemplateDiscoveryCategoryKey;
  moods: string[];
};

export type TemplateDiscoveryMood = {
  key: string;
  label: string;
  reviewedTags: readonly string[];
};

/**
 * These mood keys intentionally come from a reviewed catalog-tag mapping.
 * Do not derive a mood from a template id, preview path, or file name.
 */
export const templateDiscoveryMoods: readonly TemplateDiscoveryMood[] = [
  { key: "animation", label: "애니", reviewedTags: ["애니"] },
  { key: "floral", label: "플라워", reviewedTags: ["플라워", "플로럴", "블룸"] },
  { key: "pastel", label: "파스텔", reviewedTags: ["파스텔"] },
  { key: "traditional", label: "전통", reviewedTags: ["전통", "민화", "전통색", "문양", "서예"] },
  { key: "minimal", label: "여백", reviewedTags: ["여백", "화이트", "미니멀"] },
  { key: "character", label: "캐릭터", reviewedTags: ["캐릭터", "곰돌이"] },
  { key: "premium", label: "프리미엄", reviewedTags: ["프리미엄", "품격", "럭셔리", "골드"] }
];

export const emptyTemplateDiscoveryFilters: TemplateDiscoveryFilters = {
  query: "",
  category: "all",
  moods: []
};

export function normalizeTemplateDiscoveryQuery(value: string, maxLength = TEMPLATE_DISCOVERY_QUERY_MAX_LENGTH) {
  return value
    .replace(/#/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase()
    .slice(0, maxLength);
}

function normalizedField(value: string) {
  return normalizeTemplateDiscoveryQuery(value, TEMPLATE_DISCOVERY_FIELD_MAX_LENGTH);
}

function categoryLabel(category: string, categories: readonly MobileTemplateCategory[]) {
  return categories.find((item) => item.key === category)?.label ?? "";
}

function moodKey(value: string) {
  const normalized = normalizeTemplateDiscoveryQuery(value);
  return templateDiscoveryMoods.find(
    (mood) => mood.key === normalized || normalized === normalizeTemplateDiscoveryQuery(mood.label)
  )?.key;
}

function templateMoodKeys(template: Pick<MobileTemplateGalleryItem, "tags">) {
  const normalizedTags = new Set(template.tags.map(normalizedField));
  return templateDiscoveryMoods
    .filter((mood) => mood.reviewedTags.some((tag) => normalizedTags.has(normalizedField(tag))))
    .map((mood) => mood.key);
}

function searchableText(template: MobileTemplateGalleryItem, categories: readonly MobileTemplateCategory[]) {
  return [template.name, template.badge, template.desc, ...template.tags, categoryLabel(template.category, categories)]
    .map(normalizedField)
    .join(" ");
}

export function filterTemplateDiscoveryItems(
  templates: readonly MobileTemplateGalleryItem[],
  filters: TemplateDiscoveryFilters,
  categories: readonly MobileTemplateCategory[]
): MobileTemplateGalleryItem[] {
  const query = normalizeTemplateDiscoveryQuery(filters.query);
  const selectedMoods = [...new Set(filters.moods.map(moodKey).filter((mood): mood is string => Boolean(mood)))];

  return templates.filter((template) => {
    if (filters.category !== "all" && template.category !== filters.category) {
      return false;
    }

    const moods = templateMoodKeys(template);
    if (!selectedMoods.every((mood) => moods.includes(mood))) {
      return false;
    }

    return !query || searchableText(template, categories).includes(query);
  });
}

export function getTemplateDiscoveryActiveFilterSummary(
  filters: TemplateDiscoveryFilters,
  categories: readonly MobileTemplateCategory[],
  moods = templateDiscoveryMoods
) {
  const labels = [
    filters.category === "all" ? null : categoryLabel(filters.category, categories),
    ...filters.moods.map((value) => moods.find((mood) => mood.key === moodKey(value))?.label ?? null),
    normalizeTemplateDiscoveryQuery(filters.query) || null
  ].filter((label): label is string => Boolean(label));

  return labels.length > 0 ? labels.join(" · ") : "전체 디자인";
}
