import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { selectTemplateAndOpenBuilder } from "../lib/template-selection";

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
  it("uses one virtualized list with stable IDs and no draft mutation", () => {
    expect(screenSource).toContain("FlatList");
    expect(screenSource).toContain("keyExtractor={(template) => template.id}");
    expect(screenSource).not.toContain("<ScrollView");
    expect(screenSource).not.toMatch(/createAndPersistDraft|selectTemplateAndOpenBuilder/);
  });

  it("wires truthful recovery states, no-results reset, and debounced result announcements", () => {
    expect(screenSource).toContain("저장된 디자인을 보여드려요");
    expect(screenSource).toContain("기본 디자인 150개를 보여드려요");
    expect(screenSource).toContain("필터 초기화");
    expect(screenSource).toContain("announceForAccessibility");
    expect(screenSource).toContain("useDebouncedValue");
    expect(screenSource.match(/announceForAccessibility/g)).toHaveLength(1);
    expect(filtersSource).not.toContain("accessibilityLiveRegion");
    expect(screenSource.match(/accessibilityLiveRegion/g) ?? []).toHaveLength(1);
  });

  it("gives each fresh Home category entry a new non-PII discovery session key", () => {
    expect(homeSource).toContain("createTemplateDiscoveryEntryKey()");
    expect(homeSource).toContain("params: { category, entryKey }");
    expect(screenSource).toContain("entryKey");
    expect(screenSource).toContain("enterDiscovery");
  });
});
