export type TemplateTextSafeArea = {
  topPct: number;
  bottomPct: number;
  leftPct: number;
  rightPct: number;
  backdrop: "none" | "light";
};

export type TemplateTextPlacement = "top" | "center" | "bottom";

export type TemplateTextLayout = {
  arrangement: "single" | "top-and-bottom";
  areas: readonly TemplateTextSafeArea[];
};

const HORIZONTAL_SAFE_AREA = { leftPct: 8, rightPct: 92 } as const;

type ReviewedLayoutBounds = {
  arrangement: TemplateTextLayout["arrangement"];
  areas: readonly (readonly [number, number, "light"?])[];
};

const CENTERED_SUBJECT_TEMPLATE_IDS = [
  "wedding-barunson-anime-04",
  "wedding-barunson-anime-09",
  "wedding-barunson-anime-10"
] as const;

const MIDDLE_GAP_TEMPLATE_IDS = Array.from(
  { length: 10 },
  (_, index) => `wedding-barunson-anime-${String(index + 25).padStart(2, "0")}`
);

const REVIEWED_TEMPLATE_TEXT_LAYOUTS: Record<string, ReviewedLayoutBounds> = Object.fromEntries([
  ...CENTERED_SUBJECT_TEMPLATE_IDS.map((templateId) => [templateId, {
    arrangement: "top-and-bottom" as const,
    areas: [[8, 25], [76, 94]] as const
  }]),
  ...MIDDLE_GAP_TEMPLATE_IDS.map((templateId) => [templateId, {
    arrangement: "single" as const,
    areas: [[24, 60]] as const
  }])
]);

const CATEGORY_CENTER_SAFE_AREAS: Record<string, readonly [number, number]> = {
  wedding: [25, 60],
  dol: [22, 57],
  hwangap: [16, 46],
  bridal: [24, 59],
  birthday: [20, 55],
  housewarming: [15, 50],
  baby: [25, 60],
  graduation: [22, 57],
  business: [22, 57]
};

const REVIEWED_TEMPLATE_SAFE_AREAS: Record<string, readonly [number, number, "light"?]> = {
  "wedding-barunson-anime-04": [75, 94],
  "wedding-barunson-anime-05": [75, 94],
  "wedding-barunson-anime-06": [75, 94],
  "wedding-barunson-anime-07": [75, 94],
  "wedding-barunson-anime-08": [75, 94],
  "wedding-barunson-anime-09": [75, 94],
  "wedding-barunson-anime-10": [75, 94],
  "wedding-barunson-anime-11": [75, 94],
  "wedding-barunson-anime-12": [75, 94],
  "wedding-barunson-anime-13": [75, 94],
  "wedding-barunson-anime-14": [75, 94],
  "wedding-barunson-anime-15": [75, 94],
  "wedding-barunson-anime-16": [75, 94],
  "wedding-barunson-anime-17": [75, 94],
  "wedding-barunson-anime-18": [75, 94],
  "wedding-barunson-anime-01": [0, 35],
  "wedding-barunson-anime-02": [0, 35],
  "wedding-barunson-anime-03": [0, 35],
  "dol-barunson-anime-13": [20, 48],
  "dol-barunson-anime-04": [20, 48],
  "dol-barunson-anime-05": [20, 50],
  "dol-barunson-anime-06": [18, 48],
  "dol-barunson-anime-07": [18, 49],
  "dol-barunson-anime-08": [20, 49],
  "dol-barunson-anime-09": [17, 45],
  "dol-barunson-anime-10": [17, 45],
  "dol-barunson-anime-11": [24, 51],
  "dol-barunson-anime-12": [20, 48],
  "dol-cute": [24, 47],
  "dol-pastel": [31, 58],
  "dol-blue": [62, 86, "light"],
  "dol-nature": [34, 64],
  "dol-gold": [22, 45],
  "dol-anime-2026": [32, 58],
  "dol-barunson-anime-01": [18, 45],
  "dol-barunson-anime-02": [18, 45],
  "dol-barunson-anime-03": [16, 44],
  "baby-shower": [32, 58],
  "baby-pink": [32, 58],
  "baby-anime-2026": [29, 55],
  "baby-barunson-anime-05": [42, 66],
  "baby-barunson-anime-06": [42, 65],
  "baby-barunson-anime-01": [17, 44],
  "baby-barunson-anime-02": [18, 45],
  "baby-barunson-anime-03": [17, 44],
  "hwangap-barunson-anime-09": [31, 53],
  "hwangap-barunson-anime-16": [24, 46],
  "hwangap-barunson-anime-04": [20, 48],
  "hwangap-barunson-anime-05": [20, 48],
  "hwangap-barunson-anime-06": [22, 50],
  "hwangap-classic": [27, 51],
  "hwangap-modern": [29, 53],
  "hwangap-hanja": [27, 51],
  "hwangap-anime-2026": [31, 53],
  "hwangap-barunson-anime-01": [18, 43],
  "hwangap-barunson-anime-02": [17, 39],
  "hwangap-barunson-anime-03": [18, 42],
  "housewarming-barunson-anime-04": [18, 45],
  "housewarming-barunson-anime-05": [18, 45],
  "housewarming-barunson-anime-06": [18, 43],
  "housewarming-barunson-anime-07": [18, 43],
  "housewarming-barunson-anime-08": [16, 42],
  "house-warm": [42, 65],
  "housewarming-anime-2026": [28, 56],
  "housewarming-barunson-anime-01": [10, 38],
  "housewarming-barunson-anime-02": [10, 38],
  "housewarming-barunson-anime-03": [10, 38],
  "bridal-pink": [28, 56],
  "bridal-boho": [30, 58],
  "bridal-mint": [32, 60],
  "bridal-barunson-anime-01": [22, 50],
  "bridal-barunson-anime-02": [18, 46],
  "bridal-barunson-anime-03": [14, 42],
  "business-barunson-anime-01": [12, 40],
  "business-barunson-anime-02": [12, 40],
  "business-barunson-anime-03": [16, 44],
  "birthday-fun": [36, 56, "light"],
  "birthday-elegant": [36, 56],
  "birthday-barunson-anime-01": [26, 48],
  "birthday-barunson-anime-02": [27, 49],
  "birthday-barunson-anime-03": [25, 46, "light"],
  "graduation-anime-2026": [39, 61],
  "graduation-barunson-anime-01": [10, 28],
  "graduation-barunson-anime-02": [20, 42],
  "graduation-barunson-anime-03": [18, 39]
};

