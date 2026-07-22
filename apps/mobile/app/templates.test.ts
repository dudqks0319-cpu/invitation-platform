import { describe, expect, it, vi } from "vitest";
import { selectTemplateAndOpenBuilder } from "../lib/template-selection";

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
