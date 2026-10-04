/* ---------------------------------------------------------------------------
   POST /api/crm-event: the outcome half of the funnel.

   /api/book tells Meta a booking happened. This tells Meta what the booking
   turned out to be worth: she showed up, or she showed up and paid. GHL calls
   it from a workflow webhook once the outcome is known, carrying the click
   identifiers /api/book parked on the contact, so an event fired a week later
   still matches the ad click that produced the booking.

   Ported unchanged from the original api/crm-event.js.
--------------------------------------------------------------------------- */

import crypto from "node:crypto"

import { sha256 } from "@/lib/meta.server"

export const dynamic = "force-dynamic"

const SITE_URL = () => (process.env.SITE_URL || "https://lamoure-eyebag.vercel.app").replace(/\/+$/, "")
// Meta's qualified-leads optimisation and its custom-conversion builder are both
// scoped to Website. The conversion did originate on the page, so website is a
// fair description. Flip this env var to system_generated if that stops being true.
const ACTION_SOURCE = () => process.env.META_CRM_ACTION_SOURCE || "website"

// Which page each treatment was booked from, for event_source_url.
const SERVICE_PATHS: Record<string, string> = {
  "Bye Bye Eye Bags": "/",
  "Face & Neck Double Lift Skin Tightening": "/lift",
  "Non-Surgical Face & Neck Lift Treatment": "/nonsurgical-lift",
}
const sourceUrlFor = (svc: unknown) => SITE_URL() + (SERVICE_PATHS[String(svc || "").trim()] || "/")

// Only these can be sent. An open event name would let anyone who found the URL
// write arbitrary conversions into the ad account's pixel.
const ALLOWED = new Set(["Purchase", "Qualified", "Showed", "NoShow"])
// GHL's webhook builder is easy to get slightly wrong (a stray space, a
// lowercase q). Accept those and normalise.
const CANONICAL = new Map([...ALLOWED].map((e) => [e.toLowerCase(), e]))

type Json = Record<string, unknown>
const reply = (status: number, body: Json) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } })

export async function POST(request: Request) {
  const SECRET = process.env.CRM_WEBHOOK_SECRET
  const META_PIXEL_ID = process.env.META_PIXEL_ID
  const META_CAPI_TOKEN = process.env.META_CAPI_TOKEN
  const META_GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v24.0"
  const META_TEST_CODE = process.env.META_TEST_EVENT_CODE
  const CURRENCY = process.env.META_CURRENCY || "GBP"

  if (!SECRET) {
    console.error("CRM_WEBHOOK_SECRET is not set")
    return reply(500, { ok: false, error: "Not configured" })
  }
  // Constant-time compare so the secret can't be guessed a character at a time.
  const given = String(request.headers.get("x-webhook-secret") || "")
  const ok = given.length === SECRET.length && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(SECRET))
  if (!ok) return reply(401, { ok: false, error: "Unauthorized" })

  let raw: Json = {}
  try {
    raw = JSON.parse((await request.text()) || "{}")
  } catch {
    raw = {}
  }
  // GHL posts contact fields at the top level and nests the webhook's Custom
  // Data rows under "customData". Flatten both; the explicit rows win.
  const b: Json = {
    ...raw,
    ...(raw.customData && typeof raw.customData === "object" ? (raw.customData as Json) : {}),
  }

  const { email, phone, event, appointmentId, eventTime, test } = b as Record<string, unknown>
  const pageUrl = b.pageUrl || b.page_url
  const fbc = b.fbc || b.fb_fbc
  const fbp = b.fbp || b.fb_fbp
  const service = b.service || b.booking_service
  const value = b.value !== undefined ? b.value : b.booking_value

  const eventName = CANONICAL.get(String(event ?? "").trim().toLowerCase())
  if (!eventName) {
    return reply(400, {
      ok: false,
      error: `event must be one of ${[...ALLOWED].join(", ")}`,
      received: event === undefined ? null : event,
      bodyKeys: Object.keys(b),
    })
  }
  if (!email && !phone) {
    return reply(400, { ok: false, error: "email or phone is required to match the person" })
  }
  if (!META_PIXEL_ID || !META_CAPI_TOKEN) {
    return reply(500, { ok: false, error: "Meta CAPI is not configured" })
  }

  // One id per outcome per person, so a retried workflow collapses into one
  // conversion. A merge token that did not resolve ("{{appointment.id}}") is the
  // same string for every contact, so anything still looking like a token is
  // discarded in favour of hashing the person plus the day.
  const apptId =
    typeof appointmentId === "string" && appointmentId.trim() && !appointmentId.includes("{{") && !appointmentId.includes("}}")
      ? appointmentId.trim()
      : null
  const day = new Date().toISOString().slice(0, 10)
  const eventId = `crm_${eventName}_${apptId || sha256(String(email || phone) + eventName + day).slice(0, 16)}`

  const user_data: Json = {}
  if (email) user_data.em = [sha256(String(email))]
  if (phone) user_data.ph = [sha256(String(phone).replace(/\D/g, ""))]
  if (fbc) user_data.fbc = fbc
  if (fbp) user_data.fbp = fbp

  const numericValue = value !== undefined && value !== null && value !== "" ? Number(value) : undefined

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor((eventTime ? new Date(String(eventTime)).getTime() : Date.now()) / 1000),
        event_id: eventId,
        action_source: ACTION_SOURCE(),
        ...(ACTION_SOURCE() === "website" ? { event_source_url: pageUrl || sourceUrlFor(service) } : {}),
        user_data,
        custom_data: {
          ...(service ? { content_name: service } : {}),
          ...(Number.isFinite(numericValue) ? { value: numericValue, currency: CURRENCY } : {}),
        },
      },
    ],
    ...(META_TEST_CODE ? { test_event_code: META_TEST_CODE } : {}),
  }

  // GHL sends every custom-data value as text, so "test" arrives as "true".
  if (test === true || String(test).trim().toLowerCase() === "true") {
    return reply(200, { ok: true, dryRun: true, wouldSend: payload })
  }

  try {
    const r = await fetch(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/${META_PIXEL_ID}/events?access_token=${META_CAPI_TOKEN}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) },
    )
    const body = (await r.json().catch(() => ({}))) as Json
    console.log(JSON.stringify({
      at: "crm-event", event: eventName, appointmentId: apptId, value: numericValue,
      status: r.status, events_received: body.events_received, fbtrace_id: body.fbtrace_id,
    }))
    if (!r.ok) {
      console.error("capi rejected", r.status, JSON.stringify(body))
      return reply(502, { ok: false, error: (body?.error as Json)?.message || `Meta returned ${r.status}` })
    }
    return reply(200, { ok: true, event: eventName, eventId, events_received: body.events_received })
  } catch (e) {
    console.error("crm-event failed", e)
    return reply(502, { ok: false, error: String((e as Error)?.message || e) })
  }
}
