/* eslint-disable @typescript-eslint/no-require-imports */

import type { ImageSourcePropType } from "react-native";
import { bundledTemplatePreviewIds } from "./template-preview-manifest";

type BundledTemplatePreviewId = (typeof bundledTemplatePreviewIds)[number];

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

export function hasBundledTemplatePreview(templateId: string): templateId is BundledTemplatePreviewId {
  return bundledTemplatePreviewIds.includes(templateId as BundledTemplatePreviewId);
}

export function getBundledTemplatePreviewSource(templateId: string) {
  if (!hasBundledTemplatePreview(templateId)) {
    return null;
  }

  return bundledTemplatePreviewSource[templateId];
}
