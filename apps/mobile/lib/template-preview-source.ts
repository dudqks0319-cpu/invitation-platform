/* eslint-disable @typescript-eslint/no-require-imports */

import type { ImageSourcePropType } from "react-native";
import { bundledTemplateCanvasIds, bundledTemplatePreviewIds } from "./template-preview-manifest";

type BundledTemplatePreviewId = (typeof bundledTemplatePreviewIds)[number];
type BundledTemplateCanvasId = (typeof bundledTemplateCanvasIds)[number];

const bundledTemplateCanvasSource: Record<BundledTemplateCanvasId, ImageSourcePropType> = {
  "wedding-classic": require("../assets/template-previews/custom/wedding/wedding-01.jpeg"),
  "wedding-modern": require("../assets/template-previews/custom/wedding/wedding-02.jpeg"),
  "wedding-floral": require("../assets/template-previews/custom/wedding/wedding-03.jpeg"),
  "wedding-minimal": require("../assets/template-previews/custom/wedding/wedding-04.jpeg"),
  "wedding-nature": require("../assets/template-previews/custom/wedding/wedding-05.jpeg"),
  "wedding-rose-gold": require("../assets/template-previews/custom/wedding/wedding-06.jpeg"),
  "wedding-photo-minimal": require("../assets/template-previews/custom/wedding/wedding-07.jpg"),
  "wedding-blush-petal": require("../assets/template-previews/custom/wedding/wedding-08.jpg"),
  "wedding-traditional-knot": require("../assets/template-previews/custom/wedding/wedding-09.jpg"),
  "wedding-envelope-photo": require("../assets/template-previews/custom/wedding/wedding-10.jpg"),
  "wedding-gold-botanical": require("../assets/template-previews/custom/wedding/wedding-11.jpg"),
  "wedding-illustration-curtain": require("../assets/template-previews/custom/wedding/wedding-12.jpg"),
  "wedding-botanical-vertical": require("../assets/template-previews/custom/wedding/wedding-13.jpg"),
  "wedding-photo-overlay": require("../assets/template-previews/custom/wedding/wedding-14.jpg"),
  "wedding-photo-hero": require("../assets/template-previews/custom/wedding/wedding-15.jpg"),
  "wedding-green-arch": require("../assets/template-previews/custom/wedding/wedding-16.jpg"),
  "wedding-anime-textspace-01": require("../assets/template-previews/custom/wedding/wedding-17.jpg"),
  "wedding-anime-textspace-02": require("../assets/template-previews/custom/wedding/wedding-18.jpg"),
  "wedding-anime-textspace-03": require("../assets/template-previews/custom/wedding/wedding-19.jpg"),
  "wedding-anime-textspace-04": require("../assets/template-previews/custom/wedding/wedding-20.jpg"),
  "wedding-anime-textspace-05": require("../assets/template-previews/custom/wedding/wedding-21.jpg"),
  "wedding-anime-textspace-06": require("../assets/template-previews/custom/wedding/wedding-22.jpg"),
  "wedding-anime-textspace-07": require("../assets/template-previews/custom/wedding/wedding-23.jpg"),
  "wedding-anime-textspace-08": require("../assets/template-previews/custom/wedding/wedding-24.jpg"),
  "wedding-anime-textspace-09": require("../assets/template-previews/custom/wedding/wedding-25.jpg"),
  "wedding-anime-textspace-10": require("../assets/template-previews/custom/wedding/wedding-26.jpg"),
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
  "business-dark": require("../assets/template-previews/custom/other/business-dark.jpeg"),
  "wedding-anime-2026": require("../assets/template-previews/custom/anime-2026/wedding-anime-2026.jpg"),
  "dol-anime-2026": require("../assets/template-previews/custom/anime-2026/dol-anime-2026.jpg"),
  "hwangap-anime-2026": require("../assets/template-previews/custom/anime-2026/hwangap-anime-2026.jpg"),
  "bridal-anime-2026": require("../assets/template-previews/custom/anime-2026/bridal-anime-2026.jpg"),
  "birthday-anime-2026": require("../assets/template-previews/custom/anime-2026/birthday-anime-2026.jpg"),
  "housewarming-anime-2026": require("../assets/template-previews/custom/anime-2026/housewarming-anime-2026.jpg"),
  "baby-anime-2026": require("../assets/template-previews/custom/anime-2026/baby-anime-2026.jpg"),
  "graduation-anime-2026": require("../assets/template-previews/custom/anime-2026/graduation-anime-2026.jpg"),
  "business-anime-2026": require("../assets/template-previews/custom/anime-2026/business-anime-2026.jpg"),
  "wedding-barunson-anime-01": require("../assets/template-previews/custom/barunson-category-anime-2026/wedding-01.jpg"),
  "wedding-barunson-anime-02": require("../assets/template-previews/custom/barunson-category-anime-2026/wedding-02.jpg"),
  "wedding-barunson-anime-03": require("../assets/template-previews/custom/barunson-category-anime-2026/wedding-03.jpg"),
  "dol-barunson-anime-01": require("../assets/template-previews/custom/barunson-category-anime-2026/dol-01.jpg"),
  "dol-barunson-anime-02": require("../assets/template-previews/custom/barunson-category-anime-2026/dol-02.jpg"),
  "dol-barunson-anime-03": require("../assets/template-previews/custom/barunson-category-anime-2026/dol-03.jpg"),
  "housewarming-barunson-anime-01": require("../assets/template-previews/custom/barunson-category-anime-2026/housewarming-01.jpg"),
  "housewarming-barunson-anime-02": require("../assets/template-previews/custom/barunson-category-anime-2026/housewarming-02.jpg"),
  "housewarming-barunson-anime-03": require("../assets/template-previews/custom/barunson-category-anime-2026/housewarming-03.jpg"),
  "hwangap-barunson-anime-01": require("../assets/template-previews/custom/barunson-category-anime-2026/hwangap-01.jpg"),
  "hwangap-barunson-anime-02": require("../assets/template-previews/custom/barunson-category-anime-2026/hwangap-02.jpg"),
  "hwangap-barunson-anime-03": require("../assets/template-previews/custom/barunson-category-anime-2026/hwangap-03.jpg"),
  "bridal-barunson-anime-01": require("../assets/template-previews/custom/barunson-category-anime-2026/bridal-01.jpg"),
  "bridal-barunson-anime-02": require("../assets/template-previews/custom/barunson-category-anime-2026/bridal-02.jpg"),
  "bridal-barunson-anime-03": require("../assets/template-previews/custom/barunson-category-anime-2026/bridal-03.jpg"),
  "birthday-barunson-anime-01": require("../assets/template-previews/custom/barunson-category-anime-2026/birthday-01.jpg"),
  "birthday-barunson-anime-02": require("../assets/template-previews/custom/barunson-category-anime-2026/birthday-02.jpg"),
  "birthday-barunson-anime-03": require("../assets/template-previews/custom/barunson-category-anime-2026/birthday-03.jpg"),
  "baby-barunson-anime-01": require("../assets/template-previews/custom/barunson-category-anime-2026/baby-01.jpg"),
  "baby-barunson-anime-02": require("../assets/template-previews/custom/barunson-category-anime-2026/baby-02.jpg"),
  "baby-barunson-anime-03": require("../assets/template-previews/custom/barunson-category-anime-2026/baby-03.jpg"),
  "graduation-barunson-anime-01": require("../assets/template-previews/custom/barunson-category-anime-2026/graduation-01.jpg"),
  "graduation-barunson-anime-02": require("../assets/template-previews/custom/barunson-category-anime-2026/graduation-02.jpg"),
  "graduation-barunson-anime-03": require("../assets/template-previews/custom/barunson-category-anime-2026/graduation-03.jpg"),
  "business-barunson-anime-01": require("../assets/template-previews/custom/barunson-category-anime-2026/business-01.jpg"),
  "business-barunson-anime-02": require("../assets/template-previews/custom/barunson-category-anime-2026/business-02.jpg"),
  "business-barunson-anime-03": require("../assets/template-previews/custom/barunson-category-anime-2026/business-03.jpg")
};

export function hasBundledTemplatePreview(templateId: string): templateId is BundledTemplatePreviewId {
  return bundledTemplatePreviewIds.includes(templateId as BundledTemplatePreviewId);
}

export function getBundledTemplatePreviewSource(templateId: string) {
  if (!hasBundledTemplatePreview(templateId)) {
    return null;
  }

  return getBundledTemplateCanvasSource(templateId);
}

export function getBundledTemplateCanvasSource(templateId: string) {
  if (!bundledTemplateCanvasIds.includes(templateId as BundledTemplateCanvasId)) {
    return null;
  }

  return bundledTemplateCanvasSource[templateId as BundledTemplateCanvasId];
}
