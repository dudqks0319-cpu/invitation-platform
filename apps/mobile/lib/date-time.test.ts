import { describe, expect, it } from "vitest";
import { formatInviteDateTime, mergeInviteDateTimePart } from "./date-time";

describe("invite date time helpers", () => {
  it("formats ISO datetime for display", () => {
    expect(formatInviteDateTime("2026-05-23T14:00")).toContain("2026년 5월 23일");
  });

  it("preserves time when replacing the date part", () => {
    const next = mergeInviteDateTimePart("2026-05-23T14:00", new Date("2026-06-01T09:30:00"), "date");
    expect(next).toBe("2026-06-01T14:00");
  });

  it("preserves date when replacing the time part", () => {
    const next = mergeInviteDateTimePart("2026-05-23T14:00", new Date("2026-06-01T09:30:00"), "time");
    expect(next).toBe("2026-05-23T09:30");
  });
});
