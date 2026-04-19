import type { ImageSourcePropType } from "react-native";
import { bundledTemplatePreviewIds } from "./template-preview-manifest";

const bundledTemplatePreviewSource = {
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
  "house-warm": require("../assets/template-previews/genspark/6XcxVcVH.jpg"),
  "baby-shower": require("../assets/template-previews/genspark/zIB8bEWC.jpg"),
  graduation: require("../assets/template-previews/genspark/Xdz6nHcL.jpg"),
  business: require("../assets/template-previews/genspark/xpx0zLPW.jpg")
} satisfies Record<string, ImageSourcePropType>;

export function hasBundledTemplatePreview(templateId: string) {
  return bundledTemplatePreviewIds.includes(templateId as (typeof bundledTemplatePreviewIds)[number]);
}

export function getBundledTemplatePreviewSource(templateId: string) {
  return bundledTemplatePreviewSource[templateId] ?? null;
}
