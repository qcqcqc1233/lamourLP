/* Integration test for POST /api/book with GHL and Meta replaced by a fake.
   Run with: npm run test:api */

import assert from "node:assert/strict"
import { beforeEach, test } from "node:test"

process.env.GHL_PRIVATE_TOKEN = "pit-test"
process.env.GHL_LOCATION_ID = "loc_test_so8M"
process.env.GHL_CALENDAR_ID_NONSURGICAL = "cal_test_kb6B"
process.env.GHL_CALENDAR_ID_EYEBAGS = "cal_test_dhxT"
process.env.META_PIXEL_ID = "1178133073434960"
process.env.META_CAPI_TOKEN = "capi-test"

type Call = { method: string; url: string; body: Record<string, unknown> | null }
let calls: Call[] = []
let existing: Record<string, unknown>[] = []
let refuseSlot = false
let createDelayMs = 0
// What the calendar's free-slots answer says: every hour free, none, or no answer.
let calendar: "free" | "taken" | "down" = "free"

globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input)
  const method = init?.method || "GET"
  const body = init?.body ? JSON.parse(String(init.body)) : null
  calls.push({ method, url, body })
  const json = (status: number, data: unknown) => new Response(JSON.stringify(data), { status })

  if (url.includes("graph.facebook.com")) return json(200, { events_received: 1, fbtrace_id: "x" })
  if (url.includes("/free-slots")) {
    if (calendar === "down") return json(503, { message: "unavailable" })
    const q = new URL(url).searchParams
    const slots: string[] = []
    if (calendar === "free") {
      for (let t = Number(q.get("startDate")); t <= Number(q.get("endDate")); t += 3600000) {
        slots.push(new Date(Math.ceil(t / 3600000) * 3600000).toISOString())
      }
    }
    return json(200, { "2026-01-01": { slots } })
  }
  if (url.endsWith("/contacts/upsert")) return json(200, { contact: { id: "contact_1" } })
  if (url.includes("/contacts/contact_1/appointments")) return json(200, { events: existing })
  if (url.endsWith("/contacts/contact_1/notes")) return json(201, { note: { id: "n1" } })
  if (url.endsWith("/calendars/events/appointments")) {
    if (createDelayMs) await new Promise((r) => setTimeout(r, createDelayMs))
    if (refuseSlot) return json(400, { message: "The slot you have selected is no longer available" })
    return json(201, { id: `appt_${calls.length}` })
  }
  if (method === "DELETE" && url.includes("/calendars/events/")) return json(200, { succeded: true })
  return json(404, { message: "unexpected " + url })
}) as typeof fetch

const { POST } = await import("./route")

let ipCounter = 0
const post = (body: Record<string, unknown>) =>
  POST(
    new Request("http://localhost/api/book", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": `10.0.0.${++ipCounter}` },
      body: JSON.stringify(body),
    }),
  )

// A Tuesday at 11:00 London, comfortably inside the window from "now".
function nextTuesdayAt11() {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + ((2 - d.getUTCDay() + 7) % 7 || 7))
  const ymd = d.toISOString().slice(0, 10)
  const probe = new Date(`${ymd}T12:00:00Z`)
  const londonHour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", hourCycle: "h23" }).format(probe))
  const offset = londonHour - 12
  return `${ymd}T11:00:00+0${offset}:00`
}

const base = () => ({
  slug: "face-neck",
  name: "Test Person",
  email: "test@example.com",
  phone: "+447123456789",
  startTime: nextTuesdayAt11(),
  eventId: `sched_${Math.random()}`,
  attribution: { first: { utm_source: "facebook", utm_campaign: "face-neck-a", landing_page: "/face-neck" } },
})

const created = () => calls.filter((c) => c.url.endsWith("/calendars/events/appointments"))
const capi = () => calls.filter((c) => c.url.includes("graph.facebook.com"))

beforeEach(() => {
  calls = []
  existing = []
  refuseSlot = false
  createDelayMs = 0
  calendar = "free"
})

test("a good booking creates one appointment, a CRM note and one server Schedule", async () => {
  const body = base()
  const res = await post(body)
  const data = await res.json()
  assert.equal(res.status, 200)
  assert.equal(data.status, "booked")
  assert.ok(data.appointmentId)
  assert.deepEqual(
    { total: data.booking.total, paidNow: data.booking.paidNow, deposit: data.booking.depositByPhone, dueAtClinic: data.booking.dueAtClinic },
    { total: 149, paidNow: 0, deposit: 35, dueAtClinic: 114 },
  )

  assert.equal(created().length, 1)
  const appt = created()[0].body!
  assert.equal(appt.calendarId, "cal_test_kb6B", "face & neck books into the non-surgical calendar")
  assert.equal(appt.startTime, body.startTime)
  assert.equal(new Date(String(appt.endTime)).getTime() - new Date(String(appt.startTime)).getTime(), 3600000)

  const upsert = calls.find((c) => c.url.endsWith("/contacts/upsert"))!.body!
  assert.deepEqual(upsert.tags, ["Non-Surgical Face & Neck Lift Treatment", "face-neck-lp", "face-neck-deposit-due"])
  assert.equal(upsert.source, "Face & Neck LP (/non-surgical-face-neck)")

  const note = calls.find((c) => c.url.endsWith("/notes"))!.body!
  assert.match(String(note.body), /utm_campaign=face-neck-a/)
  assert.match(String(note.body), /DEPOSIT DUE: call the client to take £35 by phone/)
  assert.match(String(note.body), /Balance at the clinic: £114/)

  assert.equal(capi().length, 1)
  const ev = (capi()[0].body!.data as Record<string, unknown>[])[0]
  assert.equal(ev.event_name, "Schedule")
  assert.equal(ev.event_id, body.eventId, "same id as the browser pixel, so Meta keeps one")
})

