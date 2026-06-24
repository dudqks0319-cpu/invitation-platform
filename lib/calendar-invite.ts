import { formatVenue, type InvitationDraftPayload } from "@/lib/invitation-payload";

const DEFAULT_EVENT_DURATION_MINUTES = 120;
const SEOUL_UTC_OFFSET_HOURS = 9;

type CalendarEventWindow = {
  end: Date;
  start: Date;
};

function parseSeoulLocalDateTime(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute] = match;
  return new Date(Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour) - SEOUL_UTC_OFFSET_HOURS,
    Number(minute)
  ));
}

function parseEventDateTime(value: string) {
  if (!value) {
    return null;
  }

  const date = /(?:Z|[+-]\d{2}:?\d{2})$/.test(value)
    ? new Date(value)
    : parseSeoulLocalDateTime(value);

  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function buildInvitationCalendarWindow(
  value: string,
  durationMinutes = DEFAULT_EVENT_DURATION_MINUTES
): CalendarEventWindow | null {
  const start = parseEventDateTime(value);

  if (!start) {
    return null;
  }

  return {
    start,
    end: new Date(start.getTime() + durationMinutes * 60 * 1000)
  };
}

function formatCalendarUtc(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function buildInvitationCalendarTitle(payload: InvitationDraftPayload, title = payload.title) {
  return title.trim() || payload.title || "InviteHub 초대";
}

export function buildGoogleCalendarUrl({
  payload,
  shareUrl,
  title = payload.title
}: {
  payload: InvitationDraftPayload;
  shareUrl: string;
  title?: string;
}) {
  const window = buildInvitationCalendarWindow(payload.eventDateTime);

  if (!window) {
    return "";
  }

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: buildInvitationCalendarTitle(payload, title),
    dates: `${formatCalendarUtc(window.start)}/${formatCalendarUtc(window.end)}`,
    details: [payload.message, shareUrl].filter(Boolean).join("\n\n"),
    location: formatVenue(payload)
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildInvitationCalendarIcs({
  now = new Date(),
  payload,
  shareUrl,
  title = payload.title,
  uid
}: {
  now?: Date;
  payload: InvitationDraftPayload;
  shareUrl: string;
  title?: string;
  uid: string;
}) {
  const window = buildInvitationCalendarWindow(payload.eventDateTime);

  if (!window) {
    return "";
  }

  const description = [payload.message, shareUrl].filter(Boolean).join("\n\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//InviteHub//Invitation Calendar//KO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${escapeIcsText(uid)}`,
    `DTSTAMP:${formatCalendarUtc(now)}`,
    `DTSTART:${formatCalendarUtc(window.start)}`,
    `DTEND:${formatCalendarUtc(window.end)}`,
    `SUMMARY:${escapeIcsText(buildInvitationCalendarTitle(payload, title))}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(formatVenue(payload))}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}
