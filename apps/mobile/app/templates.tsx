import { useEffect, useMemo, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AccessibilityInfo,
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { TemplateFilters } from "@/components/templates/TemplateFilters";
import { theme } from "@/components/ui/theme";
import { useTemplateCatalog } from "@/hooks/useTemplateCatalog";
import { useTemplateDiscoveryState } from "@/hooks/useTemplateDiscoveryState";
import {
  emptyTemplateDiscoveryFilters,
  filterTemplateDiscoveryItems,
  getTemplateDiscoveryActiveFilterSummary
} from "@/lib/template-discovery";
import {
  getTemplateDiscoveryCardWidth,
  getTemplateDiscoveryColumnCount,
  TEMPLATE_DISCOVERY_COLUMN_GAP,
  TEMPLATE_DISCOVERY_HORIZONTAL_INSET
} from "@/lib/template-discovery-layout";
import { createTemplatePreviewDestination } from "@/lib/template-discovery-navigation";
import { mobileTemplateCategories, type MobileTemplateGalleryItem } from "@/lib/template-gallery";

const RESULT_COMMIT_DELAY_MS = 300;
const RESULT_ANNOUNCEMENT_DELAY_MS = 350;
const allowedCategoryKeys = new Set(mobileTemplateCategories.map((category) => category.key));

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timeout);
  }, [delayMs, value]);

  return debouncedValue;
}

function CatalogStatus({
  source,
  refreshing,
  error,
  canRetry,
  onRetry
}: {
  source: "loading" | "remote" | "cache" | "bundled-fallback";
  refreshing: boolean;
  error: string | null;
  canRetry: boolean;
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
      accessibilityLiveRegion="polite"
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
          <ActivityIndicator color={theme.colors.primaryDark} size="small" />
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
              <Text style={{ color: theme.colors.primaryDark, fontSize: 14, fontWeight: "800" }}>다시 시도</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export default function TemplatesScreen() {
  const router = useRouter();
  const { category: initialCategoryParam } = useLocalSearchParams<{ category?: string | string[] }>();
  const { templates, source, refreshing, error, canRetry, retry } = useTemplateCatalog();
  const { filters, scrollOffset, initializeCategory, setFilters, setScrollOffset } = useTemplateDiscoveryState();
  const { width, fontScale } = useWindowDimensions();
  const [listWidth, setListWidth] = useState(width);
  const currentScrollOffsetRef = useRef(scrollOffset);
  const announcedOnceRef = useRef(false);
  const initialCategory = Array.isArray(initialCategoryParam) ? initialCategoryParam[0] : initialCategoryParam;
  const debouncedQuery = useDebouncedValue(filters.query, RESULT_COMMIT_DELAY_MS);
  const committedFilters = useMemo(
    () => ({ category: filters.category, moods: filters.moods, query: debouncedQuery }),
    [debouncedQuery, filters.category, filters.moods]
  );
  const filteredTemplates = useMemo(
    () => filterTemplateDiscoveryItems(templates, committedFilters, mobileTemplateCategories),
    [committedFilters, templates]
  );
  const activeFilterSummary = getTemplateDiscoveryActiveFilterSummary(committedFilters, mobileTemplateCategories);
  const columnCount = getTemplateDiscoveryColumnCount(fontScale);
  const cardWidth = getTemplateDiscoveryCardWidth(listWidth, fontScale);

  useEffect(() => {
    initializeCategory(initialCategory, allowedCategoryKeys);
  }, [initialCategory, initializeCategory]);

  useEffect(() => {
    if (source === "loading") return;
    if (!announcedOnceRef.current) {
      announcedOnceRef.current = true;
      return;
    }

    const timeout = setTimeout(() => {
      AccessibilityInfo.announceForAccessibility(
        `${activeFilterSummary}, 디자인 ${filteredTemplates.length}개`
      );
    }, RESULT_ANNOUNCEMENT_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [activeFilterSummary, filteredTemplates.length, source]);

  function handleBack() {
    setScrollOffset(currentScrollOffsetRef.current);
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/");
  }

  function handleOpenPreview(template: MobileTemplateGalleryItem) {
    const destination = createTemplatePreviewDestination(template.id);
    if (!destination) return;
    setScrollOffset(currentScrollOffsetRef.current);
    router.push(destination);
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    currentScrollOffsetRef.current = Math.max(0, event.nativeEvent.contentOffset.y);
  }

  function commitScrollOffset() {
    setScrollOffset(currentScrollOffsetRef.current);
  }

  function resetFilters() {
    setFilters({ ...emptyTemplateDiscoveryFilters, moods: [] });
  }

  const listHeader = (
    <View style={{ gap: 18, paddingBottom: 20 }}>
      <View style={{ height: 68, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Pressable
          accessibilityLabel="뒤로가기"
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
          디자인 둘러보기
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 24 }}>
        행사와 분위기에 맞는 예시 디자인을 찾고, 카드를 눌러 먼저 미리보세요.
      </Text>

      <CatalogStatus source={source} refreshing={refreshing} error={error} canRetry={canRetry} onRetry={retry} />

      <TemplateFilters
        categories={mobileTemplateCategories}
        filters={filters}
        onFiltersChange={setFilters}
        onReset={resetFilters}
      />

      <Text accessibilityLiveRegion="polite" style={{ color: theme.colors.ink, fontSize: 15, fontWeight: "800" }}>
        디자인 {source === "loading" ? "불러오는 중" : `${filteredTemplates.length}개`}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        key={`template-grid-${columnCount}`}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: TEMPLATE_DISCOVERY_HORIZONTAL_INSET,
          paddingBottom: 36
        }}
        contentOffset={{ x: 0, y: scrollOffset }}
        columnWrapperStyle={columnCount === 2 ? { gap: TEMPLATE_DISCOVERY_COLUMN_GAP } : undefined}
        data={source === "loading" ? [] : filteredTemplates}
        initialNumToRender={8}
        ItemSeparatorComponent={() => <View style={{ height: TEMPLATE_DISCOVERY_COLUMN_GAP }} />}
        keyExtractor={(template) => template.id}
        ListEmptyComponent={
          source === "loading" ? (
            <View accessibilityRole="progressbar" style={{ minHeight: 220, alignItems: "center", justifyContent: "center", gap: 12 }}>
              <ActivityIndicator color={theme.colors.primaryDark} />
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
                <Text style={{ color: theme.colors.primaryDark, fontSize: 14, fontWeight: "800" }}>필터 초기화</Text>
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
        removeClippedSubviews
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
