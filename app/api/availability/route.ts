/* GET /api/availability: the face & neck start times the calendar still has
   free over the booking window, as ISO instants. `free: null` means the
   calendar could not be asked; the page then offers the clinic's rules and
   /api/book still checks before booking. */

import { faceNeckAvailability } from "@/lib/availability.server"
import { ghlConfigured } from "@/lib/ghl.server"
import { SERVICES } from "@/lib/services.server"

const noStore = { "Cache-Control": "no-store" }

export async function GET() {
  const calendarId = SERVICES["face-neck"].calendar()
  if (!ghlConfigured() || !calendarId) return Response.json({ ok: false, free: null }, { headers: noStore })
  try {
    const { free } = await faceNeckAvailability(calendarId)
    return Response.json({ ok: true, free }, { headers: noStore })
  } catch (e) {
    console.error("availability failed", e instanceof Error ? e.message : e)
    return Response.json({ ok: false, free: null }, { headers: noStore })
  }
}
