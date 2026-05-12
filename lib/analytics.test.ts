import { trackEvent } from "@/lib/analytics";

describe("trackEvent", () => {
  it("sends GA4 events when gtag is available", () => {
    const gtag = vi.fn();
    Object.defineProperty(window, "gtag", {
      configurable: true,
      value: gtag
    });

    trackEvent("template_use", {
      category: "wedding",
      template_id: "wedding-classic"
    });

    expect(gtag).toHaveBeenCalledWith("event", "template_use", {
      category: "wedding",
      template_id: "wedding-classic"
    });
  });

  it("does nothing when gtag is not installed", () => {
    Object.defineProperty(window, "gtag", {
      configurable: true,
      value: undefined
    });

    expect(() => trackEvent("share_click")).not.toThrow();
  });
});
