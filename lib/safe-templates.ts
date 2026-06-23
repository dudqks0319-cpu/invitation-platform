import { z } from "zod";

export const safeTemplateCategorySchema = z.enum(["wedding", "firstBirthday", "birthday", "anniversary"]);

export const safeTemplateSchema = z.object({
  id: z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/),
  title: z.string().trim().min(1).max(60),
  category: safeTemplateCategorySchema,
  subtitle: z.string().trim().max(100).default(""),
  badge: z.string().trim().max(20).default("NEW"),
  backgroundHex: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/).default("#FFF9F4"),
  accentHex: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/).default("#D8B8AA"),
  typography: z.enum(["serif", "sans"]).default("serif"),
  ornament: z.literal("imageBackground").default("imageBackground"),
  backgroundImageURL: z
    .string()
    .trim()
    .refine((value) => value.startsWith("/") || value.startsWith("https://"), "허용되지 않는 이미지 URL입니다."),
  backgroundImagePath: z.string().trim().max(300).optional().default(""),
  textAreaTop: z.coerce.number().min(0.08).max(0.42).default(0.28),
  textAreaBottom: z.coerce.number().min(0.08).max(0.42).default(0.24),
  textAreaHorizontal: z.coerce.number().min(0.08).max(0.24).default(0.14),
  primaryTextHex: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/).default("#2C2A2A"),
  secondaryTextHex: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/).default("#8B7D73"),
  isActive: z.boolean().default(true),
  qaState: z.enum(["pending", "passed", "failed"]).default("passed"),
  licenseState: z.enum(["pending", "approved", "rejected"]).default("approved"),
  rightsSourceType: z.enum(["ai_generated", "in_house", "licensed", "partner"]).default("in_house"),
  generationPrompt: z.string().trim().max(1000).default(""),
  generatorName: z.string().trim().max(120).default(""),
  licenseNote: z.string().trim().max(1000).default(""),
  qaNote: z.string().trim().max(1000).default("")
});

export type SafeTemplate = z.infer<typeof safeTemplateSchema>;

export const defaultSafeTemplates: SafeTemplate[] = [
  {
    id: "kr-wedding-botanical",
    title: "클래식 화이트",
    category: "wedding",
    subtitle: "레터프레스 질감과 금박 라인",
    badge: "CLASSIC",
    backgroundHex: "#FFFDF9",
    accentHex: "#C7A165",
    typography: "serif",
    ornament: "imageBackground",
    backgroundImageURL: "/images/admin-templates/kr-wedding-botanical.jpg",
    backgroundImagePath: "",
    textAreaTop: 0.30,
    textAreaBottom: 0.27,
    textAreaHorizontal: 0.16,
    primaryTextHex: "#2C2A2A",
    secondaryTextHex: "#8B7D73",
    isActive: true,
    qaState: "passed",
    licenseState: "approved",
    rightsSourceType: "in_house",
    generationPrompt: "",
    generatorName: "",
    licenseNote: "",
    qaNote: ""
  },
  {
    id: "kr-wedding-ribbon",
    title: "모던 핑크 프레임",
    category: "wedding",
    subtitle: "넓은 여백과 파스텔 보더",
    badge: "MODERN",
    backgroundHex: "#FFF8F6",
    accentHex: "#C9939E",
    typography: "serif",
    ornament: "imageBackground",
    backgroundImageURL: "/images/admin-templates/kr-wedding-ribbon.jpg",
    backgroundImagePath: "",
    textAreaTop: 0.29,
    textAreaBottom: 0.28,
    textAreaHorizontal: 0.16,
    primaryTextHex: "#2C2A2A",
    secondaryTextHex: "#8B7D73",
    isActive: true,
    qaState: "passed",
    licenseState: "approved",
    rightsSourceType: "in_house",
    generationPrompt: "",
    generatorName: "",
    licenseNote: "",
    qaNote: ""
  },
  {
    id: "kr-dol-bojagi",
    title: "담백한 첫돌",
    category: "firstBirthday",
    subtitle: "은은한 보자기 색감과 금빛 선",
    badge: "DOL",
    backgroundHex: "#FFFDF7",
    accentHex: "#CDA65B",
    typography: "serif",
    ornament: "imageBackground",
    backgroundImageURL: "/images/admin-templates/kr-dol-bojagi.jpg",
    backgroundImagePath: "",
    textAreaTop: 0.31,
    textAreaBottom: 0.25,
    textAreaHorizontal: 0.14,
    primaryTextHex: "#2F2A22",
    secondaryTextHex: "#8B7D73",
    isActive: true,
    qaState: "passed",
    licenseState: "approved",
    rightsSourceType: "in_house",
    generationPrompt: "",
    generatorName: "",
    licenseNote: "",
    qaNote: ""
  },
  {
    id: "kr-birthday-spring",
    title: "자수 플라워",
    category: "birthday",
    subtitle: "작은 꽃 자수와 크림 배경",
    badge: "FLOWER",
    backgroundHex: "#FFF9F7",
    accentHex: "#CBA7A1",
    typography: "serif",
    ornament: "imageBackground",
    backgroundImageURL: "/images/admin-templates/kr-birthday-spring.jpg",
    backgroundImagePath: "",
    textAreaTop: 0.29,
    textAreaBottom: 0.27,
    textAreaHorizontal: 0.15,
    primaryTextHex: "#2C2A2A",
    secondaryTextHex: "#8B7D73",
    isActive: true,
    qaState: "passed",
    licenseState: "approved",
    rightsSourceType: "in_house",
    generationPrompt: "",
    generatorName: "",
    licenseNote: "",
    qaNote: ""
  },
  {
    id: "kr-anniversary-moon",
    title: "네이비 별빛",
    category: "anniversary",
    subtitle: "깊은 남색과 은은한 금빛 별",
    badge: "NAVY",
    backgroundHex: "#14213D",
    accentHex: "#E6C37A",
    typography: "serif",
    ornament: "imageBackground",
    backgroundImageURL: "/images/admin-templates/kr-anniversary-moon.jpg",
    backgroundImagePath: "",
    textAreaTop: 0.28,
    textAreaBottom: 0.25,
    textAreaHorizontal: 0.14,
    primaryTextHex: "#FFF3DC",
    secondaryTextHex: "#E9D8B8",
    isActive: true,
    qaState: "passed",
    licenseState: "approved",
    rightsSourceType: "in_house",
    generationPrompt: "",
    generatorName: "",
    licenseNote: "",
    qaNote: ""
  }
];

export const safeTemplateCreateSchema = safeTemplateSchema
  .omit({ id: true, ornament: true, isActive: true })
  .extend({
    id: z.string().trim().max(80).regex(/^[a-z0-9-]+$/).optional(),
    isActive: z.boolean().optional().default(true),
    qaState: z.enum(["pending", "passed", "failed"]).default("pending"),
    licenseState: z.enum(["pending", "approved", "rejected"]).default("pending")
  });

export function normalizeSafeTemplate(value: unknown) {
  return safeTemplateSchema.parse(value);
}

export function templateSlugFromTitle(title: string) {
  const normalized = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || `template-${Date.now()}`;
}
