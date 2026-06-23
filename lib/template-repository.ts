import { z } from "zod";
import {
  defaultSafeTemplates,
  normalizeSafeTemplate,
  safeTemplateCategorySchema,
  type SafeTemplate
} from "@/lib/safe-templates";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const templateSelect = [
  "id",
  "title",
  "category",
  "subtitle",
  "badge",
  "background_hex",
  "accent_hex",
  "typography",
  "ornament",
  "background_image_url",
  "background_image_path",
  "text_area_top",
  "text_area_bottom",
  "text_area_horizontal",
  "primary_text_hex",
  "secondary_text_hex",
  "is_active",
  "qa_state",
  "license_state",
  "rights_source_type",
  "generation_prompt",
  "generator_name",
  "license_note",
  "qa_note"
].join(",");

const templateRowSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: safeTemplateCategorySchema,
  subtitle: z.string().nullable().optional(),
  badge: z.string().nullable().optional(),
  background_hex: z.string().nullable().optional(),
  accent_hex: z.string().nullable().optional(),
  typography: z.string().nullable().optional(),
  ornament: z.string().nullable().optional(),
  background_image_url: z.string(),
  background_image_path: z.string().nullable().optional(),
  text_area_top: z.union([z.number(), z.string()]).nullable().optional(),
  text_area_bottom: z.union([z.number(), z.string()]).nullable().optional(),
  text_area_horizontal: z.union([z.number(), z.string()]).nullable().optional(),
  primary_text_hex: z.string().nullable().optional(),
  secondary_text_hex: z.string().nullable().optional(),
  is_active: z.boolean().nullable().optional(),
  qa_state: z.enum(["pending", "passed", "failed"]).nullable().optional(),
  license_state: z.enum(["pending", "approved", "rejected"]).nullable().optional(),
  rights_source_type: z.enum(["ai_generated", "in_house", "licensed", "partner"]).nullable().optional(),
  generation_prompt: z.string().nullable().optional(),
  generator_name: z.string().nullable().optional(),
  license_note: z.string().nullable().optional(),
  qa_note: z.string().nullable().optional()
});

type TemplateRow = z.infer<typeof templateRowSchema>;

function rowToSafeTemplate(row: TemplateRow) {
  return normalizeSafeTemplate({
    id: row.id,
    title: row.title,
    category: row.category,
    subtitle: row.subtitle ?? "",
    badge: row.badge ?? "NEW",
    backgroundHex: row.background_hex ?? "#FFF9F4",
    accentHex: row.accent_hex ?? "#D8B8AA",
    typography: row.typography ?? "serif",
    ornament: "imageBackground",
    backgroundImageURL: row.background_image_url,
    backgroundImagePath: row.background_image_path ?? "",
    textAreaTop: row.text_area_top ?? 0.28,
    textAreaBottom: row.text_area_bottom ?? 0.24,
    textAreaHorizontal: row.text_area_horizontal ?? 0.14,
    primaryTextHex: row.primary_text_hex ?? "#2C2A2A",
    secondaryTextHex: row.secondary_text_hex ?? "#8B7D73",
    isActive: row.is_active ?? true,
    qaState: row.qa_state ?? "pending",
    licenseState: row.license_state ?? "pending",
    rightsSourceType: row.rights_source_type ?? "in_house",
    generationPrompt: row.generation_prompt ?? "",
    generatorName: row.generator_name ?? "",
    licenseNote: row.license_note ?? "",
    qaNote: row.qa_note ?? ""
  });
}

function parseRows(rows: unknown) {
  const parsed = z.array(templateRowSchema).safeParse(rows ?? []);
  if (!parsed.success) {
    return [];
  }

  return parsed.data.flatMap((row) => {
    try {
      return [rowToSafeTemplate(row)];
    } catch {
      return [];
    }
  });
}

type MergeSafeTemplateOptions = {
  includeInactive?: boolean;
};

function isPublicReadyTemplate(template: SafeTemplate) {
  return template.isActive && template.qaState === "passed" && template.licenseState === "approved";
}

export function mergeSafeTemplates(customTemplates: SafeTemplate[], options: MergeSafeTemplateOptions = {}) {
  const seen = new Set<string>();
  const merged: SafeTemplate[] = [];

  for (const template of [...customTemplates, ...defaultSafeTemplates]) {
    if (seen.has(template.id)) {
      continue;
    }

    if (!options.includeInactive && !isPublicReadyTemplate(template)) {
      continue;
    }

    seen.add(template.id);
    merged.push(template);
  }

  return merged;
}

export async function fetchSafeTemplates(options: { includeInactive?: boolean } = {}) {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return defaultSafeTemplates;
  }

  let query = admin
    .from("invitation_templates")
    .select(templateSelect)
    .order("created_at", { ascending: false });

  if (!options.includeInactive) {
    query = query
      .eq("is_active", true)
      .eq("qa_state", "passed")
      .eq("license_state", "approved");
  }

  const { data, error } = await query;
  if (error) {
    return defaultSafeTemplates;
  }

  return mergeSafeTemplates(parseRows(data), { includeInactive: options.includeInactive });
}

export function toTemplateInsert(template: SafeTemplate, userId: string) {
  return {
    id: template.id,
    title: template.title,
    category: template.category,
    subtitle: template.subtitle,
    badge: template.badge,
    background_hex: template.backgroundHex,
    accent_hex: template.accentHex,
    typography: template.typography,
    ornament: template.ornament,
    background_image_url: template.backgroundImageURL,
    background_image_path: template.backgroundImagePath,
    text_area_top: template.textAreaTop,
    text_area_bottom: template.textAreaBottom,
    text_area_horizontal: template.textAreaHorizontal,
    primary_text_hex: template.primaryTextHex,
    secondary_text_hex: template.secondaryTextHex,
    is_active: template.isActive,
    qa_state: template.qaState,
    license_state: template.licenseState,
    rights_source_type: template.rightsSourceType,
    generation_prompt: template.generationPrompt,
    generator_name: template.generatorName,
    license_note: template.licenseNote,
    qa_note: template.qaNote,
    created_by: userId
  };
}
