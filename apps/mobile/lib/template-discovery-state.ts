import { emptyTemplateDiscoveryFilters, type TemplateDiscoveryFilters } from "./template-discovery";

export type TemplateDiscoveryState = {
  filters: TemplateDiscoveryFilters;
  scrollOffset: number;
  routeCategoryInitialized: boolean;
};

export function createInitialTemplateDiscoveryState(): TemplateDiscoveryState {
  return {
    filters: { ...emptyTemplateDiscoveryFilters, moods: [] },
    scrollOffset: 0,
    routeCategoryInitialized: false
  };
}

export function initializeTemplateDiscoveryCategory(
  state: TemplateDiscoveryState,
  category: string | undefined,
  allowedCategories: ReadonlySet<string>
): TemplateDiscoveryState {
  if (state.routeCategoryInitialized) return state;
  return {
    ...state,
    routeCategoryInitialized: true,
    filters: {
      ...state.filters,
      category: category && allowedCategories.has(category) ? category : "all"
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
