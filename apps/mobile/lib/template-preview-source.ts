/* eslint-disable @typescript-eslint/no-require-imports */

import type { ImageSourcePropType } from "react-native";
import { bundledTemplateCanvasIds, bundledTemplatePreviewIds } from "./template-preview-manifest";

type BundledTemplatePreviewId = (typeof bundledTemplatePreviewIds)[number];
type BundledTemplateCanvasId = (typeof bundledTemplateCanvasIds)[number];

const bundledTemplatePreviewSource: Record<BundledTemplatePreviewId, ImageSourcePropType> = {
  "wedding-classic": require("../assets/template-previews/generated/wedding/wedding-classic.jpg"),
  "wedding-modern": require("../assets/template-previews/generated/wedding/wedding-modern.jpg"),
  "wedding-floral": require("../assets/template-previews/generated/wedding/wedding-floral.jpg"),
  "wedding-minimal": require("../assets/template-previews/generated/wedding/wedding-minimal.jpg"),
  "wedding-nature": require("../assets/template-previews/generated/wedding/wedding-nature.jpg"),
  "wedding-rose-gold": require("../assets/template-previews/generated/wedding/wedding-rose-gold.jpg"),
  "dol-cute": require("../assets/template-previews/generated/dol/dol-cute.jpg"),
  "dol-pastel": require("../assets/template-previews/generated/dol/dol-pastel.jpg"),
  "dol-blue": require("../assets/template-previews/generated/dol/dol-blue.jpg"),
  "dol-nature": require("../assets/template-previews/generated/dol/dol-nature.jpg"),
  "dol-gold": require("../assets/template-previews/generated/dol/dol-gold.jpg"),
  "hwangap-classic": require("../assets/template-previews/generated/hwangap/hwangap-classic.jpg"),
  "hwangap-modern": require("../assets/template-previews/generated/hwangap/hwangap-modern.jpg"),
  "hwangap-red": require("../assets/template-previews/generated/hwangap/hwangap-red.jpg"),
  "hwangap-floral": require("../assets/template-previews/generated/hwangap/hwangap-floral.jpg"),
  "hwangap-hanja": require("../assets/template-previews/generated/hwangap/hwangap-hanja.jpg"),
  "bridal-pink": require("../assets/template-previews/generated/bridal/bridal-pink.jpg"),
  "bridal-boho": require("../assets/template-previews/generated/bridal/bridal-boho.jpg"),
  "bridal-modern": require("../assets/template-previews/generated/bridal/bridal-modern.jpg"),
  "bridal-mint": require("../assets/template-previews/generated/bridal/bridal-mint.jpg"),
  "birthday-fun": require("../assets/template-previews/generated/birthday/birthday-fun.jpg"),
  "birthday-elegant": require("../assets/template-previews/generated/birthday/birthday-elegant.jpg"),
  "birthday-kids": require("../assets/template-previews/generated/birthday/birthday-kids.jpg"),
  "house-warm": require("../assets/template-previews/generated/housewarming/house-warm.jpg"),
  "house-modern": require("../assets/template-previews/generated/housewarming/house-modern.jpg"),
  "baby-shower": require("../assets/template-previews/generated/baby/baby-shower.jpg"),
  "baby-pink": require("../assets/template-previews/generated/baby/baby-pink.jpg"),
  graduation: require("../assets/template-previews/generated/graduation/graduation.jpg"),
  "graduation-warm": require("../assets/template-previews/generated/graduation/graduation-warm.jpg"),
  business: require("../assets/template-previews/generated/business/business.jpg"),
  "business-dark": require("../assets/template-previews/generated/business/business-dark.jpg")
};

const bundledTemplateCanvasSource: Record<BundledTemplateCanvasId, ImageSourcePropType> = {
  "wedding-classic": require("../assets/template-previews/custom/wedding/wedding-01.jpeg"),
  "wedding-modern": require("../assets/template-previews/custom/wedding/wedding-02.jpeg"),
  "wedding-floral": require("../assets/template-previews/custom/wedding/wedding-03.jpeg"),
  "wedding-minimal": require("../assets/template-previews/custom/wedding/wedding-04.jpeg"),
  "wedding-nature": require("../assets/template-previews/custom/wedding/wedding-05.jpeg"),
  "wedding-rose-gold": require("../assets/template-previews/custom/wedding/wedding-06.jpeg"),
  "dol-cute": require("../assets/template-previews/custom/dol/dol-card-01.jpeg"),
  "dol-pastel": require("../assets/template-previews/custom/dol/dol-card-02.jpeg"),
  "dol-blue": require("../assets/template-previews/custom/dol/dol-card-03.jpeg"),
  "dol-nature": require("../assets/template-previews/custom/dol/dol-card-04.jpeg"),
  "dol-gold": require("../assets/template-previews/custom/dol/dol-cake-01.jpeg"),
  "hwangap-classic": require("../assets/template-previews/custom/hwangap/hwangap-01.jpeg"),
  "hwangap-modern": require("../assets/template-previews/custom/hwangap/hwangap-02.jpeg"),
  "hwangap-red": require("../assets/template-previews/custom/hwangap/hwangap-03.jpeg"),
  "hwangap-floral": require("../assets/template-previews/custom/hwangap/hwangap-04.jpeg"),
  "hwangap-hanja": require("../assets/template-previews/custom/hwangap/hwangap-05.jpeg"),
  "bridal-pink": require("../assets/template-previews/custom/bridal/bridal-01.jpeg"),
  "bridal-boho": require("../assets/template-previews/custom/bridal/bridal-02.jpeg"),
  "bridal-modern": require("../assets/template-previews/custom/bridal/bridal-03.jpeg"),
  "bridal-mint": require("../assets/template-previews/custom/bridal/bridal-04.jpeg"),
  "birthday-fun": require("../assets/template-previews/custom/birthday/birthday-01.jpeg"),
  "birthday-elegant": require("../assets/template-previews/custom/birthday/birthday-02.jpeg"),
  "birthday-kids": require("../assets/template-previews/custom/birthday/birthday-03.jpeg"),
  "house-warm": require("../assets/template-previews/custom/other/house-warm.jpeg"),
  "house-modern": require("../assets/template-previews/custom/other/house-modern.jpeg"),
  "baby-shower": require("../assets/template-previews/custom/other/baby-shower.jpeg"),
  "baby-pink": require("../assets/template-previews/custom/other/baby-pink.jpeg"),
  graduation: require("../assets/template-previews/custom/other/graduation.jpeg"),
  "graduation-warm": require("../assets/template-previews/custom/other/graduation-warm.jpeg"),
  business: require("../assets/template-previews/custom/other/business.jpeg"),
  "business-dark": require("../assets/template-previews/custom/other/business-dark.jpeg")
};

export function hasBundledTemplatePreview(templateId: string): templateId is BundledTemplatePreviewId {
  return bundledTemplatePreviewIds.includes(templateId as BundledTemplatePreviewId);
}

export function getBundledTemplatePreviewSource(templateId: string) {
  if (!hasBundledTemplatePreview(templateId)) {
    return null;
  }

  return bundledTemplatePreviewSource[templateId];
}

export function getBundledTemplateCanvasSource(templateId: string) {
  if (!bundledTemplateCanvasIds.includes(templateId as BundledTemplateCanvasId)) {
    return null;
  }

  return bundledTemplateCanvasSource[templateId as BundledTemplateCanvasId];
}
