import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { TemplateDiscoveryFilters } from "@/lib/template-discovery";
import {
  createInitialTemplateDiscoveryState,
  initializeTemplateDiscoveryCategory,
  updateTemplateDiscoveryScrollOffset
} from "@/lib/template-discovery-state";

type TemplateDiscoveryStateValue = {
  filters: TemplateDiscoveryFilters;
  scrollOffset: number;
  initializeCategory: (category: string | undefined, allowedCategories: ReadonlySet<string>) => void;
  setFilters: (filters: TemplateDiscoveryFilters) => void;
  setScrollOffset: (scrollOffset: number) => void;
};

const TemplateDiscoveryStateContext = createContext<TemplateDiscoveryStateValue | null>(null);

export function TemplateDiscoveryStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(createInitialTemplateDiscoveryState);
  const value = useMemo<TemplateDiscoveryStateValue>(
    () => ({
      filters: state.filters,
      scrollOffset: state.scrollOffset,
      initializeCategory: (category, allowedCategories) =>
        setState((current) => initializeTemplateDiscoveryCategory(current, category, allowedCategories)),
      setFilters: (filters) => setState((current) => ({ ...current, filters })),
      setScrollOffset: (scrollOffset) =>
        setState((current) => updateTemplateDiscoveryScrollOffset(current, scrollOffset))
    }),
    [state.filters, state.scrollOffset]
  );

  return (
    <TemplateDiscoveryStateContext.Provider value={value}>
      {children}
    </TemplateDiscoveryStateContext.Provider>
  );
}

export function useTemplateDiscoveryState() {
  const value = useContext(TemplateDiscoveryStateContext);
  if (!value) {
    throw new Error("useTemplateDiscoveryState must be used inside TemplateDiscoveryStateProvider");
  }
  return value;
}
