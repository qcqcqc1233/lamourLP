/* ---------------------------------------------------------------------------
   POST /api/book: the only endpoint the booking pages talk to.

   Two flows share it:
   - The three original pages (eyebags, lift, nonsurgical-lift) keep their old
     behaviour byte for byte in what they send and receive.
   - Pages marked `modern` (face-neck) get the stricter flow: the server owns
     the price, duration and the start-time rules, contact details are checked
     without being rewritten, a repeated submit cannot create a second
     appointment, and the answer says exactly what happened.

   A missing appointment id is never reported as a booking.
--------------------------------------------------------------------------- */

import { parsePhoneNumberFromString } from "libphonenumber-js/max"

import { cleanAttribution, describeTouch, type Attribution } from "@/lib/attribution"
import { checkContact } from "@/lib/contact"
import { BALANCE_AT_CLINIC, CLINIC, FACE_NECK, formatGBP } from "@/lib/offer"
import { checkSlot, formatDayLong, londonParts } from "@/lib/schedule"
import {
  CALENDAR_VERSIONS,
  CONTACT_VERSIONS,
  ghl,
  ghlConfigured,
  GhlError,
  locationId,
  looksLikeSlotRefusal,
} from "@/lib/ghl.server"
import { buildFbc, sendCapi } from "@/lib/meta.server"
import { ignoreSlotValidationFor, SERVICES, type Service } from "@/lib/services.server"

export const dynamic = "force-dynamic"

const STORE_CLICK_IDS = () => process.env.GHL_STORE_CLICK_IDS === "true"

type Json = Record<string, unknown>
const reply = (status: number, body: Json) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } })

// ------------------------------------------------------------- rate limiting
// Per warm instance only; a speed bump for scripts, not a security boundary.
const seen = new Map<string, number[]>()
function rateLimited(ip: string, limit = 8, windowMs = 60000) {
  const now = Date.now()
  const hits = (seen.get(ip) || []).filter((t) => now - t < windowMs)
  hits.push(now)
  seen.set(ip, hits)
  if (seen.size > 5000) seen.clear()
  return hits.length > limit
}

// ------------------------------------------------------ duplicate submits
// A double tap or a retry after a dropped connection reuses the same eventId.
// While the first attempt is still running, the second waits for its answer
// instead of booking again. The GHL lookup below covers cold instances.
const inflight = new Map<string, { at: number; result: Promise<{ status: number; body: Json }> }>()
function once(key: string, run: () => Promise<{ status: number; body: Json }>) {
  const now = Date.now()
  for (const [k, v] of inflight) if (now - v.at > 10 * 60000) inflight.delete(k)
  const existing = inflight.get(key)
  if (existing) return existing.result
  const result = run()
  inflight.set(key, { at: now, result })
  // A failed attempt may be retried for real.
  result.then((r) => r.status !== 200 && inflight.delete(key)).catch(() => inflight.delete(key))
  return result
}

