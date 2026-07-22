import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const cardSource = readFileSync(join(process.cwd(), "apps/mobile/components/templates/TemplateCard.tsx"), "utf8");
const filtersSource = readFileSync(join(process.cwd(), "apps/mobile/components/templates/TemplateFilters.tsx"), "utf8");

describe("template discovery components", () => {
  it("makes the whole card one accessible 44pt preview button without router or draft ownership", () => {
    expect(cardSource).toContain('accessibilityRole="button"');
    expect(cardSource).toContain("미리보기 열기");
    expect(cardSource).toMatch(/minHeight:\s*44/);
    expect(cardSource).toContain("accessible={false}");
    expect(cardSource).not.toMatch(/useRouter|router\.|draft|createAndPersistDraft/);
  });

  it("keeps an image failure local to the card and preserves preview selection", () => {
    expect(cardSource).toContain("onError={() => setImageFailed(true)}");
    expect(cardSource).toContain("onOpenPreview(template)");
  });

  it("exposes controlled search, selected states, the required copy hierarchy, and one reset callback", () => {
    expect(filtersSource).toContain("value={filters.query}");
    expect(filtersSource).toContain("onChangeText");
    expect(filtersSource).toContain("TEMPLATE_DISCOVERY_QUERY_MAX_LENGTH");
    expect(filtersSource).toContain("maxLength={TEMPLATE_DISCOVERY_QUERY_MAX_LENGTH}");
    expect(filtersSource).toMatch(/<Text[^>]*>디자인 검색<\/Text>\s*<TextInput/);
    expect(filtersSource).toContain("행사별 디자인");
    expect(filtersSource).toContain("형식별 디자인");
    expect(filtersSource).toContain("오삼오삼 셀렉션");
    expect(filtersSource).toContain("이 디자인으로 시작하기");
    expect(filtersSource).toContain("accessibilityState={{ selected: active }}");
    expect(filtersSource).toMatch(/minHeight:\s*44/);
    expect(filtersSource).toContain("onReset()");
    expect(filtersSource).not.toContain("moods?:");
    expect(filtersSource).toContain("templateDiscoveryMoods.map");
  });
});
