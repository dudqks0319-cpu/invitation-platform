import { describe, expect, it } from "vitest";
import {
  getInviteHubBaseUrl,
  getPublicInvitationUrl,
  getWebBuilderUrl,
  getWebTemplatesUrl
} from "./web-links";

describe("web-links", () => {
  it("normalizes the web base url", () => {
    expect(getInviteHubBaseUrl("https://invitehub.co.kr/")).toBe("https://invitehub.co.kr");
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
});
