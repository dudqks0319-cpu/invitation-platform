import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const templatesScreenSource = readFileSync(join(process.cwd(), "apps/mobile/app/templates.tsx"), "utf8");

describe("template selection flow", () => {
  it("creates a local draft before navigating the selected card to basic editing", () => {
    expect(templatesScreenSource).toContain('import { createAndPersistDraft } from "@/lib/drafts";');
    expect(templatesScreenSource).toContain("const draft = await createAndPersistDraft(draftOwnerId, {");
    expect(templatesScreenSource).toContain("templateId: template.id,");
    expect(templatesScreenSource).toContain("eventType: template.category,");
    expect(templatesScreenSource).toContain('router.push({ pathname: "/builder/step1-basic", params: { localId: draft.localId } });');
    expect(templatesScreenSource).toContain("onPress={() => void handleUseTemplate(template)}");
  });
});
