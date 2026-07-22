import { emptyTemplateDiscoveryFilters, type TemplateDiscoveryFilters } from "./template-discovery";

export type TemplateDiscoveryState = {
  filters: TemplateDiscoveryFilters;
  scrollOffset: number;
  entryKey: string | null;
};

export function createInitialTemplateDiscoveryState(): TemplateDiscoveryState {
  return {
    filters: { ...emptyTemplateDiscoveryFilters, moods: [] },
    scrollOffset: 0,
    entryKey: null
  };
}

export function normalizeTemplateDiscoveryEntryKey(entryKey: string | undefined) {
  return entryKey && /^[a-z0-9-]{1,80}$/.test(entryKey)
    ? entryKey
    : "templates-entry-legacy";
}

export function enterTemplateDiscovery(
  state: TemplateDiscoveryState,
  entry: { entryKey: string | undefined; category: string | undefined },
  allowedCategories: ReadonlySet<string>
): TemplateDiscoveryState {
  const entryKey = normalizeTemplateDiscoveryEntryKey(entry.entryKey);
  if (state.entryKey === entryKey) return state;

  return {
    entryKey,
    scrollOffset: 0,
    filters: {
      ...emptyTemplateDiscoveryFilters,
      moods: [],
      category: entry.category && allowedCategories.has(entry.category) ? entry.category : "all"
    }
  };
}

export function updateTemplateDiscoveryScrollOffset(
  state: TemplateDiscoveryState,
  scrollOffset: number
): TemplateDiscoveryState {
  return {
    ...state,
    scrollOffset: Number.isFinite(scrollOffset) ? Math.max(0, scrollOffset) : 0
  };
}
