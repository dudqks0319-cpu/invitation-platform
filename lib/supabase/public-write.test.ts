import { ensureJsonRequest, publicGuestbookSchema, publicRsvpSchema, readJsonBody } from "@/lib/supabase/public-write";

describe("public write validation", () => {
  it("rejects honeypot-filled RSVP payloads", () => {
    const result = publicRsvpSchema.safeParse({
      guestName: "박하객",
      attending: "yes",
      guests: 2,
      website: "bot"
    });

    expect(result.success).toBe(false);
  });

  it("accepts extended RSVP fields and normalizes defaults", () => {
    const result = publicRsvpSchema.safeParse({
      guestName: "박하객",
      attending: "yes",
      guests: 2,
      side: "groom",
      mealPreference: "yes",
      shuttleNeeded: "yes",
      companionNames: "김친구, 이친구"
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.side).toBe("groom");
    expect(result.data.mealPreference).toBe("yes");
    expect(result.data.shuttleNeeded).toBe(true);
    expect(result.data.companionNames).toBe("김친구, 이친구");
  });

  it("defaults guestbook entries to moderated flow inputs only", () => {
    const result = publicGuestbookSchema.safeParse({
      nickname: "친구1",
      message: "축하합니다!"
    });

    expect(result.success).toBe(true);
  });

  it("detects json requests from content-type", () => {
    const request = new Request("https://example.com", {
      method: "POST",
      headers: {
        "content-type": "application/json; charset=utf-8"
      }
    });

    expect(ensureJsonRequest(request)).toBe(true);
  });

  it("returns a friendly message for malformed json bodies", async () => {
    const request = new Request("https://example.com", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: "{invalid"
    });

    await expect(readJsonBody(request)).resolves.toEqual({
      ok: false,
      message: "요청 본문을 읽지 못했습니다. 다시 시도해 주세요."
    });
  });
});
