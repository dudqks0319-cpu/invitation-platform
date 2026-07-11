import { describe, expect, it } from "vitest";
import { resolvePreviewPayload } from "@/components/invitations/invitation-preview-page";
import { defaultInvitationDraft } from "@/lib/invitation-payload";

describe("resolvePreviewPayload", () => {
  it("shows the exact home template while preserving the invitation content", () => {
    const result = resolvePreviewPayload(
      {
        ...defaultInvitationDraft,
        title: "우리의 초대"
      },
      "wedding-barunson-anime-04"
    );

    expect(result.templateId).toBe("wedding-barunson-anime-04");
    expect(result.category).toBe("wedding");
    expect(result.templateTextPlacement).toBe("bottom");
    expect(result.title).toBe("우리의 초대");
  });

  it("keeps the current draft when the template id is invalid", () => {
    const result = resolvePreviewPayload(defaultInvitationDraft, "missing-template");

    expect(result.templateId).toBe(defaultInvitationDraft.templateId);
  });

  it("centers invitation copy for artwork with a clear central text area", () => {
    const result = resolvePreviewPayload(defaultInvitationDraft, "wedding-rose-gold");

    expect(result.templateId).toBe("wedding-rose-gold");
    expect(result.templateTextPlacement).toBe("center");
  });
});
