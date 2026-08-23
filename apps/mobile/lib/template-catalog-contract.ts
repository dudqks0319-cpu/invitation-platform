export type TemplateCatalogSource = "loading" | "remote" | "cache" | "bundled-fallback";

export const templateCatalogContract = {
  observedLegacyRootCheckout: {
    previewAssetReferenceCount: 87,
    meaning: "runtime-preview-asset-references",
    isCurrentCatalogCount: false
  },
  bundledFallback: {
    count: 150,
    requiredMetadata: [
      "id",
      "category",
      "name",
      "badge",
      "desc",
      "tags",
      "textSafeArea"
    ]
  },
  remoteCatalog: {
    count: 180,
    schemaVersion: 1,
    catalogVersionPattern: "^v1-[a-f0-9]{8}$",
    requiredMetadata: [
      "id",
      "category",
      "name",
      "badge",
      "desc",
      "tags",
      "previewUrl",
      "sampleTextOverlay",
      "textPlacement"
    ]
  },
  cache: {
    acceptsOnlyValidatedCatalogs: true,
    keepsLastKnownGoodOnRefreshFailure: true
  },
  merge: {
    remoteTemplatesAppearFirst: true,
    bundledTemplatesRemainAvailableOffline: true
  },
  recovery: {
    maxManualRetries: 2,
    safeError: "새 디자인을 불러오지 못했어요."
  },
  statusCopy: {
    cache: "저장된 디자인을 보여드려요",
    refreshing: "최신 디자인을 확인하고 있어요"
  }
} as const;

export function getTemplateCatalogSourceCopy(
  source: TemplateCatalogSource,
  visibleTemplateCount: number
) {
  if (source === "cache") return templateCatalogContract.statusCopy.cache;
  if (source === "bundled-fallback") {
    return `기본 디자인 ${visibleTemplateCount}개를 보여드려요`;
  }
  return null;
}
