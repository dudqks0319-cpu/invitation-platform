import { publicGuestbookSchema, publicRsvpSchema } from "@/lib/supabase/public-write";

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
});
