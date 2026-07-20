import { describe, expect, it } from "vitest";
import {
  getFaqUrl,
  getInviteHubBaseUrl,
  getPrivacyUrl,
  getPublicInvitationUrl,
  getSupportUrl,
  getTermsUrl,
  getWebBuilderUrl,
  getWebTemplatesUrl
} from "./web-links";

describe("web-links", () => {
  it("uses the verified Vercel deployment as the release default", () => {
    expect(getInviteHubBaseUrl()).toBe("https://invitation-platform-plum.vercel.app");
    expect(getPublicInvitationUrl("hello-world")).toBe(
      "https://invitation-platform-plum.vercel.app/i/hello-world"
    );
  });

  it("normalizes the web base url", () => {
    expect(getInviteHubBaseUrl("https://invitehub.co.kr/")).toBe("https://invitehub.co.kr");
  });

  it("canonicalizes old long Vercel project hosts to the short release host", () => {
    expect(getInviteHubBaseUrl("https://invitation-platform-youngbeens-projects.vercel.app/")).toBe(
      "https://invitation-platform-plum.vercel.app"
    );
    expect(getInviteHubBaseUrl("https://invitation-platform-5kk4ztnh1-youngbeens-projects.vercel.app/")).toBe(
      "https://invitation-platform-plum.vercel.app"
    );
  });

  it("builds the templates url", () => {
    expect(getWebTemplatesUrl("https://invitehub.co.kr/")).toBe("https://invitehub.co.kr/#templates");
  });

  it("builds the builder url with query params", () => {
    expect(
      getWebBuilderUrl(
        {
          templateId: "wedding-classic",
          invitationId: "inv-123",
          intent: "checkout"
        },
        "https://invitehub.co.kr/"
      )
    ).toBe("https://invitehub.co.kr/builder?template=wedding-classic&invitationId=inv-123&intent=checkout");
  });

  it("builds the public invitation url", () => {
    expect(getPublicInvitationUrl("hello-world", "https://invitehub.co.kr/")).toBe(
      "https://invitehub.co.kr/i/hello-world"
    );
  });

  it("builds faq, support, and policy urls from one base url", () => {
    expect(getFaqUrl("https://invitehub.co.kr/")).toBe("https://invitehub.co.kr/faq");
    expect(getPrivacyUrl("https://invitehub.co.kr/")).toBe("https://invitehub.co.kr/privacy");
    expect(getTermsUrl("https://invitehub.co.kr/")).toBe("https://invitehub.co.kr/terms");
    expect(getSupportUrl("https://invitehub.co.kr/")).toBe("https://invitehub.co.kr/support");
  });
});
