/* eslint-disable @typescript-eslint/no-require-imports */

import type { ImageSourcePropType } from "react-native";

const finishedHomeHeroSource: Record<string, ImageSourcePropType> = {
  "wedding-barunson-anime-09": require("../assets/home-hero/finished/wedding-09-finished-v1.png"),
  "wedding-barunson-anime-04": require("../assets/home-hero/finished/wedding-04-finished-v1.png"),
  "wedding-barunson-anime-10": require("../assets/home-hero/finished/wedding-10-finished-v1.png")
};

export function getFinishedHomeHeroSource(templateId: string) {
  return finishedHomeHeroSource[templateId] ?? null;
}
