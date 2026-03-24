import { redirect } from "next/navigation";
import legacyInvitationPage from "@/app/invitations/[slug]/page";

vi.mock("next/navigation", () => ({
  redirect: vi.fn()
}));

describe("/invitations/[slug] legacy redirect", () => {
  it("redirects to the short /i/[slug] route", async () => {
    await legacyInvitationPage({
      params: Promise.resolve({ slug: "sample-slug" })
    });

    expect(redirect).toHaveBeenCalledWith("/i/sample-slug");
  });
});
