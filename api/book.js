/* ---------------------------------------------------------------------------
   POST /api/book — the only endpoint the pages talk to.

   The browser sends a SLUG ("eyebags", "lift", …), never a calendar id. The
   server maps that slug to a calendar through environment variables. If the
   page could name its own calendar, anyone could point a booking at any
   calendar in the sub-account, so the mapping stays here.
--------------------------------------------------------------------------- */

import crypto from "node:crypto";

const GHL_BASE = "https://services.leadconnectorhq.com";

const CONTACT_VERSIONS  = [process.env.GHL_VERSION_CONTACTS  || "v3", "2021-07-28"];
const CALENDAR_VERSIONS = [process.env.GHL_VERSION_CALENDARS || "v3", "2021-04-15"];

const TOKEN       = process.env.GHL_PRIVATE_TOKEN;
const LOCATION_ID = process.env.GHL_LOCATION_ID;
const TZ          = process.env.BUSINESS_TZ || "Europe/London";

// true = book even if the calendar says the slot is taken (what the original
// pages do). false = GHL rejects the clash and the visitor picks another time.
const IGNORE_SLOT_VALIDATION = process.env.GHL_IGNORE_SLOT_VALIDATION !== "false";

// Write the Meta click ids onto the contact. Only turn this on once the four
// custom fields exist in GHL (see the customFields block below).
const STORE_CLICK_IDS = process.env.GHL_STORE_CLICK_IDS === "true";

// Read env at request time, not at import, so /api/health reports the truth
// after someone adds a variable and redeploys.
const env = (...names) => names.map((n) => process.env[n]).find(Boolean);

export const SERVICES = {
  "eyebags": {
    name: "Bye Bye Eye Bags",
    durationMin: 60,
    value: 99,    // what a booked appointment is worth, sent to Meta
    // GHL_CALENDAR_ID is the name the first deploy used — kept as a fallback.
    calendar: () => env("GHL_CALENDAR_ID_EYEBAGS", "GHL_CALENDAR_ID"),
    user:     () => env("GHL_USER_ID_EYEBAGS", "GHL_ASSIGNED_USER_ID"),
  },
  "lift": {
    name: "Face & Neck Double Lift Skin Tightening",
    durationMin: 60,
    value: 99,
    calendar: () => env("GHL_CALENDAR_ID_LIFT"),
    user:     () => env("GHL_USER_ID_LIFT", "GHL_ASSIGNED_USER_ID"),
  },
  "nonsurgical-lift": {
    name: "Non-Surgical Face & Neck Lift Treatment",
    durationMin: 60,
    value: 149,   // this one is priced higher than the other two
    calendar: () => env("GHL_CALENDAR_ID_NONSURGICAL"),
    user:     () => env("GHL_USER_ID_NONSURGICAL", "GHL_ASSIGNED_USER_ID"),
  },
};

const META_PIXEL_ID      = process.env.META_PIXEL_ID;
const META_CAPI_TOKEN    = process.env.META_CAPI_TOKEN;
const META_GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v24.0";
const META_TEST_CODE     = process.env.META_TEST_EVENT_CODE;

// ------------------------------------------------------------------ helpers
const sha256 = (v) => crypto.createHash("sha256").update(String(v).trim().toLowerCase()).digest("hex");

const seen = new Map();
function rateLimited(ip, limit = 8, windowMs = 60000) {
  const now = Date.now();
  const hits = (seen.get(ip) || []).filter((t) => now - t < windowMs);
  hits.push(now);
  seen.set(ip, hits);
  if (seen.size > 5000) seen.clear();
  return hits.length > limit;
}

