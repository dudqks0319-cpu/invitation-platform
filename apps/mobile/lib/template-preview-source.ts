/* eslint-disable @typescript-eslint/no-require-imports */

import type { ImageSourcePropType } from "react-native";
import { bundledTemplatePreviewIds } from "./template-preview-manifest";

const bundledTemplatePreviewSource: Record<string, ImageSourcePropType> = {
  "wedding-classic": require("../assets/template-previews/custom/wedding/wedding-01.jpeg"),
  "wedding-modern": require("../assets/template-previews/custom/wedding/wedding-02.jpeg"),
  "wedding-floral": require("../assets/template-previews/custom/wedding/wedding-03.jpeg"),
  "wedding-minimal": require("../assets/template-previews/custom/wedding/wedding-04.jpeg"),
  "wedding-nature": require("../assets/template-previews/custom/wedding/wedding-05.jpeg"),
  "wedding-rose-gold": require("../assets/template-previews/custom/wedding/wedding-06.jpeg"),
  "wedding-flower-garden": require("../assets/template-previews/highres/wedding/flower-garden.png"),
  "wedding-minimal-line": require("../assets/template-previews/highres/wedding/minimal-line.png"),
  "wedding-ribbon-frame": require("../assets/template-previews/highres/wedding/ribbon-frame.png"),
  "wedding-starry-garden": require("../assets/template-previews/highres/wedding/starry-garden.png"),
  "wedding-soft-pastel": require("../assets/template-previews/highres/wedding/soft-pastel.png"),
  "wedding-watercolor-bloom": require("../assets/template-previews/highres/wedding/watercolor-bloom.png"),
  "dol-cute": require("../assets/template-previews/custom/dol/dol-card-01.jpeg"),
  "dol-pastel": require("../assets/template-previews/custom/dol/dol-card-02.jpeg"),
  "dol-blue": require("../assets/template-previews/custom/dol/dol-card-03.jpeg"),
  "dol-nature": require("../assets/template-previews/custom/dol/dol-card-04.jpeg"),
  "dol-gold": require("../assets/template-previews/custom/dol/dol-cake-01.jpeg"),
  "dol-eucalyptus": require("../assets/template-previews/custom/dol/dol-cake-02.jpeg"),
  "dol-star-cake": require("../assets/template-previews/custom/dol/dol-cake-03.jpeg"),
  "dol-blue-balloon": require("../assets/template-previews/custom/dol/dol-cake-04.jpeg"),
  "dol-pink-first": require("../assets/template-previews/custom/dol/dol-cake-05.jpeg"),
  "hwangap-classic": require("../assets/template-previews/custom/hwangap/hwangap-01.jpeg"),
  "hwangap-modern": require("../assets/template-previews/custom/hwangap/hwangap-02.jpeg"),
  "hwangap-red": require("../assets/template-previews/custom/hwangap/hwangap-03.jpeg"),
  "hwangap-floral": require("../assets/template-previews/custom/hwangap/hwangap-04.jpeg"),
  "hwangap-hanja": require("../assets/template-previews/custom/hwangap/hwangap-05.jpeg"),
  "hwangap-branch": require("../assets/template-previews/custom/hwangap/hwangap-06.jpeg"),
  "bridal-pink": require("../assets/template-previews/custom/bridal/bridal-01.jpeg"),
  "bridal-boho": require("../assets/template-previews/custom/bridal/bridal-02.jpeg"),
  "bridal-modern": require("../assets/template-previews/custom/bridal/bridal-03.jpeg"),
  "bridal-mint": require("../assets/template-previews/custom/bridal/bridal-04.jpeg"),
  "birthday-fun": require("../assets/template-previews/custom/birthday/birthday-01.jpeg"),
  "birthday-elegant": require("../assets/template-previews/custom/birthday/birthday-02.jpeg"),
  "birthday-kids": require("../assets/template-previews/custom/birthday/birthday-03.jpeg"),
  "birthday-ocean-shark": require("../assets/template-previews/custom/birthday/birthday-04.jpeg"),
  "birthday-unicorn": require("../assets/template-previews/custom/birthday/birthday-05.jpeg"),
  "birthday-winter-penguin": require("../assets/template-previews/custom/birthday/birthday-06.jpeg"),
  "birthday-city-bus": require("../assets/template-previews/custom/birthday/birthday-07.jpeg"),
  "birthday-hero-star": require("../assets/template-previews/custom/birthday/birthday-08.jpeg"),
  "birthday-safari-jungle": require("../assets/template-previews/custom/birthday/birthday-09.jpeg"),
  "house-warm": require("../assets/template-previews/genspark/6XcxVcVH.jpg"),
  "baby-shower": require("../assets/template-previews/genspark/zIB8bEWC.jpg"),
  graduation: require("../assets/template-previews/genspark/Xdz6nHcL.jpg"),
  business: require("../assets/template-previews/genspark/xpx0zLPW.jpg")
};

const extendedTemplatePreviewSource: Record<string, ImageSourcePropType> = {
  "anniversary-tulip": require("../assets/template-previews/genspark/78rOyfxL.jpg"),
  "anniversary-photo": require("../assets/template-previews/genspark/7W1rqztu.jpg"),
  "anniversary-heart": require("../assets/template-previews/genspark/AZJKCYaG.jpg"),
  "anniversary-night": require("../assets/template-previews/genspark/DJVxKvNl.jpg"),
  "anniversary-branch": require("../assets/template-previews/genspark/EFRNlJ6k.jpg"),
  "anniversary-paris": require("../assets/template-previews/genspark/EJf1yoDr.jpg"),
  "other-moving": require("../assets/template-previews/genspark/FeLszYGF.jpg"),
  "other-graduation": require("../assets/template-previews/genspark/IWM0Xjom.jpg"),
  "other-baby-shower": require("../assets/template-previews/genspark/J2t3Q3VC.jpg"),
  "other-retirement": require("../assets/template-previews/genspark/JpRqNMCV.jpg"),
  "other-teacher": require("../assets/template-previews/genspark/KIvCzl5p.jpg"),
  "other-worship": require("../assets/template-previews/genspark/LGIpWzz2.jpg")
};

export function hasBundledTemplatePreview(templateId: string) {
  return bundledTemplatePreviewIds.includes(templateId as (typeof bundledTemplatePreviewIds)[number]);
}

export function getBundledTemplatePreviewSource(templateId: string) {
  return extendedTemplatePreviewSource[templateId] ?? bundledTemplatePreviewSource[templateId] ?? null;
}