function fromVerticalBounds(topPct: number, bottomPct: number, backdrop: "none" | "light" = "none") {
  return { topPct, bottomPct, ...HORIZONTAL_SAFE_AREA, backdrop } satisfies TemplateTextSafeArea;
}

export function isTemplateTextSafeArea(value: unknown): value is TemplateTextSafeArea {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;

  const candidate = value as Record<string, unknown>;
  const keys = Object.keys(candidate);
  if (
    keys.length !== 5 ||
    !["topPct", "bottomPct", "leftPct", "rightPct", "backdrop"].every((key) => keys.includes(key))
  ) {
    return false;
  }

  const { topPct, bottomPct, leftPct, rightPct, backdrop } = candidate;
  return (
    typeof topPct === "number" &&
    Number.isFinite(topPct) &&
    typeof bottomPct === "number" &&
    Number.isFinite(bottomPct) &&
    typeof leftPct === "number" &&
    Number.isFinite(leftPct) &&
    typeof rightPct === "number" &&
    Number.isFinite(rightPct) &&
    topPct >= 0 &&
    topPct < bottomPct &&
    bottomPct <= 100 &&
    leftPct >= 0 &&
    leftPct < rightPct &&
    rightPct <= 100 &&
    (backdrop === "none" || backdrop === "light")
  );
}

export function resolveTemplateTextSafeArea({
  category,
  templateId,
  textPlacement = "center"
}: {
  category: string;
  templateId: string;
  textPlacement?: TemplateTextPlacement;
}): TemplateTextSafeArea {
  const reviewed = REVIEWED_TEMPLATE_SAFE_AREAS[templateId];
  if (reviewed) return fromVerticalBounds(reviewed[0], reviewed[1], reviewed[2]);

  if (textPlacement === "top") return fromVerticalBounds(8, 43);
  if (textPlacement === "bottom") return fromVerticalBounds(57, 92);

  const [topPct, bottomPct] = CATEGORY_CENTER_SAFE_AREAS[category] ?? CATEGORY_CENTER_SAFE_AREAS.wedding;
  return fromVerticalBounds(topPct, bottomPct);
}

export function resolveTemplateTextLayout({
  category,
  fallbackSafeArea,
  templateId,
  textPlacement = "center"
}: {
  category: string;
  fallbackSafeArea?: TemplateTextSafeArea;
  templateId: string;
  textPlacement?: TemplateTextPlacement;
}): TemplateTextLayout {
  const reviewed = REVIEWED_TEMPLATE_TEXT_LAYOUTS[templateId];
  if (reviewed) {
    return {
      arrangement: reviewed.arrangement,
      areas: reviewed.areas.map(([topPct, bottomPct, backdrop]) => (
        fromVerticalBounds(topPct, bottomPct, backdrop)
      ))
    };
  }

  return {
    arrangement: "single",
    areas: [fallbackSafeArea ?? resolveTemplateTextSafeArea({ category, templateId, textPlacement })]
  };
}
