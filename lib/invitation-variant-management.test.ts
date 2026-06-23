import {
  buildInvitationVariantInsertPayload,
  buildInvitationVariantSlug,
  invitationVariantPresets,
  normalizeVariantSlugSegment
} from "@/lib/invitation-variant-management";

describe("invitation variant management", () => {
  it("normalizes variant slug segments", () => {
    expect(normalizeVariantSlugSegment(" Kim & Lee Demo ")).toBe("kim-lee-demo");
    expect(normalizeVariantSlugSegment("친구 용!!")).toBe("친구-용");
  });

  it("builds stable variant slugs from the base invitation slug", () => {
    expect(buildInvitationVariantSlug("kim-lee-demo", "friends")).toBe("kim-lee-demo-friends");
  });

  it("builds an insert payload from a preset", () => {
    const friendsPreset = invitationVariantPresets.find((preset) => preset.audienceKey === "friends");

    expect(friendsPreset).toBeDefined();
    expect(buildInvitationVariantInsertPayload({
      invitationId: "invitation-1",
      baseSlug: "kim-lee-demo",
      preset: friendsPreset!
    })).toEqual({
      invitation_id: "invitation-1",
      audience_key: "friends",
      audience_label: "친구용",
      slug: "kim-lee-demo-friends",
      payload_patch: {
        message: "편하게 와서 함께 축하해 주세요."
      },
      section_patch: {
        accounts: false
      },
      status: "active"
    });
  });
});
