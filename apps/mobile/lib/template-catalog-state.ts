import type { MobileTemplateGalleryItem } from "./template-gallery";

export type TemplateCatalogSource = "loading" | "remote" | "cache" | "bundled-fallback";

export type TemplateCatalogState = {
  templates: MobileTemplateGalleryItem[];
  source: TemplateCatalogSource;
  refreshing: boolean;
  error: string | null;
  manualRetryCount: number;
};

export type TemplateCatalogAction =
  | { type: "cache-ready"; templates: MobileTemplateGalleryItem[] }
  | { type: "refresh-started" }
  | { type: "remote-ready"; templates: MobileTemplateGalleryItem[] }
  | { type: "remote-failed" }
  | { type: "manual-retry" };

export const TEMPLATE_CATALOG_MAX_MANUAL_RETRIES = 2;
export const TEMPLATE_CATALOG_SAFE_ERROR = "새 디자인을 불러오지 못했어요.";

export function createInitialTemplateCatalogState(
  bundledTemplates: MobileTemplateGalleryItem[]
): TemplateCatalogState {
  return {
    templates: bundledTemplates,
    source: "loading",
    refreshing: true,
    error: null,
    manualRetryCount: 0
  };
}

export function reduceTemplateCatalogState(
  state: TemplateCatalogState,
  action: TemplateCatalogAction
): TemplateCatalogState {
  switch (action.type) {
    case "cache-ready":
      return { ...state, templates: action.templates, source: "cache", refreshing: true };
    case "refresh-started":
      return { ...state, refreshing: true, error: null };
    case "remote-ready":
      return { ...state, templates: action.templates, source: "remote", refreshing: false, error: null };
    case "remote-failed":
      return {
        ...state,
        source: state.source === "loading" ? "bundled-fallback" : state.source,
        refreshing: false,
        error: TEMPLATE_CATALOG_SAFE_ERROR
      };
    case "manual-retry":
      if (state.refreshing || state.manualRetryCount >= TEMPLATE_CATALOG_MAX_MANUAL_RETRIES) {
        return state;
      }
      return {
        ...state,
        refreshing: true,
        error: null,
        manualRetryCount: state.manualRetryCount + 1
      };
  }
}
