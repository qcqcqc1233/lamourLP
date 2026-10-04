/* ---------------------------------------------------------------------------
   GET /api/health: is everything wired?

   Answers the question you have after pasting environment variables into
   Vercel: did each treatment get a calendar, and did I paste the right one. It
   never returns a secret, only booleans and the last four characters of ids.

   GET /api/health?availability=1 also asks GHL which of the face & neck page's
   fixed start times the calendar itself considers free over the booking
   window. That is how to check, before refusing double bookings, that the
   calendar's own opening hours match the times the page offers.
--------------------------------------------------------------------------- */

import { FACE_NECK, FACE_NECK_RULES } from "@/lib/offer"
import { bookableDays } from "@/lib/schedule"
import { ghl } from "@/lib/ghl.server"
import { ignoreSlotValidationFor, SERVICES } from "@/lib/services.server"

export const dynamic = "force-dynamic"

const tail = (v?: string) => (v ? "…" + String(v).slice(-4) : null)

export async function GET(request: Request) {
  const services: Record<string, { name: string; calendar: string | null; assignedUser: string | null; ready: boolean; doubleBookingAllowed: boolean }> = {}
  for (const [slug, svc] of Object.entries(SERVICES)) {
    const cal = svc.calendar()
    services[slug] = {
      name: svc.name,
      calendar: tail(cal),
      assignedUser: tail(svc.user()),
      ready: Boolean(cal),
      doubleBookingAllowed: ignoreSlotValidationFor(svc),
    }
  }

  // Two treatments on one calendar is usually a paste slip. face-neck sharing
  // the non-surgical calendar is deliberate, so it is left out of the check.
  const byCalendar: Record<string, string[]> = {}
  for (const [slug, s] of Object.entries(services)) {
    if (!s.calendar || slug === "face-neck") continue
    ;(byCalendar[s.calendar] ||= []).push(slug)
  }
  const duplicateCalendars = Object.values(byCalendar).filter((g) => g.length > 1)

  const out: Record<string, unknown> = {
    token: Boolean(process.env.GHL_PRIVATE_TOKEN),
    location: tail(process.env.GHL_LOCATION_ID),
    timezone: process.env.BUSINESS_TZ || "Europe/London",
    doubleBookingAllowed: process.env.GHL_IGNORE_SLOT_VALIDATION !== "false",
    metaCapi: {
      pixel: tail(process.env.META_PIXEL_ID),
      token: Boolean(process.env.META_CAPI_TOKEN),
      testEventCode: process.env.META_TEST_EVENT_CODE || null,
    },
    services,
    ...(duplicateCalendars.length ? { warning: "two treatments share a calendar", duplicateCalendars } : {}),
  }
  const allReady = Boolean(out.token) && Boolean(process.env.GHL_LOCATION_ID) && Object.values(services).every((s) => s.ready)
  out.allReady = allReady

  if (new URL(request.url).searchParams.get("availability") === "1" && allReady) {
    out.faceNeckAvailability = await compareAvailability().catch((e) => ({ checked: false, error: String(e?.message || e) }))
  }

  return Response.json(out, { status: allReady ? 200 : 503, headers: { "Cache-Control": "no-store" } })
}

async function compareAvailability() {
  const calendarId = SERVICES["face-neck"].calendar()!
  const now = new Date()
  const days = bookableDays(now, FACE_NECK_RULES, FACE_NECK.durationMin)
  const offered = days.flatMap((d) => d.slots.map((s) => s.startUtc))
  if (!offered.length) return { checked: true, offered: 0 }

  const startDate = new Date(offered[0]).getTime()
  const endDate = new Date(offered[offered.length - 1]).getTime() + 3600000
  const res = await ghl<Record<string, { slots?: string[] }>>(
    "GET",
    `/calendars/${calendarId}/free-slots?startDate=${startDate}&endDate=${endDate}&timezone=${encodeURIComponent(FACE_NECK_RULES.timeZone)}`,
    undefined,
    ["2021-04-15"],
    10000,
  )
  const free = new Set<number>()
  for (const [key, day] of Object.entries(res)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) continue
    for (const s of day?.slots || []) free.add(new Date(s).getTime())
  }
  const notFree = offered.filter((iso) => !free.has(new Date(iso).getTime()))
  return {
    checked: true,
    offered: offered.length,
    freeInCalendar: offered.length - notFree.length,
    // London wall times the page offers but the calendar would refuse.
    notFreeSample: notFree.slice(0, 12),
  }
}
