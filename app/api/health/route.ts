/* ---------------------------------------------------------------------------
   GET /api/health: is everything wired?

   Answers the question you have after pasting environment variables into
   Vercel: did each treatment get a calendar, and did I paste the right one. It
   never returns a secret, only booleans and the last four characters of ids.

   GET /api/health?availability=1 also asks GHL which of the face & neck page's
   start times the calendar itself has free over the booking window; the page
   shows only those (lib/availability.server.ts).
--------------------------------------------------------------------------- */

import { faceNeckAvailability } from "@/lib/availability.server"
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
  const { offered, free } = await faceNeckAvailability(SERVICES["face-neck"].calendar()!)
  if (!offered.length) return { checked: true, offered: 0 }
  const freeSet = new Set(free)
  const notFree = offered.filter((iso) => !freeSet.has(iso))
  return {
    checked: true,
    offered: offered.length,
    freeInCalendar: free.length,
    // Times the clinic's rules allow but the calendar does not have free
    // (booked, or outside the calendar's own hours). The page hides them.
    notFreeSample: notFree.slice(0, 12),
  }
}
