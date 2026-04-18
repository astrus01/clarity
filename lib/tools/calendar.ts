import { calendarListRange, calendarListToday } from "./google";

export type CalendarEvent = {
  title: string;
  start: string; // "9:00 AM"
  end: string;
  color?: string;
};

// Fixture calendar used when Google is not connected. Intentional gap between
// 10:00 and 13:30 so find-focus-block has something to demonstrate.
const FIXTURE_EVENTS: CalendarEvent[] = [
  { title: "Standup", start: "9:00 AM", end: "9:15 AM" },
  { title: "Coffee with Maya", start: "9:30 AM", end: "10:00 AM" },
  { title: "Design review", start: "1:30 PM", end: "2:30 PM" },
  { title: "1:1 with manager", start: "3:00 PM", end: "3:30 PM" },
  { title: "Investor call", start: "5:00 PM", end: "5:30 PM" },
];

export async function listEventsToday(): Promise<CalendarEvent[]> {
  try {
    const real = await calendarListToday();
    if (real.length > 0) return real;
  } catch {
    // fall through
  }
  return FIXTURE_EVENTS;
}

export type CalendarDay = { label: string; events: CalendarEvent[] };

/**
 * Multi-day window around today. daysAhead 0..30. Empty days are kept so the
 * panel can show "Nothing scheduled" instead of collapsing them.
 */
export async function listEventsRange(opts: {
  daysBack?: number;
  daysAhead?: number;
}): Promise<CalendarDay[]> {
  try {
    const real = await calendarListRange(opts);
    if (real.length > 0) return real;
  } catch {
    // fall through
  }
  // Fixture fallback: repeat today's schedule across the requested window.
  const daysBack = Math.max(0, opts.daysBack ?? 0);
  const daysAhead = Math.max(0, Math.min(opts.daysAhead ?? 0, 14));
  const now = new Date();
  const out: CalendarDay[] = [];
  for (let i = -daysBack; i <= daysAhead; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const weekday = d.toLocaleDateString([], { weekday: "short" });
    const month = d.toLocaleDateString([], { month: "short" });
    const label =
      i === 0 ? `Today · ${month} ${d.getDate()}` : `${weekday} · ${month} ${d.getDate()}`;
    // Weekends light, weekdays use the fixture
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    out.push({
      label,
      events: isWeekend
        ? [{ title: "No meetings scheduled", start: "all day", end: "" }]
        : FIXTURE_EVENTS,
    });
  }
  return out;
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

export async function findFocusBlock(minDurationMinutes: number): Promise<{
  start: string;
  end: string;
  minutes: number;
} | null> {
  const events = await listEventsToday();
  const DAY_START = 9 * 60;
  const DAY_END = 18 * 60;
  const busy = events
    .map((e) => ({ start: toMinutes(e.start), end: toMinutes(e.end) }))
    .filter((b) => b.end > b.start)
    .sort((a, b) => a.start - b.start);

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
