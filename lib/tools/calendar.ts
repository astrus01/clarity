import {
  calendarDeleteEvent as calendarDeleteEventApi,
  calendarEventsInRange,
  calendarInsertEvent,
  calendarListRange,
  calendarListToday,
  calendarPatchEvent,
  isGoogleConnected,
  type CalendarDeleteResult,
  type CalendarInsertResult,
  type CalendarUpdateResult,
} from "./google";

const DEFAULT_BUFFER_MINUTES = 15;

export type CalendarEvent = {
  title: string;
  start: string; // "9:00 AM"
  end: string;
  color?: string;
  // Populated only for real Google events — gives the model precise ISO
  // timestamps and the user's timezone so calendar_create_event can be
  // called with correct offsets. `id` is the Google event ID, required for
  // move/delete operations.
  id?: string;
  startIso?: string;
  endIso?: string;
  location?: string;
  timeZone?: string;
};

export type CalendarSource = "google" | "fixture";

export type TodayEventsResult = {
  source: CalendarSource;
  connected: boolean;
  events: CalendarEvent[];
};

// Fixture calendar used ONLY when Google is not connected. Intentional gap
// between 10:00 and 13:30 so find-focus-block has something to demonstrate.
const FIXTURE_EVENTS: CalendarEvent[] = [
  { title: "Standup", start: "9:00 AM", end: "9:15 AM" },
  { title: "Coffee with Maya", start: "9:30 AM", end: "10:00 AM" },
  { title: "Design review", start: "1:30 PM", end: "2:30 PM" },
  { title: "1:1 with manager", start: "3:00 PM", end: "3:30 PM" },
  { title: "Investor call", start: "5:00 PM", end: "5:30 PM" },
];

/**
 * Today's events. When Google is connected, returns the REAL calendar even
 * if empty. Only falls back to the demo fixture when the user has not yet
 * connected Google — so the model can tell them to connect instead of
 * silently acting on fake data.
 */
export async function listEventsToday(): Promise<TodayEventsResult> {
  const connected = await isGoogleConnected();
  if (connected) {
    try {
      const real = await calendarListToday();
      return { source: "google", connected: true, events: real };
    } catch {
      return { source: "google", connected: true, events: [] };
    }
  }
  return { source: "fixture", connected: false, events: FIXTURE_EVENTS };
}

export type CalendarDay = { label: string; events: CalendarEvent[] };

export type RangeEventsResult = {
  source: CalendarSource;
  connected: boolean;
  days: CalendarDay[];
};

/**
 * Multi-day window around today. daysAhead 0..30. When Google is connected,
 * returns the REAL range even if entirely empty. Only falls back to the demo
 * fixture when not connected.
 */
export async function listEventsRange(opts: {
  daysBack?: number;
  daysAhead?: number;
}): Promise<RangeEventsResult> {
  const connected = await isGoogleConnected();
  if (connected) {
    try {
      const real = await calendarListRange(opts);
      return { source: "google", connected: true, days: real };
    } catch {
      return { source: "google", connected: true, days: [] };
    }
  }
  // Fixture fallback: repeat the demo schedule across the requested window.
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
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    out.push({
      label,
      events: isWeekend
        ? [{ title: "No meetings scheduled", start: "all day", end: "" }]
        : FIXTURE_EVENTS,
    });
  }
  return { source: "fixture", connected: false, days: out };
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

export type CreateEventResult =
  | {
      created: true;
      title: string;
      when: string; // human label, e.g. "Today · 12:30–1:00 PM"
      bufferMinutes: number;
      location?: string;
      htmlLink?: string;
      id: string;
    }
  | {
      created: false;
      reason: "not-connected" | "forbidden" | "error" | "bad-input" | "conflict";
      message: string;
      conflict?: {
        title: string;
        when: string; // human label of the conflicting event
        startIso?: string;
        endIso?: string;
      };
    };

