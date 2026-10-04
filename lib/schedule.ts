/* ---------------------------------------------------------------------------
   Days and start times, always in London time.

   A visitor in Tel Aviv or New York must see the clinic's 10:00, not her own.
   Everything below works from London wall-clock dates (y-m-d) and converts to
   an instant only at the edges, so a browser's own zone never leaks in and the
   October/March clock changes land on the right hour.

   The browser uses this to draw the picker; the server uses the same code to
   accept or refuse a start time, so the two can never disagree.
--------------------------------------------------------------------------- */

import type { BookingRules } from "./offer"

const TZ = "Europe/London"

export type Ymd = { y: number; m: number; d: number } // m is 1-12

export type Slot = {
  hour: number
  label: string // "10:00"
  startUtc: string // ISO instant, Z
  startLondon: string // ISO with London offset, e.g. 2026-10-26T10:00:00+00:00
  endLondon: string
}

export type Day = Ymd & {
  key: string // "2026-10-05"
  weekday: number // 0 = Sunday
  slots: Slot[]
}

const partsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
})

export function londonParts(at: Date) {
  const parts = partsFormatter.formatToParts(at)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  return {
    y: get("year"),
    m: get("month"),
    d: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  }
}

/** Minutes London is ahead of UTC at that instant (0 in winter, 60 in summer). */
export function londonOffsetMinutes(at: Date): number {
  const p = londonParts(at)
  const asUtc = Date.UTC(p.y, p.m - 1, p.d, p.hour, p.minute, p.second)
  const whole = Math.floor(at.getTime() / 1000) * 1000
  return Math.round((asUtc - whole) / 60000)
}

/** The instant at which London clocks show y-m-d h:min. */
export function londonWallToUtc(day: Ymd, hour: number, minute = 0): Date {
  const guess = Date.UTC(day.y, day.m - 1, day.d, hour, minute)
  const first = londonOffsetMinutes(new Date(guess))
  let t = guess - first * 60000
  const second = londonOffsetMinutes(new Date(t))
  if (second !== first) t = guess - second * 60000
  return new Date(t)
}

const pad = (n: number) => String(n).padStart(2, "0")

export const ymdKey = (v: Ymd) => `${v.y}-${pad(v.m)}-${pad(v.d)}`

export function parseYmdKey(key: string): Ymd | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  return m ? { y: +m[1], m: +m[2], d: +m[3] } : null
}

export function addDays(v: Ymd, n: number): Ymd {
  const t = new Date(Date.UTC(v.y, v.m - 1, v.d + n))
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }
}

export const weekdayOf = (v: Ymd) => new Date(Date.UTC(v.y, v.m - 1, v.d)).getUTCDay()

/** ISO string carrying London's offset, which is what GHL expects with selectedTimezone. */
export function toLondonIso(at: Date): string {
  const off = londonOffsetMinutes(at)
  const p = londonParts(at)
  const sign = off >= 0 ? "+" : "-"
  const abs = Math.abs(off)
  return (
    `${p.y}-${pad(p.m)}-${pad(p.d)}T${pad(p.hour)}:${pad(p.minute)}:${pad(p.second)}` +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  )
}

export function londonToday(now: Date): Ymd {
  const p = londonParts(now)
  return { y: p.y, m: p.m, d: p.d }
}

function slotFor(day: Ymd, hour: number, durationMin: number): Slot {
  const start = londonWallToUtc(day, hour)
  const end = new Date(start.getTime() + durationMin * 60000)
  return {
    hour,
    label: `${pad(hour)}:00`,
    startUtc: start.toISOString(),
    startLondon: toLondonIso(start),
    endLondon: toLondonIso(end),
  }
}

/** Start times on one London day that are still bookable at `now`. */
export function slotsForDay(day: Ymd, now: Date, rules: BookingRules, durationMin: number): Slot[] {
  if (rules.closedWeekdays.includes(weekdayOf(day))) return []
  const earliest = now.getTime() + rules.minNoticeMinutes * 60000
  return rules.startHours
    .filter((h) => h * 60 + durationMin <= rules.closingHour * 60)
    .map((h) => slotFor(day, h, durationMin))
    .filter((s) => new Date(s.startUtc).getTime() >= earliest)
}

/** The days a visitor can pick: inside the window, open, and with a time left. */
export function bookableDays(now: Date, rules: BookingRules, durationMin: number): Day[] {
  const today = londonToday(now)
  const days: Day[] = []
  for (let i = 0; i < rules.windowDays; i++) {
    const day = addDays(today, i)
    const slots = slotsForDay(day, now, rules, durationMin)
    if (slots.length) days.push({ ...day, key: ymdKey(day), weekday: weekdayOf(day), slots })
  }
  return days
}

export type SlotCheck =
  | { ok: true; start: Date; end: Date; startLondon: string; endLondon: string }
  | { ok: false; reason: "unparseable" | "not_on_the_hour" | "outside_hours" | "closed_day" | "too_soon" | "too_far" }

/** The server's acceptance rule for a requested start time. */
export function checkSlot(startTime: string, now: Date, rules: BookingRules, durationMin: number): SlotCheck {
  const start = new Date(startTime)
  if (!startTime || Number.isNaN(start.getTime())) return { ok: false, reason: "unparseable" }

  const p = londonParts(start)
  if (p.minute !== 0 || p.second !== 0) return { ok: false, reason: "not_on_the_hour" }

  const day: Ymd = { y: p.y, m: p.m, d: p.d }
  if (rules.closedWeekdays.includes(weekdayOf(day))) return { ok: false, reason: "closed_day" }
  if (!rules.startHours.includes(p.hour) || p.hour * 60 + durationMin > rules.closingHour * 60) {
    return { ok: false, reason: "outside_hours" }
  }

  if (start.getTime() < now.getTime() + rules.minNoticeMinutes * 60000) return { ok: false, reason: "too_soon" }
  const lastDay = addDays(londonToday(now), rules.windowDays - 1)
  if (ymdKey(day) > ymdKey(lastDay)) return { ok: false, reason: "too_far" }

  const end = new Date(start.getTime() + durationMin * 60000)
  return { ok: true, start, end, startLondon: toLondonIso(start), endLondon: toLondonIso(end) }
}

/* Display helpers, pinned to London so the label matches the booking. */
const dayLong = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" })
const dayShort = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "short" })
const monthShort = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", month: "short" })

const noonUtc = (v: Ymd) => new Date(Date.UTC(v.y, v.m - 1, v.d, 12))

export const formatDayLong = (v: Ymd) => dayLong.format(londonWallToUtc(v, 12))
export const formatWeekdayShort = (v: Ymd) => dayShort.format(noonUtc(v))
export const formatMonthShort = (v: Ymd) => monthShort.format(noonUtc(v))
