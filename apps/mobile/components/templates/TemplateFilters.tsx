import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { MobileTemplateCategory } from "@/lib/template-gallery";
import {
  getTemplateDiscoveryActiveFilterSummary,
  TEMPLATE_DISCOVERY_QUERY_MAX_LENGTH,
  templateDiscoveryMoods,
  type TemplateDiscoveryFilters
} from "@/lib/template-discovery";
import { theme } from "@/components/ui/theme";

type TemplateFiltersProps = {
  filters: TemplateDiscoveryFilters;
  categories: readonly MobileTemplateCategory[];
  onFiltersChange: (filters: TemplateDiscoveryFilters) => void;
  onReset: () => void;
};

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityHint="디자인 결과에 이 필터를 적용하거나 해제합니다."
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 44,
        justifyContent: "center",
        borderRadius: theme.radius.pill,
        borderWidth: active ? 2 : 1,
        borderColor: active ? theme.colors.primaryDark : theme.colors.border,
        backgroundColor: active ? theme.colors.primaryLight : theme.colors.surface,
        paddingHorizontal: 14,
        opacity: pressed ? 0.82 : 1
      })}
    >
      <Text style={{ color: theme.colors.ink, fontSize: 13, fontWeight: active ? "800" : "700" }}>
        {active ? `✓ ${label}` : label}
      </Text>
    </Pressable>
  );
}

export function TemplateFilters({ filters, categories, onFiltersChange, onReset }: TemplateFiltersProps) {
  const summary = getTemplateDiscoveryActiveFilterSummary(filters, categories);

  function toggleMood(moodKey: string) {
    const selected = filters.moods.includes(moodKey);
    onFiltersChange({
      ...filters,
      moods: selected ? filters.moods.filter((key) => key !== moodKey) : [...filters.moods, moodKey]
    });
  }

  return (
    <View style={{ gap: 14 }}>
      <Text style={{ color: theme.colors.ink, fontSize: 16, fontWeight: "800" }}>디자인 검색</Text>
      <TextInput
        accessibilityHint="이름, 행사, 설명, 태그 또는 행사별 디자인으로 검색합니다."
        accessibilityLabel="디자인 검색"
        maxLength={TEMPLATE_DISCOVERY_QUERY_MAX_LENGTH}
        onChangeText={(query) => onFiltersChange({ ...filters, query })}
        placeholder="디자인을 검색해 보세요"
        placeholderTextColor={theme.colors.muted}
        returnKeyType="search"
        style={{ minHeight: 44, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface, color: theme.colors.text, fontSize: 16, paddingHorizontal: 14, paddingVertical: 10 }}
        value={filters.query}
      />

      <View style={{ gap: 8 }}>
        <Text style={{ color: theme.colors.ink, fontSize: 16, fontWeight: "800" }}>행사별 디자인</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <FilterChip label="전체" active={filters.category === "all"} onPress={() => onFiltersChange({ ...filters, category: "all" })} />
          {categories.map((category) => (
            <FilterChip key={category.key} label={category.label} active={filters.category === category.key} onPress={() => onFiltersChange({ ...filters, category: category.key })} />
          ))}
        </ScrollView>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: theme.colors.ink, fontSize: 16, fontWeight: "800" }}>형식별 디자인</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {templateDiscoveryMoods.map((mood) => <FilterChip key={mood.key} label={mood.label} active={filters.moods.includes(mood.key)} onPress={() => toggleMood(mood.key)} />)}
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Text style={{ flex: 1, color: theme.colors.muted, fontSize: 13, lineHeight: 19 }}>
          오삼오삼 셀렉션 · {summary} · 이 디자인으로 시작하기
        </Text>
        <Pressable
          accessibilityLabel="전체 필터 초기화"
          accessibilityHint="행사, 형식, 검색어 필터를 모두 지웁니다."
          accessibilityRole="button"
          onPress={() => onReset()}
          style={({ pressed }) => ({ minHeight: 44, justifyContent: "center", paddingHorizontal: 10, opacity: pressed ? 0.78 : 1 })}
        >
          <Text style={{ color: theme.colors.ink, fontSize: 13, fontWeight: "800" }}>초기화</Text>
        </Pressable>
      </View>
    </View>
  );
}
