import { getTemplateDefaultTextPlacement, type TemplatePreset } from "@/lib/templates";

export const MOBILE_TEMPLATE_CATALOG_SCHEMA_VERSION = 1 as const;
export const MOBILE_TEMPLATE_CATALOG_MAX_ITEMS = 250;
export const MOBILE_TEMPLATE_CATALOG_MAX_BYTES = 192 * 1024;
export const MOBILE_TEMPLATE_CATALOG_ORIGIN = "https://invitation-platform-plum.vercel.app";

const supportedMobileCategories = new Set([
  "wedding",
  "dol",
  "hwangap",
  "bridal",
  "birthday",
  "housewarming",
  "baby",
  "graduation",
  "business"
]);

export type PublicMobileTemplateCatalogItem = {
  id: string;
  category: string;
  name: string;
  badge: string;
  desc: string;
  tags: string[];
  previewUrl: string;
  sampleTextOverlay: boolean;
  textPlacement: "top" | "center" | "bottom";
};

export type PublicMobileTemplateCatalog = {
  schemaVersion: typeof MOBILE_TEMPLATE_CATALOG_SCHEMA_VERSION;
  catalogVersion: string;
  templates: PublicMobileTemplateCatalogItem[];
  meta: {
    count: number;
    maxItems: number;
  };
};

function extractTemplateImageSource(html: string) {
  return html.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i)?.[1] ?? "";
}

function resolveCanonicalAssetUrl(value: string) {
  try {
    const url = new URL(value, `${MOBILE_TEMPLATE_CATALOG_ORIGIN}/`);
    if (
      url.protocol !== "https:" ||
      url.origin !== MOBILE_TEMPLATE_CATALOG_ORIGIN ||
      !url.pathname.startsWith("/images/custom/")
    ) {
      return null;
    }

    url.username = "";
    url.password = "";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function versionHash(items: PublicMobileTemplateCatalogItem[], versionSeed: string) {
  let hash = 2166136261;
  const source = `${versionSeed}|${JSON.stringify(items)}`;

  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `v1-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function withCatalogVersion(previewUrl: string, catalogVersion: string) {
  const url = new URL(previewUrl);
  url.search = "";
  url.searchParams.set("v", catalogVersion);
  return url.toString();
}

export function toPublicMobileTemplate(template: TemplatePreset): PublicMobileTemplateCatalogItem | null {
  const previewUrl = resolveCanonicalAssetUrl(extractTemplateImageSource(template.html));
  if (!previewUrl || !supportedMobileCategories.has(template.category)) return null;

  return {
    id: template.id,
    category: template.category,
    name: template.name,
    badge: template.badge,
    desc: template.desc,
    tags: template.tags.slice(0, 5),
    previewUrl,
    sampleTextOverlay: true,
    textPlacement: getTemplateDefaultTextPlacement(template)
  };
}

export function buildPublicMobileTemplateCatalog(
  templates: TemplatePreset[],
  versionSeed = process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_URL || "local-static"
) {
  const seen = new Set<string>();
  const publicTemplates = templates
    .flatMap((template) => {
      const item = toPublicMobileTemplate(template);
      if (!item || seen.has(item.id)) return [];
      seen.add(item.id);
      return [item];
    })
    .slice(0, MOBILE_TEMPLATE_CATALOG_MAX_ITEMS);

  while (true) {
    const catalogVersion = versionHash(publicTemplates, versionSeed);
    const versionedTemplates = publicTemplates.map((template) => ({
      ...template,
      previewUrl: withCatalogVersion(template.previewUrl, catalogVersion)
    }));
    const catalog: PublicMobileTemplateCatalog = {
      schemaVersion: MOBILE_TEMPLATE_CATALOG_SCHEMA_VERSION,
      catalogVersion,
      templates: versionedTemplates,
      meta: {
        count: versionedTemplates.length,
        maxItems: MOBILE_TEMPLATE_CATALOG_MAX_ITEMS
      }
    };
    const body = JSON.stringify(catalog);

    if (Buffer.byteLength(body, "utf8") <= MOBILE_TEMPLATE_CATALOG_MAX_BYTES || publicTemplates.length === 0) {
      return { body, catalog };
    }

    publicTemplates.pop();
  }
}
