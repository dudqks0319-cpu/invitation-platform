import {
  ensureJsonRequest,
  getBearerToken,
  getIdempotencyKey,
  hashPublicWrite,
  publicGuestbookSchema,
  publicRsvpSchema,
  readJsonBody
} from "@/lib/supabase/public-write";

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
    expect(ensureJsonRequest(new Request("https://example.com", {
      headers: { "content-type": "text/application/json.evil" }
    }))).toBe(false);
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

  it("rejects a streamed body that exceeds the byte cap without a content-length header", async () => {
    const encoder = new TextEncoder();
    const request = new Request("https://example.com", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode('{"message":"'));
          controller.enqueue(encoder.encode("x".repeat(80)));
          controller.enqueue(encoder.encode('"}'));
          controller.close();
        }
      }),
      duplex: "half"
    } as RequestInit & { duplex: "half" });

    await expect(readJsonBody(request, 64)).resolves.toEqual({
      ok: false,
      message: "요청 본문이 너무 큽니다."
    });
  });

  it("accepts only strict bearer and bounded idempotency headers", () => {
    const request = new Request("https://example.com", {
      headers: {
        authorization: "Bearer token-without-spaces",
        "idempotency-key": "public-write:1234567890"
      }
    });
    const malformed = new Request("https://example.com", {
      headers: {
        authorization: "Bearer token with spaces",
        "idempotency-key": "short"
      }
    });

    expect(getBearerToken(request)).toBe("token-without-spaces");
    expect(getIdempotencyKey(request)).toBe("public-write:1234567890");
    expect(getBearerToken(malformed)).toBe("");
    expect(getIdempotencyKey(malformed)).toBeNull();
  });

  it("hashes idempotency and request material without retaining the raw value", () => {
    const rawKey = "public-write:1234567890";
    const digest = hashPublicWrite("rsvp", "invitation-1", rawKey);

    expect(digest).toMatch(/^[a-f0-9]{64}$/);
    expect(digest).not.toContain(rawKey);
    expect(hashPublicWrite("rsvp", "invitation-1", rawKey)).toBe(digest);
    expect(hashPublicWrite("guestbook", "invitation-1", rawKey)).not.toBe(digest);
  });
});
