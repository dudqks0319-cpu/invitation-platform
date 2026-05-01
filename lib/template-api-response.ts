import type { SafeTemplate } from "@/lib/safe-templates";

export function buildTemplateResponse(templates: SafeTemplate[]) {
  const categories = Array.from(new Set(templates.map((template) => template.category))).sort();

  return {
    templates,
    meta: {
      count: templates.length,
      categories
    }
  };
}
