import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("my invitations account scoping", () => {
  it("uses the active draft owner for local list and deletion", () => {
    const source = readFileSync(
      join(process.cwd(), "apps/mobile/app/(tabs)/my-invitations.tsx"),
      "utf8"
    );

    expect(source).toContain("const ownerId = getDraftOwnerId(user)");
    expect(source).toContain("listDrafts(ownerId)");
    expect(source).toContain("deleteDraft(draft.localId, ownerId)");
  });

  it("switches builder draft ownership to the authenticated account", () => {
    const source = readFileSync(
      join(process.cwd(), "apps/mobile/hooks/useInvitationDraft.ts"),
      "utf8"
    );

    expect(source).toContain('status === "authenticated" ? getDraftOwnerId(user) : ownerId');
    expect(source).toContain("ensureDraft(activeOwnerId, localId)");
    expect(source).toContain('if (status === "loading")');
  });
});
