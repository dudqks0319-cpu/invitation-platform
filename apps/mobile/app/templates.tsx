import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import {
  AccessibilityInfo,
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent
} from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { SafeAreaView } from "react-native-safe-area-context";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { TemplateFilters } from "@/components/templates/TemplateFilters";
import { theme } from "@/components/ui/theme";
import { useTemplateCatalog } from "@/hooks/useTemplateCatalog";
import { useTemplateDiscoveryState } from "@/hooks/useTemplateDiscoveryState";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  emptyTemplateDiscoveryFilters,
  filterTemplateDiscoveryItems,
  getTemplateDiscoveryActiveFilterSummary,
  type TemplateDiscoveryFilters
} from "@/lib/template-discovery";
import {
  getTemplateDiscoveryCardWidth,
  getTemplateDiscoveryColumnCount,
  TEMPLATE_DISCOVERY_COLUMN_GAP,
  TEMPLATE_DISCOVERY_HORIZONTAL_INSET
} from "@/lib/template-discovery-layout";
import { createTemplatePreviewDestination } from "@/lib/template-discovery-navigation";
import { normalizeTemplateDiscoveryEntryKey } from "@/lib/template-discovery-state";
import {
  mobileTemplateCategories,
  sortMobileTemplatesForDisplay,
  type MobileTemplateGalleryItem
} from "@/lib/template-gallery";
import { loadRecentlyViewedTemplates } from "@/lib/template-preview-recent";
import {
  createTemplateResultAnnouncer,
  scheduleTemplateResultCommit,
  TEMPLATE_RESULT_COMMIT_DELAY_MS
} from "@/lib/template-result-announcement";

const allowedCategoryKeys = new Set(mobileTemplateCategories.map((category) => category.key));

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    return scheduleTemplateResultCommit(value, setDebouncedValue, delayMs);
  }, [delayMs, value]);

  return debouncedValue;
}

