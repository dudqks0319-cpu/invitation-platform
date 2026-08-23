import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { selectTemplateAndOpenBuilder } from "./template-selection";

const screenSource = readFileSync(join(process.cwd(), "apps/mobile/app/templates.tsx"), "utf8");
const filtersSource = readFileSync(
  join(process.cwd(), "apps/mobile/components/templates/TemplateFilters.tsx"),
  "utf8"
);
const homeSource = readFileSync(join(process.cwd(), "apps/mobile/app/(tabs)/index.tsx"), "utf8");

describe("template selection flow", () => {
  it("creates exactly one draft before pushing the selected card to basic editing", async () => {
    const events: string[] = [];
    const createAndPersistDraft = vi.fn(async () => {
      events.push("draft");
      return { localId: "draft-123" };
    });
    const router = {
      push: vi.fn(() => {
        events.push("push");
      })
    };

    await selectTemplateAndOpenBuilder({
      template: {
        id: "wedding-classic",
        category: "wedding",
        badge: "결혼식"
      },
      draftOwnerId: "anonymous-device",
      createAndPersistDraft,
      router
    });

    expect(createAndPersistDraft).toHaveBeenCalledTimes(1);
    expect(createAndPersistDraft).toHaveBeenCalledWith("anonymous-device", {
      templateId: "wedding-classic",
      eventType: "wedding",
      title: "결혼식 초대장"
    });
    expect(router.push).toHaveBeenCalledTimes(1);
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/builder/step1-basic",
      params: { localId: "draft-123" }
    });
    expect(events).toEqual(["draft", "push"]);
  });
});

describe("template discovery screen", () => {
  it("uses one virtualized list and keeps preview navigation separate from explicit draft creation", () => {
    expect(screenSource).toContain("FlatList");
    expect(screenSource).toContain("keyExtractor={(template) => template.id}");
    expect(screenSource).not.toContain("<ScrollView");
    expect(screenSource).toContain("createTemplatePreviewDestination(template.id)");
    expect(screenSource).toContain("createOrReuseTemplatePreviewDraft(ownerId");
    expect(screenSource).not.toMatch(/createAndPersistDraft|selectTemplateAndOpenBuilder/);
  });

  it("wires truthful recovery states, no-results reset, and debounced result announcements", () => {
    expect(screenSource).toContain("저장된 디자인을 보여드려요");
    expect(screenSource).toContain("기본 디자인 150개를 보여드려요");
    expect(screenSource).toContain("필터 초기화");
    expect(screenSource).toContain("announceForAccessibility");
    expect(screenSource).toContain('Platform.OS !== "ios"');
    expect(screenSource).toContain("최신 디자인을 확인하고 있어요");
    expect(screenSource).toContain("useDebouncedValue");
    expect(screenSource.match(/announceForAccessibility/g)).toHaveLength(1);
    expect(filtersSource).not.toContain("accessibilityLiveRegion");
    expect(screenSource.match(/accessibilityLiveRegion/g) ?? []).toHaveLength(2);
  });

  it("gives each fresh Home category entry a new non-PII discovery session key", () => {
    expect(homeSource).toContain("createTemplateDiscoveryEntryKey()");
    expect(homeSource).toContain("params: { category, entryKey }");
    expect(screenSource).toContain("entryKey");
    expect(screenSource).toContain("enterDiscovery");
  });

  it("keeps the verified reduced-motion branch and bounded fast-scroll configuration", () => {
    expect(screenSource).toContain("reduceMotionEnabled ? null : <ActivityIndicator");
    expect(screenSource).toContain("removeClippedSubviews={false}");
    expect(screenSource).toContain("maxToRenderPerBatch={8}");
    expect(screenSource).toContain("windowSize={7}");
  });

  it("renders bounded active recent designs and resets only user-initiated filter changes to the top", () => {
    expect(screenSource).toContain("loadRecentlyViewedTemplates(templates)");
    expect(screenSource).toContain("최근 본 디자인");
    expect(screenSource).toContain("ref={listRef}");
    expect(screenSource).toContain("listRef.current?.scrollToOffset({ offset: 0, animated: false })");
    expect(screenSource).toContain("onFiltersChange={changeFiltersFromUser}");
    expect(screenSource).toContain("contentOffset={{ x: 0, y: restoredScrollOffset }}");
  });
});