function humanWhen(startIso: string, endIso: string): string {
  try {
    const s = new Date(startIso);
    const e = new Date(endIso);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return `${startIso} → ${endIso}`;
    const now = new Date();
    const sameDay =
      s.getFullYear() === now.getFullYear() &&
      s.getMonth() === now.getMonth() &&
      s.getDate() === now.getDate();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow =
      s.getFullYear() === tomorrow.getFullYear() &&
      s.getMonth() === tomorrow.getMonth() &&
      s.getDate() === tomorrow.getDate();
    const dayLabel = sameDay
      ? "Today"
      : isTomorrow
        ? "Tomorrow"
        : s.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
    const startTime = s.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const endTime = e.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    return `${dayLabel} · ${startTime}–${endTime}`;
  } catch {
    return `${startIso} → ${endIso}`;
  }
}

/**
 * Create an event on the user's primary Google Calendar. ISO timestamps must
 * include timezone (e.g. "2026-04-18T12:30:00-04:00"). When Google isn't
 * connected, returns created:false with reason "not-connected".
 *
 * Before writing, the requested window is expanded by `bufferMinutes` on each
 * side and checked against existing events. If anything overlaps that padded
 * window, the write is refused with `reason: "conflict"`. Pass
 * `bufferMinutes: 0` to skip the check entirely.
 */
export async function createCalendarEvent(opts: {
  title: string;
  startIso: string;
  endIso: string;
  location?: string;
  description?: string;
  timeZone?: string;
  bufferMinutes?: number;
}): Promise<CreateEventResult> {
  if (!opts.title || !opts.startIso || !opts.endIso) {
    return {
      created: false,
      reason: "bad-input",
      message: "title, startIso, and endIso are all required.",
    };
  }
  const start = new Date(opts.startIso);
  const end = new Date(opts.endIso);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      created: false,
      reason: "bad-input",
      message: "startIso/endIso must be valid ISO-8601 timestamps.",
    };
  }
  if (end.getTime() <= start.getTime()) {
    return {
      created: false,
      reason: "bad-input",
      message: "endIso must be after startIso.",
    };
  }

  const buffer = Math.max(0, Math.round(opts.bufferMinutes ?? DEFAULT_BUFFER_MINUTES));

  if (buffer > 0) {
    const connected = await isGoogleConnected();
    if (connected) {
      const conflict = await findConflictingEvent(start, end, buffer);
      if (conflict) {
        return {
          created: false,
          reason: "conflict",
          message: `Would violate a ${buffer}-min buffer — conflicts with "${conflict.title}" (${humanWhen(conflict.startIso!, conflict.endIso!)}). Pick a different window.`,
          conflict: {
            title: conflict.title,
            when: humanWhen(conflict.startIso!, conflict.endIso!),
            startIso: conflict.startIso,
            endIso: conflict.endIso,
          },
        };
      }
    }
  }

  const result: CalendarInsertResult = await calendarInsertEvent(opts);
  if (!result.created) {
    if (result.reason === "not-connected") {
      return {
        created: false,
        reason: "not-connected",
        message:
          "Google is not connected. Ask the user to click Connect Google in the sidebar, then retry.",
      };
    }
    return {
      created: false,
      reason: result.reason,
      message: result.error ?? "Calendar insert failed.",
    };
  }
  return {
    created: true,
    id: result.id,
    title: result.title,
    when: humanWhen(result.startIso, result.endIso),
    bufferMinutes: buffer,
    location: result.location,
    htmlLink: result.htmlLink,
  };
}

/**
 * Fetch events around [start, end] expanded by `bufferMinutes` on each side
 * and return the first one that actually overlaps the padded window. Returns
 * null if the buffered window is clear. `ignoreId` skips a specific event —
 * used when MOVING an event so it doesn't conflict with its own old slot.
 */