async function readBody(request: Request): Promise<Json> {
  const text = await request.text()
  try {
    const parsed = JSON.parse(text || "{}")
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

const splitName = (name: string) => {
  const [first, ...rest] = name.trim().split(/\s+/)
  return { firstName: first || name, lastName: rest.join(" ") || "-" }
}

const appointmentIdOf = (appt: Json) =>
  (appt?.id as string) || (appt?.appointmentId as string) || ((appt?.appointment as Json)?.id as string) || null

// ------------------------------------------------------------------- route
export async function POST(request: Request) {
  if (!ghlConfigured()) {
    console.error("missing env: GHL_PRIVATE_TOKEN / GHL_LOCATION_ID")
    return reply(500, { ok: false, error: "Booking is not configured yet." })
  }

  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim()
  if (rateLimited(ip || "unknown")) {
    return reply(429, { ok: false, code: "rate_limited", error: "Too many attempts. Please wait a minute." })
  }

  const b = await readBody(request)

  // Honeypot: a filled hidden field means a bot. Answer 200 so it stops retrying.
  if (b.company) return reply(200, { ok: true, appointmentId: null, status: "ignored" })

  const slug = String(b.slug || "")
  const svc = SERVICES[slug]
  if (!svc) return reply(400, { ok: false, error: "Unknown service." })

  const calendarId = svc.calendar()
  if (!calendarId) {
    console.error(`no calendar configured for slug "${slug}"`)
    return reply(500, { ok: false, error: "This treatment's calendar is not set up yet." })
  }

  const ctx = { ip, ua: request.headers.get("user-agent") || undefined }
  if (svc.modern) {
    const eventId = typeof b.eventId === "string" && b.eventId.length <= 80 ? b.eventId : ""
    const run = () => bookModern(b, slug, svc, calendarId, ctx)
    const { status, body } = eventId ? await once(`${slug}:${eventId}`, run) : await run()
    return reply(status, body)
  }
  return bookLegacy(b, slug, svc, calendarId, ctx)
}

// ------------------------------------------------------- the original pages
async function bookLegacy(b: Json, slug: string, svc: Service, calendarId: string, ctx: { ip: string; ua?: string }) {
  const { name, email, phone, startTime, endTime, eventId, fbp, fbc, fbclid, pageUrl } = b as Record<string, string>

  if (!name || !email || !phone || !startTime) {
    return reply(400, { ok: false, error: "Missing required fields." })
  }
  if (!/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(email) || !/^\+\d{8,15}$/.test(phone)) {
    return reply(400, { ok: false, error: "Invalid email or phone." })
  }
  const start = new Date(startTime)
  if (Number.isNaN(start.getTime()) || start.getTime() < Date.now() - 60000) {
    return reply(400, { ok: false, error: "That time is no longer available." })
  }

  const isTest = (b.test as unknown) === true
  const { firstName, lastName } = splitName(String(name))

  try {
    const contactRes = await ghl<Json>("POST", "/contacts/upsert", {
      locationId: locationId(),
      firstName: (isTest ? "[TEST] " : "") + firstName,
      lastName,
      email,
      phone,
      source: `${svc.name} LP`,
      tags: [svc.name].concat(isTest ? ["TEST-DONOTCOUNT"] : []),
      ...(STORE_CLICK_IDS()
        ? {
            customFields: [
              { key: "fb_fbc", fieldValue: buildFbc(fbc, fbclid) || "" },
              { key: "fb_fbp", fieldValue: fbp || "" },
              { key: "booking_service", fieldValue: svc.name },
              { key: "booking_value", fieldValue: String(svc.value) },
            ],
          }
        : {}),
    }, CONTACT_VERSIONS)

    const contactId = ((contactRes?.contact as Json)?.id as string) || (contactRes?.id as string)
    if (!contactId) throw new GhlError("Contact was not created.", 502, contactRes)

    const userId = svc.user()
    const end = endTime || new Date(start.getTime() + svc.durationMin * 60000).toISOString()

    const appt = await ghl<Json>("POST", "/calendars/events/appointments", {
      calendarId,
      locationId: locationId(),
      contactId,
      ...(userId ? { assignedUserId: userId } : {}),
      startTime,
      endTime: end,
      title: `${name} — ${svc.name}`,
      appointmentStatus: "confirmed",
      meetingLocationType: "custom",
      toNotify: !isTest,
      ignoreFreeSlotValidation: ignoreSlotValidationFor(svc),
      selectedTimezone: process.env.BUSINESS_TZ || "Europe/London",
    }, CALENDAR_VERSIONS)

    const appointmentId = appointmentIdOf(appt)

    let capi: unknown
    if (appointmentId && !isTest) {
      capi = await sendCapi({
        eventName: "Schedule",
        eventId,
        email,
        phone,
        fbp,
        fbc: buildFbc(fbc, fbclid),
        contentName: svc.name,
        pageUrl,
        ip: ctx.ip,
        ua: ctx.ua,
        value: svc.value,
      }).catch((e) => {
        console.error("capi failed", e)
        return { ok: false, error: String(e) }
      })
    }

    console.log(JSON.stringify({
      at: "booking", slug, calendarId: calendarId.slice(-4), appointmentId,
      value: svc.value, test: isTest, capi: capi || "skipped",
    }))

    return reply(200, {
      ok: true,
      appointmentId,
      status: appointmentId ? "booked" : "lead_only",
      contactId,
      ...(isTest ? { service: svc.name, calendarTail: calendarId.slice(-4), value: svc.value } : {}),
    })
  } catch (e) {
    const err = e as GhlError
    console.error("booking failed", slug, err.status, err.message, err.body || "")
    const taken = /slot|available|conflict/i.test(err.message || "")
    return reply(err.status && err.status < 500 ? 400 : 502, {
      ok: false,
      error: taken ? "That time was just taken. Please pick another slot." : err.message || "Booking failed.",
    })
  }
}

// ------------------------------------------------------- the face & neck page
const SLOT_TAKEN = "That time is no longer available. Please choose another appointment."
const UPSTREAM =
  `We couldn't confirm your booking just now. Your details are still here, ` +
  `so please try again, or call us on ${CLINIC.phoneDisplay}.`

async function bookModern(
  b: Json,
  slug: string,
  svc: Service,
  calendarId: string,
  ctx: { ip: string; ua?: string },
): Promise<{ status: number; body: Json }> {
  const modern = svc.modern!
  const isTest = b.test === true
  const eventId = typeof b.eventId === "string" ? b.eventId : undefined

  const contact = checkContact(b as Json, parsePhoneNumberFromString)
  if (!contact.ok) {
    const first = Object.values(contact.errors)[0]
    return { status: 400, body: { ok: false, code: "invalid", fields: contact.errors, error: first } }
  }

  const slot = checkSlot(String(b.startTime || ""), new Date(), modern.rules, svc.durationMin)
  if (!slot.ok) {
    return { status: 409, body: { ok: false, code: "slot_unavailable", reason: slot.reason, error: SLOT_TAKEN } }
  }

  const { name, email, phone } = contact.value
  const { firstName, lastName } = splitName(name)
  const attribution = cleanAttribution(b.attribution)
  const fbp = typeof b.fbp === "string" ? b.fbp : undefined
  const fbclid = typeof b.fbclid === "string" ? b.fbclid : attribution.last?.fbclid || attribution.first?.fbclid
  const fbc = buildFbc(typeof b.fbc === "string" ? b.fbc : undefined, fbclid)
  const pageUrl = typeof b.pageUrl === "string" ? b.pageUrl.slice(0, 500) : undefined

  let contactId: string | undefined
  try {
    const contactRes = await ghl<Json>("POST", "/contacts/upsert", {
      locationId: locationId(),
      firstName: (isTest ? "[TEST] " : "") + firstName,
      lastName,
      email,
      phone,
      source: modern.source,
      // "face-neck-deposit-due" tells the clinic who still needs a deposit call.
      tags: [svc.name, ...modern.tags, "face-neck-deposit-due"].concat(isTest ? ["TEST-DONOTCOUNT"] : []),
      ...(STORE_CLICK_IDS()
        ? {
            customFields: [
              { key: "fb_fbc", fieldValue: fbc || "" },
              { key: "fb_fbp", fieldValue: fbp || "" },
              { key: "booking_service", fieldValue: svc.name },
              { key: "booking_value", fieldValue: String(svc.value) },
            ],
          }
        : {}),
    }, CONTACT_VERSIONS)
    contactId = ((contactRes?.contact as Json)?.id as string) || (contactRes?.id as string)
    if (!contactId) throw new GhlError("Contact was not created.", 502, contactRes)

    // Already booked at this exact time (a retry after a dropped response)?
    const existing = await findExistingAppointment(contactId, calendarId, slot.start).catch(() => null)
    if (existing) {
      console.log(JSON.stringify({ at: "booking", slug, duplicateOf: existing, test: isTest }))
      return { status: 200, body: confirmed(existing, slot, { duplicate: true }) }
    }

    const userId = svc.user()
    const appt = await ghl<Json>("POST", "/calendars/events/appointments", {
      calendarId,
      locationId: locationId(),
      contactId,
      ...(userId ? { assignedUserId: userId } : {}),
      startTime: slot.startLondon,
      endTime: slot.endLondon,
      title: `${name} — ${svc.name}`,
      appointmentStatus: "confirmed",
      meetingLocationType: "custom",
      toNotify: !isTest,
      ignoreFreeSlotValidation: modern.ignoreSlotValidation(),
      selectedTimezone: modern.rules.timeZone,
    }, CALENDAR_VERSIONS)

    const appointmentId = appointmentIdOf(appt)
    if (!appointmentId) {
      console.error("appointment response had no id", slug, JSON.stringify(appt).slice(0, 300))
      return {
        status: 200,
        body: { ok: true, status: "lead_only", appointmentId: null, contactId },
      }
    }

    // Everything below is best effort: the appointment already exists.
    const [note, capi, cleanup] = await Promise.all([
      isTest ? null : addBookingNote(contactId, slot, attribution, pageUrl).catch((e) => ({ ok: false, error: String(e) })),
      isTest
        ? null
        : sendCapi({
            eventName: "Schedule",
            eventId: eventId || `sched_${appointmentId}`,
            email,
            phone,
            fbp,
            fbc,
            contentName: svc.name,
            pageUrl,
            ip: ctx.ip,
            ua: ctx.ua,
            value: svc.value,
          }).catch((e) => ({ ok: false, error: String(e) })),
      // A test booking proves the whole path, then gives the hour back.
      isTest ? deleteAppointment(appointmentId).catch((e) => ({ ok: false, error: String(e) })) : null,
    ])

    console.log(JSON.stringify({
      at: "booking", slug, calendarId: calendarId.slice(-4), appointmentId,
      value: svc.value, test: isTest, note, capi: capi || "skipped", cleanup: cleanup || undefined,
    }))

    return {
      status: 200,
      body: confirmed(appointmentId, slot, isTest ? { test: true, cleanedUp: Boolean((cleanup as Json)?.ok) } : {}),
    }
  } catch (e) {
    const err = e as GhlError
    console.error("booking failed", slug, err.status, err.message, err.body || "")
    if (looksLikeSlotRefusal(e)) {
      return { status: 409, body: { ok: false, code: "slot_unavailable", reason: "calendar", error: SLOT_TAKEN } }
    }
    return { status: 502, body: { ok: false, code: "upstream", error: UPSTREAM, contactCaptured: Boolean(contactId) } }
  }
}

function confirmed(appointmentId: string, slot: { startLondon: string; endLondon: string }, extra: Json) {
  return {
    ok: true,
    status: "booked",
    appointmentId,
    booking: {
      service: FACE_NECK.title,
      start: slot.startLondon,
      end: slot.endLondon,
      durationMin: FACE_NECK.durationMin,
      currency: FACE_NECK.currency,
      total: FACE_NECK.totalPrice,
      paidNow: FACE_NECK.payNow,
      depositByPhone: FACE_NECK.deposit,
      dueAtClinic: BALANCE_AT_CLINIC,
    },
    ...extra,
  }
}

async function findExistingAppointment(contactId: string, calendarId: string, start: Date) {
  const res = await ghl<{ events?: Json[] }>("GET", `/contacts/${contactId}/appointments`, undefined, ["2021-07-28"], 5000)
  const match = (res.events || []).find((ev) => {
    const status = String(ev.appointmentStatus || ev.status || "").toLowerCase()
    return (
      ev.calendarId === calendarId &&
      new Date(String(ev.startTime)).getTime() === start.getTime() &&
      !/cancel|invalid|noshow/.test(status) &&
      !ev.deleted
    )
  })
  return match ? String(match.id) : null
}

async function deleteAppointment(appointmentId: string) {
  await ghl("DELETE", `/calendars/events/${appointmentId}`, undefined, ["2021-04-15"], 8000)
  return { ok: true }
}

async function addBookingNote(
  contactId: string,
  slot: { start: Date; startLondon: string },
  attribution: Attribution,
  pageUrl?: string,
) {
  const p = londonParts(slot.start)
  const when = `${formatDayLong({ y: p.y, m: p.m, d: p.d })}, ${String(p.hour).padStart(2, "0")}:00 London time`
  const body = [
    `Booked online: ${FACE_NECK.title} (${FACE_NECK.durationMin} min)`,
    `When: ${when}`,
    `Price: ${formatGBP(FACE_NECK.totalPrice)}. Paid online: ${formatGBP(FACE_NECK.payNow)}.`,
    `DEPOSIT DUE: call the client to take ${formatGBP(FACE_NECK.deposit)} by phone before the treatment. Balance at the clinic: ${formatGBP(BALANCE_AT_CLINIC)}.`,
    `First touch: ${describeTouch(attribution.first)}`,
    `Last touch: ${describeTouch(attribution.last)}`,
    pageUrl ? `Page: ${pageUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n")
  await ghl("POST", `/contacts/${contactId}/notes`, { body }, ["2021-07-28"], 8000)
  return { ok: true }
}
