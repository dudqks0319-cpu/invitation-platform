import {
  buildGoogleCalendarUrl,
  buildInvitationCalendarIcs,
  buildInvitationCalendarWindow
} from "@/lib/calendar-invite";
import { defaultInvitationDraft, normalizeDraft } from "@/lib/invitation-payload";

describe("invitation calendar helpers", () => {
  it("converts Seoul local event time into a UTC calendar window", () => {
    const window = buildInvitationCalendarWindow("2026-04-12T14:00");

    expect(window?.start.toISOString()).toBe("2026-04-12T05:00:00.000Z");
    expect(window?.end.toISOString()).toBe("2026-04-12T07:00:00.000Z");
  });

  it("builds a Google Calendar URL with event details", () => {
    const url = buildGoogleCalendarUrl({
      payload: defaultInvitationDraft,
      shareUrl: "https://invitehub.test/invitations/kim-lee-demo",
      title: "김 & 이 결혼식 초대장"
    });

    expect(url).toContain("https://calendar.google.com/calendar/render?");
    const params = new URL(url).searchParams;

    expect(params.get("action")).toBe("TEMPLATE");
    expect(params.get("dates")).toBe("20260412T050000Z/20260412T070000Z");
    expect(params.get("text")).toBe("김 & 이 결혼식 초대장");
    expect(params.get("location")).toContain("서울 더파인 웨딩홀");
  });

  it("builds escaped ICS content for calendar downloads", () => {
    const payload = normalizeDraft({
      ...defaultInvitationDraft,
      title: "김, 이 결혼식; 초대장",
      message: "한 줄\n두 줄"
    });

    const ics = buildInvitationCalendarIcs({
      now: new Date("2026-01-01T00:00:00.000Z"),
      payload,
      shareUrl: "https://invitehub.test/invitations/kim-lee-demo",
      uid: "kim-lee-demo@invitehub.test"
    });

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("DTSTAMP:20260101T000000Z");
    expect(ics).toContain("DTSTART:20260412T050000Z");
    expect(ics).toContain("SUMMARY:김\\, 이 결혼식\\; 초대장");
    expect(ics).toContain("DESCRIPTION:한 줄\\n두 줄\\n\\nhttps://invitehub.test/invitations/kim-lee-demo");
    expect(ics).toContain("END:VCALENDAR");
  });
});
