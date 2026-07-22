import { describe, expect, it } from "vitest";
import type { MobileTemplateGalleryItem } from "./template-gallery";
import {
  createInitialTemplateCatalogState,
  reduceTemplateCatalogState,
  TEMPLATE_CATALOG_MAX_MANUAL_RETRIES,
  TEMPLATE_CATALOG_SAFE_ERROR
} from "./template-catalog-state";

const bundled: MobileTemplateGalleryItem[] = [
  { id: "bundled", category: "wedding", name: "번들", badge: "결혼식", desc: "기본", tags: ["#기본"] }
];
const cached: MobileTemplateGalleryItem[] = [
  { id: "cached", category: "dol", name: "캐시", badge: "돌잔치", desc: "저장됨", tags: ["#저장"] }
];
const remote: MobileTemplateGalleryItem[] = [
  { id: "remote", category: "business", name: "원격", badge: "비즈니스", desc: "최신", tags: ["#최신"] }
];

describe("template catalog UI state", () => {
  it("moves truthfully from loading to cache and then remote", () => {
    const initial = createInitialTemplateCatalogState(bundled);
    const cacheState = reduceTemplateCatalogState(initial, { type: "cache-ready", templates: cached });
    const remoteState = reduceTemplateCatalogState(cacheState, { type: "remote-ready", templates: remote });

    expect(initial).toMatchObject({ source: "loading", refreshing: true, templates: bundled });
    expect(cacheState).toMatchObject({ source: "cache", refreshing: true, templates: cached });
    expect(remoteState).toMatchObject({ source: "remote", refreshing: false, templates: remote, error: null });
  });

  it("reports cache or bundled fallback after failure without leaking raw errors", () => {
    const initial = createInitialTemplateCatalogState(bundled);
    const cachedFailure = reduceTemplateCatalogState(
      reduceTemplateCatalogState(initial, { type: "cache-ready", templates: cached }),
      { type: "remote-failed" }
    );
    const bundledFailure = reduceTemplateCatalogState(initial, { type: "remote-failed" });

    expect(cachedFailure).toMatchObject({ source: "cache", refreshing: false, error: TEMPLATE_CATALOG_SAFE_ERROR });
    expect(bundledFailure).toMatchObject({ source: "bundled-fallback", refreshing: false, error: TEMPLATE_CATALOG_SAFE_ERROR });
    expect(JSON.stringify([cachedFailure, bundledFailure])).not.toContain("token");
  });

  it("allows only a bounded number of manual retries", () => {
    let state = reduceTemplateCatalogState(createInitialTemplateCatalogState(bundled), { type: "remote-failed" });

    for (let attempt = 0; attempt < TEMPLATE_CATALOG_MAX_MANUAL_RETRIES; attempt += 1) {
      state = reduceTemplateCatalogState(state, { type: "manual-retry" });
      expect(state.refreshing).toBe(true);
      state = reduceTemplateCatalogState(state, { type: "remote-failed" });
    }

    const exhausted = reduceTemplateCatalogState(state, { type: "manual-retry" });
    expect(exhausted).toBe(state);
    expect(exhausted.manualRetryCount).toBe(TEMPLATE_CATALOG_MAX_MANUAL_RETRIES);
  });
});
