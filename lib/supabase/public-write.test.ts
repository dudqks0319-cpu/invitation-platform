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

  it("enforces byte limits even when content-length is unavailable", async () => {
    const request = new Request("https://example.com", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ memo: "가".repeat(20) })
    });

    await expect(readJsonBody(request, 16)).resolves.toEqual({
      ok: false,
      message: "요청 본문이 너무 큽니다."
    });
  });
});