function CatalogStatus({
  source,
  refreshing,
  error,
  canRetry,
  reduceMotionEnabled,
  onRetry
}: {
  source: "loading" | "remote" | "cache" | "bundled-fallback";
  refreshing: boolean;
  error: string | null;
  canRetry: boolean;
  reduceMotionEnabled: boolean;
  onRetry: () => void;
}) {
  if (source === "loading") return null;

  const sourceCopy = source === "cache"
    ? "저장된 디자인을 보여드려요"
    : source === "bundled-fallback"
      ? "기본 디자인 150개를 보여드려요"
      : null;

  if (!sourceCopy && !refreshing && !error) return null;

  return (
    <View
      accessibilityLiveRegion={error ? "assertive" : "polite"}
      style={{
        gap: 8,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        padding: 14
      }}
    >
      {sourceCopy ? (
        <Text style={{ color: theme.colors.ink, fontSize: 14, fontWeight: "800" }}>{sourceCopy}</Text>
      ) : null}
      {refreshing ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {reduceMotionEnabled ? null : <ActivityIndicator color={theme.colors.primaryDark} size="small" />}
          <Text style={{ color: theme.colors.muted, fontSize: 13 }}>최신 디자인을 확인하고 있어요</Text>
        </View>
      ) : null}
      {error ? (
        <View style={{ gap: 8 }}>
          <Text style={{ color: theme.colors.muted, fontSize: 13, lineHeight: 19 }}>
            {error} {canRetry ? "현재 목록을 보면서 다시 시도할 수 있어요." : "현재 목록은 계속 둘러볼 수 있어요."}
          </Text>
          {canRetry ? (
            <Pressable
              accessibilityHint="최신 디자인 목록을 다시 확인합니다."
              accessibilityLabel="최신 디자인 다시 시도"
              accessibilityRole="button"
              onPress={onRetry}
              style={({ pressed }) => ({
                alignSelf: "flex-start",
                minHeight: 44,
                justifyContent: "center",
                paddingHorizontal: 10,
                opacity: pressed ? 0.76 : 1
              })}
            >
              <Text style={{ color: theme.colors.ink, fontSize: 14, fontWeight: "800" }}>다시 시도</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export default function TemplatesScreen() {
  const router = useRouter();
  const { category: initialCategoryParam, entryKey: entryKeyParam } = useLocalSearchParams<{
    category?: string | string[];
    entryKey?: string | string[];
  }>();
  const { templates, source, refreshing, error, canRetry, retry } = useTemplateCatalog();
  const {
    filters,
    scrollOffset,
    entryKey: activeEntryKey,
    enterDiscovery,
    setFilters,
    setScrollOffset
  } = useTemplateDiscoveryState();
  const { width, fontScale } = useWindowDimensions();
  const reduceMotionEnabled = useReducedMotion();
  const [listWidth, setListWidth] = useState(width);
  const [recentTemplates, setRecentTemplates] = useState<MobileTemplateGalleryItem[]>([]);
  const listRef = useRef<FlatList<MobileTemplateGalleryItem>>(null);
  const currentScrollOffsetRef = useRef(scrollOffset);
  const announcedOnceRef = useRef(false);
  const announceAccessibility = useCallback((message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  }, []);
  const resultAnnouncer = useMemo(() => createTemplateResultAnnouncer(announceAccessibility), [announceAccessibility]);
  const statusAnnouncer = useMemo(() => createTemplateResultAnnouncer(announceAccessibility), [announceAccessibility]);
  const initialCategory = Array.isArray(initialCategoryParam) ? initialCategoryParam[0] : initialCategoryParam;
  const entryKey = Array.isArray(entryKeyParam) ? entryKeyParam[0] : entryKeyParam;
  const normalizedEntryKey = normalizeTemplateDiscoveryEntryKey(entryKey);
  const restoredScrollOffset = activeEntryKey === normalizedEntryKey ? scrollOffset : 0;
  const debouncedQuery = useDebouncedValue(filters.query, TEMPLATE_RESULT_COMMIT_DELAY_MS);
  const committedFilters = useMemo(
    () => ({ category: filters.category, moods: filters.moods, query: debouncedQuery }),
    [debouncedQuery, filters.category, filters.moods]
  );
  const filteredTemplates = useMemo(
    () => sortMobileTemplatesForDisplay(
      filterTemplateDiscoveryItems(templates, committedFilters, mobileTemplateCategories)
    ),
    [committedFilters, templates]
  );
  const activeFilterSummary = getTemplateDiscoveryActiveFilterSummary(committedFilters, mobileTemplateCategories);
  const activeCategory = mobileTemplateCategories.find((category) => category.key === committedFilters.category);
  const discoveryTitle = activeCategory ? `${activeCategory.label} 디자인` : "디자인 둘러보기";
  const discoveryDescription = activeCategory
    ? `${activeCategory.label}에 어울리는 기존 템플릿을 먼저 미리보고 시작하세요.`
    : "행사와 분위기에 맞는 예시 디자인을 찾고, 카드를 눌러 먼저 미리보세요.";
  const columnCount = getTemplateDiscoveryColumnCount(fontScale);
  const cardWidth = getTemplateDiscoveryCardWidth(listWidth, fontScale);
  const resultsAreReady = source !== "loading";

  useEffect(() => {
    enterDiscovery({ entryKey, category: initialCategory }, allowedCategoryKeys);
  }, [enterDiscovery, entryKey, initialCategory]);

  useFocusEffect(useCallback(() => {
    let active = true;
    if (source === "loading") {
      setRecentTemplates([]);
      return () => {
        active = false;
      };
    }

    void loadRecentlyViewedTemplates(templates).then((recent) => {
      if (active) setRecentTemplates(recent);
    });
    return () => {
      active = false;
    };
  }, [source, templates]));

  useEffect(() => {
    currentScrollOffsetRef.current = restoredScrollOffset;
  }, [restoredScrollOffset]);

  useEffect(() => {
    if (!resultsAreReady) return;
    if (!announcedOnceRef.current) {
      announcedOnceRef.current = true;
      return;
    }

    resultAnnouncer.schedule(`${activeFilterSummary}, 디자인 ${filteredTemplates.length}개`);
    return () => resultAnnouncer.cancel();
  }, [activeFilterSummary, filteredTemplates.length, resultAnnouncer, resultsAreReady]);

  useEffect(() => {
    if (Platform.OS !== "ios") return;
    const message = source === "loading"
      ? "디자인을 불러오고 있어요"
      : error ?? (refreshing ? "최신 디자인을 확인하고 있어요" : null);
    if (!message) return;

    statusAnnouncer.schedule(message);
    return () => statusAnnouncer.cancel();
  }, [error, refreshing, source, statusAnnouncer]);

  const handleBack = useCallback(() => {
    setScrollOffset(currentScrollOffsetRef.current);
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/");
  }, [router, setScrollOffset]);

  const handleOpenPreview = useCallback((template: MobileTemplateGalleryItem) => {
    const destination = createTemplatePreviewDestination(template.id);
    if (!destination) return;
    setScrollOffset(currentScrollOffsetRef.current);
    router.push(destination);
  }, [router, setScrollOffset]);

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    currentScrollOffsetRef.current = Math.max(0, event.nativeEvent.contentOffset.y);
  }

  function commitScrollOffset() {
    setScrollOffset(currentScrollOffsetRef.current);
  }

  function changeFiltersFromUser(nextFilters: TemplateDiscoveryFilters) {
    currentScrollOffsetRef.current = 0;
    setScrollOffset(0);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
    setFilters(nextFilters);
  }

  function resetFilters() {
    changeFiltersFromUser({ ...emptyTemplateDiscoveryFilters, moods: [] });
  }

  const listHeader = (
    <View style={{ gap: 18, paddingBottom: 20 }}>
      <View style={{ minHeight: 68, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 }}>
        <Pressable
          accessibilityLabel="뒤로가기"
          accessibilityHint="이전 화면으로 돌아갑니다."
          accessibilityRole="button"
          onPress={handleBack}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.colors.surface,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: theme.colors.border,
            opacity: pressed ? 0.78 : 1
          })}
        >
          <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "700" }}>‹</Text>
        </Pressable>
        <Text style={{ flexShrink: 1, color: theme.colors.text, fontSize: 24, fontWeight: "800", textAlign: "center" }}>
          {discoveryTitle}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 24 }}>
        {discoveryDescription}
      </Text>

      <CatalogStatus
        source={source}
        refreshing={refreshing}
        error={error}
        canRetry={canRetry}
        reduceMotionEnabled={reduceMotionEnabled}
        onRetry={retry}
      />

      {recentTemplates.length > 0 ? (
        <View accessibilityLabel={`최근 본 디자인 ${recentTemplates.length}개`} style={{ gap: 12 }}>
          <Text style={{ color: theme.colors.ink, fontSize: 18, fontWeight: "800" }}>최근 본 디자인</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: TEMPLATE_DISCOVERY_COLUMN_GAP }}>
            {recentTemplates.map((template) => (
              <TemplateCard key={`recent-${template.id}`} template={template} onOpenPreview={handleOpenPreview} width={cardWidth} />
            ))}
          </View>
        </View>
      ) : null}

      <TemplateFilters
        categories={mobileTemplateCategories}
        filters={filters}
        onFiltersChange={changeFiltersFromUser}
        onReset={resetFilters}
      />

      <Text style={{ color: theme.colors.ink, fontSize: 15, fontWeight: "800" }}>
        디자인 {source === "loading" ? "불러오는 중" : `${filteredTemplates.length}개`}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        ref={listRef}
        key={`template-grid-${columnCount}-${normalizedEntryKey}`}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: TEMPLATE_DISCOVERY_HORIZONTAL_INSET,
          paddingBottom: 36
        }}
        contentOffset={{ x: 0, y: restoredScrollOffset }}
        columnWrapperStyle={columnCount === 2 ? { gap: TEMPLATE_DISCOVERY_COLUMN_GAP } : undefined}
        data={source === "loading" ? [] : filteredTemplates}
        initialNumToRender={8}
        ItemSeparatorComponent={() => <View style={{ height: TEMPLATE_DISCOVERY_COLUMN_GAP }} />}
        keyExtractor={(template) => template.id}
        ListEmptyComponent={
          source === "loading" ? (
            <View
              accessibilityLabel="디자인을 불러오고 있어요"
              accessibilityRole="progressbar"
              accessibilityState={{ busy: true }}
              style={{ minHeight: 220, alignItems: "center", justifyContent: "center", gap: 12 }}
            >
              {reduceMotionEnabled ? null : <ActivityIndicator color={theme.colors.primaryDark} />}
              <Text style={{ color: theme.colors.muted, fontSize: 14 }}>디자인을 불러오고 있어요</Text>
            </View>
          ) : (
            <View style={{ minHeight: 220, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 20 }}>
              <Text style={{ color: theme.colors.ink, fontSize: 18, fontWeight: "800", textAlign: "center" }}>
                조건에 맞는 디자인이 없어요
              </Text>
              <Text style={{ color: theme.colors.muted, fontSize: 14, lineHeight: 21, textAlign: "center" }}>
                적용된 필터: {activeFilterSummary}
              </Text>
              <Pressable
                accessibilityLabel="필터 초기화"
                accessibilityHint="모든 검색 조건을 지우고 전체 디자인을 표시합니다."
                accessibilityRole="button"
                onPress={resetFilters}
                style={({ pressed }) => ({
                  minHeight: 44,
                  justifyContent: "center",
                  borderRadius: theme.radius.pill,
                  backgroundColor: theme.colors.primaryLight,
                  paddingHorizontal: 18,
                  opacity: pressed ? 0.78 : 1
                })}
              >
                <Text style={{ color: theme.colors.ink, fontSize: 14, fontWeight: "800" }}>필터 초기화</Text>
              </Pressable>
            </View>
          )
        }
        ListHeaderComponent={listHeader}
        maxToRenderPerBatch={8}
        numColumns={columnCount}
        onLayout={(event) => setListWidth(event.nativeEvent.layout.width)}
        onMomentumScrollEnd={commitScrollOffset}
        onScroll={handleScroll}
        onScrollEndDrag={commitScrollOffset}
        removeClippedSubviews={false}
        renderItem={({ item }) => (
          <TemplateCard template={item} onOpenPreview={handleOpenPreview} width={cardWidth} />
        )}
        scrollEventThrottle={100}
        showsVerticalScrollIndicator={false}
        windowSize={7}
      />
    </SafeAreaView>
  );
}
