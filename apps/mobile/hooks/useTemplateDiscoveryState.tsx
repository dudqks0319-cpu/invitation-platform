import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { TemplateDiscoveryFilters } from "@/lib/template-discovery";
import {
  createInitialTemplateDiscoveryState,
  enterTemplateDiscovery,
  updateTemplateDiscoveryScrollOffset
} from "@/lib/template-discovery-state";

type TemplateDiscoveryStateValue = {
  filters: TemplateDiscoveryFilters;
  scrollOffset: number;
  entryKey: string | null;
  enterDiscovery: (
    entry: { entryKey: string | undefined; category: string | undefined },
    allowedCategories: ReadonlySet<string>
  ) => void;
  setFilters: (filters: TemplateDiscoveryFilters) => void;
  setScrollOffset: (scrollOffset: number) => void;
};

const TemplateDiscoveryStateContext = createContext<TemplateDiscoveryStateValue | null>(null);

export function TemplateDiscoveryStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(createInitialTemplateDiscoveryState);
  const enterDiscovery = useCallback<TemplateDiscoveryStateValue["enterDiscovery"]>(
    (entry, allowedCategories) =>
      setState((current) => enterTemplateDiscovery(current, entry, allowedCategories)),
    []
  );
  const setFilters = useCallback((filters: TemplateDiscoveryFilters) => {
    setState((current) => ({ ...current, filters }));
  }, []);
  const setScrollOffset = useCallback((scrollOffset: number) => {
    setState((current) => updateTemplateDiscoveryScrollOffset(current, scrollOffset));
  }, []);
  const value = useMemo<TemplateDiscoveryStateValue>(
    () => ({
      filters: state.filters,
      scrollOffset: state.scrollOffset,
      entryKey: state.entryKey,
      enterDiscovery,
      setFilters,
      setScrollOffset
    }),
    [enterDiscovery, setFilters, setScrollOffset, state.entryKey, state.filters, state.scrollOffset]
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
