import type { ImageSourcePropType } from "react-native";
import type { MobileTemplateGalleryItem } from "./template-gallery";
import { getBundledTemplateCanvasSource, getBundledTemplatePreviewSource } from "./template-preview-source";
import { getInviteHubBaseUrl } from "./web-links";

const curatedBundledTemplateIds = new Set([
  "house-warm",
  "baby-pink",
  "graduation",
  "business"
]);

function getRemoteSource(template: MobileTemplateGalleryItem): ImageSourcePropType | null {
  if (template.previewUrl) return { uri: template.previewUrl };
  if (!template.previewPath) return null;

  const uri = template.previewPath.startsWith("https://")
    ? template.previewPath
    : `${getInviteHubBaseUrl()}${template.previewPath}`;
  return { uri };
}

export function getTemplatePreviewSource(template: MobileTemplateGalleryItem) {
  const bundledSource = getBundledTemplatePreviewSource(template.id);
  if (curatedBundledTemplateIds.has(template.id) && bundledSource) return bundledSource;
  if (template.remote) return getRemoteSource(template);
  return bundledSource ?? getRemoteSource(template);
}

export function getTemplateCanvasSource(template: MobileTemplateGalleryItem | null) {
  if (!template) return null;
  const bundledSource = getBundledTemplateCanvasSource(template.id);
  if (curatedBundledTemplateIds.has(template.id) && bundledSource) return bundledSource;
  if (template.remote) return getRemoteSource(template);
  return bundledSource ?? getRemoteSource(template);
}