async function findConflictingEvent(
  start: Date,
  end: Date,
  bufferMinutes: number,
  ignoreId?: string,
): Promise<
  | {
      title: string;
      startIso?: string;
      endIso?: string;
    }
  | null
> {
  const bufferMs = bufferMinutes * 60 * 1000;
  const windowStart = new Date(start.getTime() - bufferMs);
  const windowEnd = new Date(end.getTime() + bufferMs);
  const events = await calendarEventsInRange(
    windowStart.toISOString(),
    windowEnd.toISOString(),
  );
  const paddedStartMs = windowStart.getTime();
  const paddedEndMs = windowEnd.getTime();
  for (const ev of events) {
    if (ignoreId && ev.id === ignoreId) continue;
    if (!ev.startIso || !ev.endIso) continue;
    const s = new Date(ev.startIso).getTime();
    const e = new Date(ev.endIso).getTime();
    if (isNaN(s) || isNaN(e)) continue;
    if (s < paddedEndMs && e > paddedStartMs) {
      return { title: ev.title, startIso: ev.startIso, endIso: ev.endIso };
    }
  }
  return null;
}

export type UpdateEventResult =
  | {
      updated: true;
      id: string;
      title: string;
      when: string;
      bufferMinutes: number;
      location?: string;
      htmlLink?: string;
    }
  | {
      updated: false;
      reason:
        | "not-connected"
        | "not-found"
        | "forbidden"
        | "error"
        | "bad-input"
        | "conflict";
      message: string;
      conflict?: {
        title: string;
        when: string;
        startIso?: string;
        endIso?: string;
      };
    };

/**
 * Move or edit an existing primary-calendar event. Used for "move lunch to
 * 11am", "shift my workout 30 min later", "rename 'Focus' to 'Deep work'".
 * If a new start/end is given, the 15-min buffer is enforced against OTHER
 * events (the event being moved is excluded from the conflict check).
 */
export async function updateCalendarEvent(opts: {
  id: string;
  title?: string;
  startIso?: string;
  endIso?: string;
  location?: string;
  description?: string;
  timeZone?: string;
  bufferMinutes?: number;
}): Promise<UpdateEventResult> {
  if (!opts.id) {
    return {
      updated: false,
      reason: "bad-input",
      message: "id is required — fetch it from calendar_today or calendar_upcoming.",
    };
  }

  const buffer = Math.max(0, Math.round(opts.bufferMinutes ?? DEFAULT_BUFFER_MINUTES));
  const shiftingTime = !!(opts.startIso || opts.endIso);

  if (shiftingTime) {
    if (!opts.startIso || !opts.endIso) {
      return {
        updated: false,
        reason: "bad-input",
        message: "When moving an event, pass BOTH start_iso and end_iso.",
      };
    }
    const start = new Date(opts.startIso);
    const end = new Date(opts.endIso);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        updated: false,
        reason: "bad-input",
        message: "start_iso/end_iso must be valid ISO-8601 timestamps.",
      };
    }
    if (end.getTime() <= start.getTime()) {
      return {
        updated: false,
        reason: "bad-input",
        message: "end_iso must be after start_iso.",
      };
    }

    if (buffer > 0) {
      const connected = await isGoogleConnected();
      if (connected) {
        const conflict = await findConflictingEvent(start, end, buffer, opts.id);
        if (conflict) {
          return {
            updated: false,
            reason: "conflict",
            message: `Would violate a ${buffer}-min buffer — conflicts with "${conflict.title}" (${humanWhen(conflict.startIso!, conflict.endIso!)}). Pick a different window.`,
            conflict: {
              title: conflict.title,
              when: humanWhen(conflict.startIso!, conflict.endIso!),
              startIso: conflict.startIso,
              endIso: conflict.endIso,
            },
          };
        }
      }
    }
  }

  const result: CalendarUpdateResult = await calendarPatchEvent(opts);
  if (!result.updated) {
    if (result.reason === "not-connected") {
      return {
        updated: false,
        reason: "not-connected",
        message:
          "Google is not connected. Ask the user to click Connect Google in the sidebar, then retry.",
      };
    }
    if (result.reason === "not-found") {
      return {
        updated: false,
        reason: "not-found",
        message: `No event with id "${opts.id}" — refresh the calendar first, the event may have been deleted.`,
      };
    }
    return {
      updated: false,
      reason: result.reason,
      message: result.error ?? "Calendar update failed.",
    };
  }
  return {
    updated: true,
    id: result.id,
    title: result.title,
    when: humanWhen(result.startIso, result.endIso),
    bufferMinutes: buffer,
    location: result.location,
    htmlLink: result.htmlLink,
  };
}

