import type { ImageSourcePropType } from "react-native";
import type { MobileTemplateGalleryItem } from "./template-gallery";
import { getBundledTemplateCanvasSource, getBundledTemplatePreviewSource } from "./template-preview-source";
import { getInviteHubBaseUrl } from "./web-links";

function getRemoteSource(template: MobileTemplateGalleryItem): ImageSourcePropType | null {
  if (template.previewUrl) return { uri: template.previewUrl };
  if (!template.previewPath) return null;

  const uri = template.previewPath.startsWith("https://")
    ? template.previewPath
    : `${getInviteHubBaseUrl()}${template.previewPath}`;
  return { uri };
}

export function getTemplatePreviewSource(template: MobileTemplateGalleryItem) {
  if (template.remote) return getRemoteSource(template);
  return getBundledTemplatePreviewSource(template.id) ?? getRemoteSource(template);
}

export function getTemplateCanvasSource(template: MobileTemplateGalleryItem | null) {
  if (!template) return null;
  if (template.remote) return getRemoteSource(template);
  return getBundledTemplateCanvasSource(template.id) ?? getRemoteSource(template);
}
