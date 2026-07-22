import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import { AppState } from "react-native";
import { mobileTemplateGallery, type MobileTemplateGalleryItem } from "@/lib/template-gallery";
import {
  mergeTemplateCatalog,
  readCachedTemplateCatalog,
  fetchRemoteTemplateCatalog,
  writeCachedTemplateCatalog
} from "@/lib/remote-template-catalog";
import {
  createInitialTemplateCatalogState,
  reduceTemplateCatalogState,
  TEMPLATE_CATALOG_MAX_MANUAL_RETRIES,
  type TemplateCatalogSource
} from "@/lib/template-catalog-state";

const ACTIVE_REFRESH_COOLDOWN_MS = 5 * 60 * 1000;

type TemplateCatalogValue = {
  templates: MobileTemplateGalleryItem[];
  findById: (templateId: string) => MobileTemplateGalleryItem | null;
  source: TemplateCatalogSource;
  refreshing: boolean;
  error: string | null;
  canRetry: boolean;
  retry: () => void;
};

const TemplateCatalogContext = createContext<TemplateCatalogValue | null>(null);

export function TemplateCatalogProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    reduceTemplateCatalogState,
    mobileTemplateGallery,
    createInitialTemplateCatalogState
  );
  const mountedRef = useRef(true);
  const refreshInFlightRef = useRef<Promise<void> | null>(null);
  const lastRefreshAtRef = useRef(0);

  const refresh = useCallback((force = false) => {
    const now = Date.now();
    if (
      refreshInFlightRef.current ||
      (!force && now - lastRefreshAtRef.current < ACTIVE_REFRESH_COOLDOWN_MS)
    ) {
      return;
    }

    lastRefreshAtRef.current = now;
    dispatch({ type: "refresh-started" });
    refreshInFlightRef.current = fetchRemoteTemplateCatalog()
      .then(async (remote) => {
        await writeCachedTemplateCatalog(remote);
        if (mountedRef.current) {
          dispatch({
            type: "remote-ready",
            templates: mergeTemplateCatalog(mobileTemplateGallery, remote.templates)
          });
        }
      })
      .catch(() => {
        if (mountedRef.current) dispatch({ type: "remote-failed" });
      })
      .finally(() => {
        refreshInFlightRef.current = null;
      });
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    void (async () => {
      const cached = await readCachedTemplateCatalog();
      if (mountedRef.current && cached) {
        dispatch({
          type: "cache-ready",
          templates: mergeTemplateCatalog(mobileTemplateGallery, cached.templates)
        });
      }
      refresh(true);
    })();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });

    return () => {
      mountedRef.current = false;
      subscription.remove();
    };
  }, [refresh]);

  const retry = useCallback(() => {
    if (state.refreshing || state.manualRetryCount >= TEMPLATE_CATALOG_MAX_MANUAL_RETRIES) return;
    dispatch({ type: "manual-retry" });
    refresh(true);
  }, [refresh, state.manualRetryCount, state.refreshing]);

  const value = useMemo<TemplateCatalogValue>(() => {
    const byId = new Map(state.templates.map((template) => [template.id, template]));
    return {
      templates: state.templates,
      findById: (templateId) => byId.get(templateId) ?? null,
      source: state.source,
      refreshing: state.refreshing,
      error: state.error,
      canRetry: !state.refreshing && state.manualRetryCount < TEMPLATE_CATALOG_MAX_MANUAL_RETRIES,
      retry
    };
  }, [retry, state]);

  return <TemplateCatalogContext.Provider value={value}>{children}</TemplateCatalogContext.Provider>;
}

export function useTemplateCatalog() {
  const value = useContext(TemplateCatalogContext);
  if (!value) {
    throw new Error("useTemplateCatalog must be used inside TemplateCatalogProvider");
  }
  return value;
}
