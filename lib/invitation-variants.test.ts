import {
  applyInvitationVariant,
  type InvitationVariantRow,
  type PublishedInvitationRow,
  resolvePublishedInvitationBySlug
} from "@/lib/invitation-variants";

const baseInvitation: PublishedInvitationRow = {
  id: "invitation-1",
  slug: "kim-lee",
  title: "김 & 이 결혼식",
  category: "wedding",
  template_id: "wedding-classic",
  status: "published",
  published_at: "2026-04-12T00:00:00.000Z",
  payload: {
    title: "김 & 이 결혼식",
    message: "저희 결혼식에 초대합니다.",
    eventDateTime: "2026-04-12T14:00",
    sections: {
      rsvp: true,
      accounts: true
    }
  }
};

const friendVariant: InvitationVariantRow = {
  id: "variant-1",
  invitation_id: "invitation-1",
  audience_key: "friends",
  audience_label: "친구용",
  slug: "kim-lee-friends",
  payload_patch: {
    message: "친구들아 편하게 와줘.",
    share: {
      kakaoTitle: "친구용 초대장"
    }
  },
  section_patch: {
    accounts: false
  },
  share_image_path: null,
  qr_image_path: null,
  is_default: false,
  status: "active",
  created_at: "2026-04-01T00:00:00.000Z",
  updated_at: "2026-04-01T00:00:00.000Z"
};

type LookupFixtures = {
  invitationBySlug?: PublishedInvitationRow | null;
  invitationById?: PublishedInvitationRow | null;
  variantBySlug?: InvitationVariantRow | null;
};

class FakeSingleQuery {
  private readonly filters: Record<string, string> = {};

  constructor(
    private readonly table: string,
    private readonly fixtures: LookupFixtures
  ) {}

  select() {
    return this;
  }

  eq(column: string, value: string) {
    this.filters[column] = value;
    return this;
  }

  async maybeSingle() {
    if (this.table === "invitations" && this.filters.slug) {
      return {
        data: this.fixtures.invitationBySlug ?? null,
        error: null
      };
    }

    if (this.table === "invitations" && this.filters.id) {
      return {
        data: this.fixtures.invitationById ?? null,
        error: null
      };
    }

    if (this.table === "invitation_variants" && this.filters.status === "active") {
      return {
        data: this.fixtures.variantBySlug ?? null,
        error: null
      };
    }

    return {
      data: null,
      error: null
    };
  }
}

function createLookupClient(fixtures: LookupFixtures) {
  return {
    from(table: string) {
      return new FakeSingleQuery(table, fixtures);
    }
  };
}

describe("invitation variants", () => {
  it("returns the base invitation when the requested slug belongs to the invitation", async () => {
    const lookup = await resolvePublishedInvitationBySlug(createLookupClient({
      invitationBySlug: baseInvitation
    }), "kim-lee");

    expect(lookup?.variant).toBeNull();
    expect(lookup?.publicSlug).toBe("kim-lee");
    expect(lookup?.payload.message).toBe("저희 결혼식에 초대합니다.");
  });

  it("applies variant payload patches, section patches, and audience metadata", () => {
    const payload = applyInvitationVariant(baseInvitation, friendVariant);

    expect(payload.message).toBe("친구들아 편하게 와줘.");
    expect(payload.eventDateTime).toBe("2026-04-12T14:00");
    expect(payload.sections.accounts.enabled).toBe(false);
    expect(payload.audience).toEqual({
      variantId: "variant-1",
      audienceKey: "friends",
      label: "친구용",
      slug: "kim-lee-friends"
    });
  });

  it("resolves a variant slug through the variant row and parent invitation", async () => {
    const lookup = await resolvePublishedInvitationBySlug(createLookupClient({
      invitationBySlug: null,
      variantBySlug: friendVariant,
      invitationById: baseInvitation
    }), "kim-lee-friends");

    expect(lookup?.invitation.id).toBe("invitation-1");
    expect(lookup?.variant?.id).toBe("variant-1");
    expect(lookup?.publicSlug).toBe("kim-lee-friends");
    expect(lookup?.payload.message).toBe("친구들아 편하게 와줘.");
  });

  it("returns null when neither a published invitation nor an active variant matches", async () => {
    const lookup = await resolvePublishedInvitationBySlug(createLookupClient({
      invitationBySlug: null,
      variantBySlug: null
    }), "missing");

    expect(lookup).toBeNull();
  });
});
