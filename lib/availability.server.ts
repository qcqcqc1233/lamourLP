/* ---------------------------------------------------------------------------
   Real availability for /non-surgical-face-neck, from the GHL calendar.

   The page's start times come from the clinic's rules (lib/schedule.ts); the
   calendar decides which of them are still free. The page shows only those,
   and /api/book asks again just before booking, so two people picking the
   same hour cannot both get it.
--------------------------------------------------------------------------- */

import { ghl } from "./ghl.server"
import { FACE_NECK, FACE_NECK_RULES } from "./offer"
import { bookableDays } from "./schedule"

const FREE_SLOT_VERSIONS = ["2021-04-15"]

/** Start instants (ms) the calendar itself calls free between two times. */
export async function calendarFreeStarts(calendarId: string, startMs: number, endMs: number, timeoutMs = 6000) {
  const res = await ghl<Record<string, { slots?: string[] }>>(
    "GET",
    `/calendars/${calendarId}/free-slots?startDate=${startMs}&endDate=${endMs}&timezone=${encodeURIComponent(FACE_NECK_RULES.timeZone)}`,
    undefined,
    FREE_SLOT_VERSIONS,
    timeoutMs,
  )
  const free = new Set<number>()
  for (const [key, day] of Object.entries(res || {})) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) continue
    for (const s of day?.slots || []) free.add(new Date(s).getTime())
  }
  return free
}

/** The page's start times, and those of them the calendar still has free. */
export async function faceNeckAvailability(calendarId: string, now = new Date()) {
  const days = bookableDays(now, FACE_NECK_RULES, FACE_NECK.durationMin)
  const offered = days.flatMap((d) => d.slots.map((s) => s.startUtc))
  if (!offered.length) return { offered, free: [] as string[] }
  const startMs = new Date(offered[0]).getTime()
  const endMs = new Date(offered[offered.length - 1]).getTime() + FACE_NECK.durationMin * 60000
  const free = await calendarFreeStarts(calendarId, startMs, endMs)
  return { offered, free: offered.filter((iso) => free.has(new Date(iso).getTime())) }
}

/** Whether one start time is still free, asked right before booking it. */
export async function isCalendarFree(calendarId: string, start: Date) {
  // A window around the hour, so the calendar's own day boundaries never
  // leave the slot out of its answer.
  const free = await calendarFreeStarts(calendarId, start.getTime() - 3600000, start.getTime() + 2 * 3600000, 5000)
  return free.has(start.getTime())
}
