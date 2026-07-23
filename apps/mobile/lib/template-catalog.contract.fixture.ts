export const templateCatalogContract = {
  bundledTemplateCount: 150,
  remoteTemplateCount: 180,
  bundledRequiredMetadata: [
    "id",
    "category",
    "name",
    "badge",
    "desc",
    "tags",
    "textSafeArea"
  ],
  remoteRequiredMetadata: [
    "id",
    "category",
    "name",
    "badge",
    "desc",
    "tags",
    "previewUrl",
    "sampleTextOverlay",
    "textPlacement"
  ],
  cache: {
    acceptsOnlyValidatedCatalogs: true,
    keepsLastKnownGoodOnRefreshFailure: true
  },
  merge: {
    remoteTemplatesAppearFirst: true,
    bundledTemplatesRemainAvailableOffline: true
  }
} as const;