export type DeleteEventResult =
  | { deleted: true; id: string }
  | {
      deleted: false;
      reason: "not-connected" | "not-found" | "forbidden" | "error" | "bad-input";
      message: string;
    };

/**
 * Remove an event from the user's primary calendar. Use for "cancel my 3pm",
 * "delete the lunch hold", or as the first half of a delete+recreate move
 * when `updateCalendarEvent` isn't appropriate.
 */
export async function deleteCalendarEvent(id: string): Promise<DeleteEventResult> {
  if (!id) {
    return {
      deleted: false,
      reason: "bad-input",
      message: "id is required — fetch it from calendar_today or calendar_upcoming.",
    };
  }
  const result: CalendarDeleteResult = await calendarDeleteEventApi(id);
  if (!result.deleted) {
    if (result.reason === "not-connected") {
      return {
        deleted: false,
        reason: "not-connected",
        message:
          "Google is not connected. Ask the user to click Connect Google in the sidebar, then retry.",
      };
    }
    if (result.reason === "not-found") {
      return {
        deleted: false,
        reason: "not-found",
        message: `No event with id "${id}" — it may have already been deleted.`,
      };
    }
    return {
      deleted: false,
      reason: result.reason,
      message: result.error ?? "Calendar delete failed.",
    };
  }
  return { deleted: true, id: result.id };
}

/**
 * Largest open block today of at least `minDurationMinutes`, returned with
 * `bufferMinutes` of protected padding on each side stripped off so the
 * window is directly usable for a scheduled event.
 *
 * Example: a 2h gap between an 11:00 class and a 1:30 class with a 15-min
 * buffer yields a usable window of 11:15–1:15.
 */
export async function findFocusBlock(
  minDurationMinutes: number,
  bufferMinutes: number = DEFAULT_BUFFER_MINUTES,
): Promise<{
  start: string;
  end: string;
  minutes: number;
  bufferMinutes: number;
} | null> {
  const { events } = await listEventsToday();
  const buffer = Math.max(0, Math.round(bufferMinutes));
  const needed = minDurationMinutes + 2 * buffer;
  const DAY_START = 9 * 60;
  const DAY_END = 18 * 60;
  const busy = events
    .map((e) => ({ start: toMinutes(e.start), end: toMinutes(e.end) }))
    .filter((b) => b.end > b.start)
    .sort((a, b) => a.start - b.start);

  let cursor = DAY_START;
  let best: { start: number; end: number } | null = null;
  for (const b of busy) {
    if (b.start - cursor >= needed) {
      if (!best || b.start - cursor > best.end - best.start) {
        best = { start: cursor, end: b.start };
      }
    }
    cursor = Math.max(cursor, b.end);
  }
  if (DAY_END - cursor >= needed) {
    if (!best || DAY_END - cursor > best.end - best.start) {
      best = { start: cursor, end: DAY_END };
    }
  }

  if (!best) return null;
  const usableStart = best.start + buffer;
  const usableEnd = best.end - buffer;
  return {
    start: fromMinutes(usableStart),
    end: fromMinutes(usableEnd),
    minutes: usableEnd - usableStart,
    bufferMinutes: buffer,
  };
}
