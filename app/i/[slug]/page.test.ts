import { vi } from "vitest";

const { createServerSupabaseClientMock, createSupabaseAdminClientMock, headersMock } = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
  createSupabaseAdminClientMock: vi.fn(),
  headersMock: vi.fn()
}));

vi.mock("next/headers", () => ({
  headers: headersMock
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

import aliasInvitationPage, { generateMetadata as aliasGenerateMetadata } from "@/app/i/[slug]/page";

describe("/i/[slug] public invitation alias", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createServerSupabaseClientMock.mockResolvedValue(null);
    createSupabaseAdminClientMock.mockReturnValue(null);
    headersMock.mockResolvedValue({
      get(name: string) {
        return {
          host: "invitehub.test",
          "x-forwarded-proto": "https"
        }[name] ?? null;
      }
    });
  });

  it("exposes a public invitation page component for the alias route", () => {
    expect(typeof aliasInvitationPage).toBe("function");
  });

  it("builds alias metadata with the short /i public URL", async () => {
    const metadata = await aliasGenerateMetadata({
      params: Promise.resolve({ slug: "kim-lee-demo" })
    });

    expect(metadata.openGraph?.url).toBe("https://invitehub.test/i/kim-lee-demo");
  });
});
