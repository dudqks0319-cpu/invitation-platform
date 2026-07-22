import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AppState } from "react-native";
import { mobileTemplateGallery, type MobileTemplateGalleryItem } from "@/lib/template-gallery";
import {
  mergeTemplateCatalog,
  readCachedTemplateCatalog,
  refreshRemoteTemplateCatalog
} from "@/lib/remote-template-catalog";

const ACTIVE_REFRESH_COOLDOWN_MS = 5 * 60 * 1000;

type TemplateCatalogValue = {
  templates: MobileTemplateGalleryItem[];
  findById: (templateId: string) => MobileTemplateGalleryItem | null;
};

const TemplateCatalogContext = createContext<TemplateCatalogValue | null>(null);

export function TemplateCatalogProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<MobileTemplateGalleryItem[]>(mobileTemplateGallery);

  useEffect(() => {
    let mounted = true;
    let lastRefreshAt = 0;
    let lastKnownGood: Awaited<ReturnType<typeof readCachedTemplateCatalog>> = null;
    let refreshInFlight: Promise<void> | null = null;

    const refresh = (force = false) => {
      const now = Date.now();
      if (refreshInFlight || (!force && now - lastRefreshAt < ACTIVE_REFRESH_COOLDOWN_MS)) return;

      lastRefreshAt = now;
      refreshInFlight = refreshRemoteTemplateCatalog(lastKnownGood)
        .then((remote) => {
          if (!remote) return;
          lastKnownGood = remote;
          if (mounted) setTemplates(mergeTemplateCatalog(mobileTemplateGallery, remote.templates));
        })
        .finally(() => {
          refreshInFlight = null;
        });
    };

    void (async () => {
      const cached = await readCachedTemplateCatalog();
      if (mounted && cached) {
        lastKnownGood = cached;
        setTemplates(mergeTemplateCatalog(mobileTemplateGallery, cached.templates));
      }
      refresh(true);
    })();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  const value = useMemo<TemplateCatalogValue>(() => {
    const byId = new Map(templates.map((template) => [template.id, template]));
    return {
      templates,
      findById: (templateId) => byId.get(templateId) ?? null
    };
  }, [templates]);

  return <TemplateCatalogContext.Provider value={value}>{children}</TemplateCatalogContext.Provider>;
}

export function useTemplateCatalog() {
  const value = useContext(TemplateCatalogContext);
  if (!value) {
    throw new Error("useTemplateCatalog must be used inside TemplateCatalogProvider");
  }
  return value;
}
