export type CalendarEvent = {
  title: string;
  start: string; // "9:00 AM"
  end: string;
  color?: string;
};

// Today's fixture calendar. Gap between Coffee (10:00) and Design review (13:30) is 3.5h.
const TODAY_EVENTS: CalendarEvent[] = [
  { title: "Standup", start: "9:00 AM", end: "9:15 AM" },
  { title: "Coffee with Maya", start: "9:30 AM", end: "10:00 AM" },
  { title: "Design review", start: "1:30 PM", end: "2:30 PM" },
  { title: "1:1 with manager", start: "3:00 PM", end: "3:30 PM" },
  { title: "Investor call", start: "5:00 PM", end: "5:30 PM" },
];

export function listEventsToday(): CalendarEvent[] {
  return TODAY_EVENTS;
}

function toMinutes(label: string): number {
  const m = label.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return 0;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const pm = m[3].toUpperCase() === "PM";
  if (pm && h !== 12) h += 12;
  if (!pm && h === 12) h = 0;
  return h * 60 + min;
}

function fromMinutes(mins: number): string {
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const pm = h >= 12;
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${pm ? "PM" : "AM"}`;
}

export function findFocusBlock(minDurationMinutes: number): {
  start: string;
  end: string;
  minutes: number;
} | null {
  const DAY_START = 9 * 60;
  const DAY_END = 18 * 60;
  const busy = TODAY_EVENTS.map((e) => ({
    start: toMinutes(e.start),
    end: toMinutes(e.end),
  })).sort((a, b) => a.start - b.start);

  let cursor = DAY_START;
  let best: { start: number; end: number } | null = null;
  for (const b of busy) {
    if (b.start - cursor >= minDurationMinutes) {
      if (!best || b.start - cursor > best.end - best.start) {
        best = { start: cursor, end: b.start };
      }
    }
    cursor = Math.max(cursor, b.end);
  }
  if (DAY_END - cursor >= minDurationMinutes) {
    if (!best || DAY_END - cursor > best.end - best.start) {
      best = { start: cursor, end: DAY_END };
    }
  }

  if (!best) return null;
  return {
    start: fromMinutes(best.start),
    end: fromMinutes(best.end),
    minutes: best.end - best.start,
  };
}
