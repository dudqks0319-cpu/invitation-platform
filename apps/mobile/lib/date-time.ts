function pad(value: number) {
  return `${value}`.padStart(2, "0");
}

export function parseInviteDateTime(value: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatInviteDateTime(value: string) {
  const date = parseInviteDateTime(value);

  if (!date) {
    return "";
  }

  const period = date.getHours() < 12 ? "오전" : "오후";
  const hour12 = date.getHours() % 12 || 12;

  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${period} ${hour12}:${pad(date.getMinutes())}`;
}

export function mergeInviteDateTimePart(currentValue: string, selectedDate: Date, mode: "date" | "time") {
  const current = parseInviteDateTime(currentValue) ?? new Date();
  const next = new Date(current);

  if (mode === "date") {
    next.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
  } else {
    next.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
  }

  return [
    next.getFullYear(),
    pad(next.getMonth() + 1),
    pad(next.getDate())
  ].join("-") + `T${pad(next.getHours())}:${pad(next.getMinutes())}`;
}