async function ghl(path, body, versions) {
  let last;
  for (const version of versions) {
    const res = await fetch(GHL_BASE + path, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Version: version,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let data = {};
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    if (res.ok) return data;
    last = { status: res.status, data };
    if (!JSON.stringify(data).toLowerCase().includes("version")) break;
  }
  const msg = Array.isArray(last?.data?.message) ? last.data.message.join(", ")
            : typeof last?.data?.message === "string" ? last.data.message
            : `GHL error ${last?.status || "unknown"}`;
  const err = new Error(msg);
  err.status = last?.status || 502;
  err.ghl = last?.data;
  throw err;
}

// Meta's own format for the click id when the _fbc cookie hasn't been written
// yet (ad blockers, Safari, a fast submit). Without it every fbclid click
// loses its attribution, which is most of the paid traffic.
function buildFbc(fbc, fbclid) {
  if (fbc) return fbc;
  if (!fbclid) return undefined;
  return `fb.1.${Date.now()}.${fbclid}`;
}

async function sendCapi({ eventId, email, phone, fbp, fbc, service, pageUrl, ip, ua, value }) {
  if (!META_PIXEL_ID || !META_CAPI_TOKEN) return { skipped: "no pixel or token configured" };
  const payload = {
    data: [{
      event_name: "Schedule",
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,                 // same id the browser pixel sent -> deduped
      event_source_url: pageUrl,
      action_source: "website",
      user_data: {
        em: [sha256(email)],
        ph: [sha256(phone.replace(/\D/g, ""))],
        ...(fbp ? { fbp } : {}),
        ...(fbc ? { fbc } : {}),
        ...(ip ? { client_ip_address: ip } : {}),
        ...(ua ? { client_user_agent: ua } : {}),
      },
      custom_data: {
        content_name: service,
        ...(value ? { value, currency: process.env.META_CURRENCY || "GBP" } : {}),
      },
    }],
    ...(META_TEST_CODE ? { test_event_code: META_TEST_CODE } : {}),
  };
  const res = await fetch(
    `https://graph.facebook.com/${META_GRAPH_VERSION}/${META_PIXEL_ID}/events?access_token=${META_CAPI_TOKEN}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
  );
  const body = await res.json().catch(() => ({}));
  if (!res.ok) console.error("capi rejected", res.status, JSON.stringify(body));
  return { ok: res.ok, status: res.status, events_received: body.events_received, fbtrace_id: body.fbtrace_id };
}

// -------------------------------------------------------------------- route
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  if (!TOKEN || !LOCATION_ID) {
    console.error("missing env: GHL_PRIVATE_TOKEN / GHL_LOCATION_ID");
    return res.status(500).json({ ok: false, error: "Booking is not configured yet." });
  }

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  if (rateLimited(ip || "unknown")) {
    return res.status(429).json({ ok: false, error: "Too many attempts. Please wait a minute." });
  }

  const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const { name, email, phone, startTime, endTime, eventId, test, company,
          fbp, fbc, fbclid, pageUrl, slug } = b;

  // Honeypot: a filled hidden field means a bot. Answer 200 so it stops retrying.
  if (company) return res.status(200).json({ ok: true, appointmentId: null, status: "ignored" });

  const svc = SERVICES[slug];
  if (!svc) return res.status(400).json({ ok: false, error: "Unknown service." });

  const calendarId = svc.calendar();
  if (!calendarId) {
    console.error(`no calendar configured for slug "${slug}"`);
    return res.status(500).json({ ok: false, error: "This treatment's calendar is not set up yet." });
  }

  if (!name || !email || !phone || !startTime) {
    return res.status(400).json({ ok: false, error: "Missing required fields." });
  }
  if (!/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(email) || !/^\+\d{8,15}$/.test(phone)) {
    return res.status(400).json({ ok: false, error: "Invalid email or phone." });
  }
  const start = new Date(startTime);
  if (Number.isNaN(start.getTime()) || start.getTime() < Date.now() - 60000) {
    return res.status(400).json({ ok: false, error: "That time is no longer available." });
  }

  const isTest = test === true;
  const [firstName, ...rest] = String(name).trim().split(/\s+/);

  try {
    const contactRes = await ghl("/contacts/upsert", {
      locationId: LOCATION_ID,
      firstName: (isTest ? "[TEST] " : "") + (firstName || name),
      lastName: rest.join(" ") || "-",
      email,
      phone,
      source: `${svc.name} LP`,
      // One tag per treatment, so the CRM can segment by which page booked.
      tags: [svc.name].concat(isTest ? ["TEST-DONOTCOUNT"] : []),
      // Park the Meta click identifiers on the contact. Without them, the
      // "she showed up and paid" event fired days later can only be matched on
      // hashed email and phone, which is a far weaker match than the original
      // click id. Off until GHL_STORE_CLICK_IDS=true, because GHL rejects an
      // upsert that names a custom field the sub-account does not have — which
      // would take every booking down with it. Create the four fields first,
      // then flip the variable.
      ...(STORE_CLICK_IDS ? { customFields: [
        { key: "fb_fbc", fieldValue: buildFbc(fbc, fbclid) || "" },
        { key: "fb_fbp", fieldValue: fbp || "" },
        { key: "booking_service", fieldValue: svc.name },
        { key: "booking_value", fieldValue: String(svc.value) },
      ] } : {}),
    }, CONTACT_VERSIONS);

    const contactId = contactRes?.contact?.id || contactRes?.id;
    if (!contactId) throw Object.assign(new Error("Contact was not created."), { status: 502 });

    const userId = svc.user();
    const end = endTime || new Date(start.getTime() + svc.durationMin * 60000).toISOString();

    const appt = await ghl("/calendars/events/appointments", {
      calendarId,
      locationId: LOCATION_ID,
      contactId,
      ...(userId ? { assignedUserId: userId } : {}),
      startTime,
      endTime: end,
      title: `${name} — ${svc.name}`,
      appointmentStatus: "confirmed",
      meetingLocationType: "custom",
      toNotify: !isTest,
      ignoreFreeSlotValidation: IGNORE_SLOT_VALIDATION,
      selectedTimezone: TZ,
    }, CALENDAR_VERSIONS);

    const appointmentId = appt?.id || appt?.appointmentId || appt?.appointment?.id || null;

    let capi;
    if (appointmentId && !isTest) {
      capi = await sendCapi({
        eventId, email, phone,
        fbp, fbc: buildFbc(fbc, fbclid),
        service: svc.name, pageUrl, ip,
        ua: req.headers["user-agent"],
        value: svc.value,
      }).catch((e) => { console.error("capi failed", e); return { ok: false, error: String(e) }; });
    }

    console.log(JSON.stringify({
      at: "booking", slug, calendarId: calendarId.slice(-4), appointmentId,
      value: svc.value, test: isTest, capi: capi || "skipped",
    }));

    // A missing appointment id is a captured lead, not a booking.
    return res.status(200).json({
      ok: true,
      appointmentId,
      status: appointmentId ? "booked" : "lead_only",
      contactId,
      ...(isTest ? { service: svc.name, calendarTail: calendarId.slice(-4), value: svc.value } : {}),
    });
  } catch (e) {
    console.error("booking failed", slug, e.status, e.message, e.ghl || "");
    const taken = /slot|available|conflict/i.test(e.message || "");
    return res.status(e.status && e.status < 500 ? 400 : 502).json({
      ok: false,
      error: taken ? "That time was just taken. Please pick another slot." : (e.message || "Booking failed."),
    });
  }
}
