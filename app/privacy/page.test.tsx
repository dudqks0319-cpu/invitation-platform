import { renderToStaticMarkup } from "react-dom/server";
import { vi } from "vitest";
import PrivacyPage from "@/app/privacy/page";

vi.mock("@/components/shared/site-header", () => ({
  SiteHeader: () => <header>InviteHub</header>
}));

describe("PrivacyPage", () => {
  it("explains RSVP, analytics, and marketing-message privacy boundaries", () => {
    const markup = renderToStaticMarkup(<PrivacyPage />);

    expect(markup).toContain("RSVP 제출 시 하객 이름");
    expect(markup).toContain("Google Analytics");
    expect(markup).toContain("광고성 메시지");
    expect(markup).toContain("해당 초대장 소유자에게 전달됩니다");
  });
});