test("a double tap with the same eventId books once", async () => {
  createDelayMs = 50
  const body = base()
  const [a, b] = await Promise.all([post(body), post(body)])
  const [da, db] = [await a.json(), await b.json()]
  assert.equal(created().length, 1)
  assert.equal(da.appointmentId, db.appointmentId)
  assert.equal(capi().length, 1)
})

test("a retry after a dropped response finds the existing appointment instead of booking again", async () => {
  const body = base()
  existing = [{ id: "appt_earlier", calendarId: "cal_test_kb6B", startTime: body.startTime, appointmentStatus: "confirmed" }]
  const res = await post(body)
  const data = await res.json()
  assert.equal(data.appointmentId, "appt_earlier")
  assert.equal(data.duplicate, true)
  assert.equal(created().length, 0)
  assert.equal(capi().length, 0)
})

test("a time the calendar refuses comes back as slot_unavailable, never as a booking", async () => {
  refuseSlot = true
  const res = await post(base())
  const data = await res.json()
  assert.equal(res.status, 409)
  assert.equal(data.code, "slot_unavailable")
  assert.equal(data.error, "That time is no longer available. Please choose another appointment.")
  assert.equal(capi().length, 0)
})

test("an hour someone else has just taken is refused, and she is saved without tags", async () => {
  calendar = "taken"
  const res = await post(base())
  const data = await res.json()
  assert.equal(res.status, 409)
  assert.equal(data.code, "slot_unavailable")
  assert.equal(created().length, 0)
  const upsert = calls.find((c) => c.url.endsWith("/contacts/upsert"))!.body!
  assert.equal(upsert.tags, undefined, "no workflow or deposit call for a booking that does not exist")
  assert.equal(capi().length, 0)
})

test("her own retry, when her first booking already took the hour, still finds that booking", async () => {
  calendar = "taken"
  const body = base()
  existing = [{ id: "appt_mine", calendarId: "cal_test_kb6B", startTime: body.startTime, appointmentStatus: "confirmed" }]
  const data = await (await post(body)).json()
  assert.equal(data.appointmentId, "appt_mine")
  assert.equal(data.duplicate, true)
  assert.equal(created().length, 0)
})

test("if the calendar cannot be asked, the booking still goes through", async () => {
  calendar = "down"
  const data = await (await post(base())).json()
  assert.equal(data.status, "booked")
  assert.equal(created().length, 1)
})

test("times outside the clinic's rules are refused before anything reaches GHL", async () => {
  for (const startTime of ["2026-10-11T10:00:00+01:00", "2030-01-07T10:00:00Z", nextTuesdayAt11().replace("T11:", "T08:")]) {
    const res = await post({ ...base(), startTime })
    assert.equal(res.status, 409)
  }
  assert.equal(calls.length, 0)
})

test("bad contact details are refused field by field, without touching GHL", async () => {
  const res = await post({ ...base(), email: "jane doe@example.com", phone: "0712345" })
  const data = await res.json()
  assert.equal(res.status, 400)
  assert.deepEqual(Object.keys(data.fields).sort(), ["email", "phone"])
  assert.equal(calls.length, 0)
})

test("test mode tags the contact, sends nothing to Meta and gives the hour back", async () => {
  const res = await post({ ...base(), test: true })
  const data = await res.json()
  assert.equal(data.status, "booked")
  assert.equal(data.test, true)
  assert.equal(data.cleanedUp, true)
  const upsert = calls.find((c) => c.url.endsWith("/contacts/upsert"))!.body!
  assert.ok((upsert.tags as string[]).includes("TEST-DONOTCOUNT"))
  assert.ok(!(upsert.tags as string[]).includes("face-neck-deposit-due"), "no deposit call for a test")
  assert.equal(created()[0].body!.toNotify, false)
  assert.ok(calls.some((c) => c.method === "DELETE"))
  assert.equal(capi().length, 0)
  assert.ok(!calls.some((c) => c.url.endsWith("/notes")))
})

test("the original eye bags page keeps its old request and response exactly", async () => {
  const start = new Date(Date.now() + 3 * 86400000).toISOString()
  const res = await post({ slug: "eyebags", name: "Test Person", email: "test@example.com", phone: "+447123456789", startTime: start, eventId: "e1" })
  const data = await res.json()
  assert.equal(res.status, 200)
  assert.deepEqual(Object.keys(data).sort(), ["appointmentId", "contactId", "ok", "status"])
  const appt = created()[0].body!
  assert.equal(appt.calendarId, "cal_test_dhxT")
  assert.equal(appt.ignoreFreeSlotValidation, true)
  assert.equal(calls.find((c) => c.url.endsWith("/contacts/upsert"))!.body!.source, "Bye Bye Eye Bags LP")
})
