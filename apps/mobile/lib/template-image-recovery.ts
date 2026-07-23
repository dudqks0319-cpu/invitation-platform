import type { ImageSourcePropType } from "react-native";

export function getTemplateImageSourceIdentity(source: ImageSourcePropType | null) {
  if (source === null) return "missing";
  if (typeof source === "number") return `asset:${source}`;
  return `source:${JSON.stringify(source)}`;
}

export type TemplateImageRecoveryState = {
  sourceIdentity: string;
  failed: boolean;
};

export function createTemplateImageRecoveryState(source: ImageSourcePropType | null): TemplateImageRecoveryState {
  return { sourceIdentity: getTemplateImageSourceIdentity(source), failed: false };
}

export function synchronizeTemplateImageRecoveryState(
  state: TemplateImageRecoveryState,
  source: ImageSourcePropType | null
) {
  const sourceIdentity = getTemplateImageSourceIdentity(source);
  return state.sourceIdentity === sourceIdentity
    ? state
    : { sourceIdentity, failed: false };
}

export function resolveRecoverableTemplateImage(
  source: ImageSourcePropType | null,
  failedSourceIdentity: string | null
) {
  const sourceIdentity = getTemplateImageSourceIdentity(source);
  return {
    sourceIdentity,
    visibleSource: failedSourceIdentity === sourceIdentity ? null : source
  };
}
