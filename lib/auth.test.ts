import { deriveDisplayName, normalizeNextPath } from "@/lib/auth";

describe("auth helpers", () => {
  it("accepts only internal next paths", () => {
    expect(normalizeNextPath("/checkout")).toBe("/checkout");
    expect(normalizeNextPath("https://example.com")).toBe("/dashboard");
    expect(normalizeNextPath("//evil.example")).toBe("/dashboard");
    expect(normalizeNextPath("/\\evil.example")).toBe("/dashboard");
    expect(normalizeNextPath("/%5cevil.example")).toBe("/dashboard");
    expect(normalizeNextPath("/%2f%2fevil.example")).toBe("/dashboard");
    expect(normalizeNextPath("/checkout%0d%0aLocation:evil")).toBe("/dashboard");
  });

  it("derives display name from metadata or email", () => {
    expect(
      deriveDisplayName({
        email: "invitehub@example.com",
        user_metadata: { full_name: "홍길동" }
      })
    ).toBe("홍길동");

    expect(
      deriveDisplayName({
        email: "invitehub@example.com",
        user_metadata: {}
      })
    ).toBe("invitehub");
  });
});
