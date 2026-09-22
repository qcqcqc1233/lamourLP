/* ---------------------------------------------------------------------------
   POST /api/book  — the only server-side endpoint.

   The browser never sees the GHL token, the locationId, the calendarId or the
   assigned user id: it sends a name, an email, a phone and a start time, and
   this function decides which sub-account and calendar that belongs to. That
   is the whole point of the proxy. A token in the page can list the calendar,
   i.e. every customer's name and appointment time.
--------------------------------------------------------------------------- */

import crypto from "node:crypto";

const GHL_BASE = "https://services.leadconnectorhq.com";

// Current docs say Version: v3; the 2021-* versions still answer but are no
// longer maintained. Try the configured one, fall back once if GHL complains
// about the version specifically, so a platform-side change can't take the
// booking form down overnight.
const CONTACT_VERSIONS = [process.env.GHL_VERSION_CONTACTS || "v3", "2021-07-28"];
const CALENDAR_VERSIONS = [process.env.GHL_VERSION_CALENDARS || "v3", "2021-04-15"];

const TOKEN       = process.env.GHL_PRIVATE_TOKEN;
const LOCATION_ID = process.env.GHL_LOCATION_ID;
const CALENDAR_ID = process.env.GHL_CALENDAR_ID;
const USER_ID     = process.env.GHL_ASSIGNED_USER_ID || undefined;
const TZ          = process.env.BUSINESS_TZ || "Europe/London";
const SOURCE      = process.env.LEAD_SOURCE || "Bye Bye Eye Bags LP";
// Defaults to true, which is what the original page does: book the slot even if
// GHL thinks it is taken. That is why two people can land on the same 2 PM.
// Set GHL_IGNORE_SLOT_VALIDATION=false and GHL rejects the second one instead,
// and the page shows "That time was just taken."
const IGNORE_SLOT_VALIDATION = process.env.GHL_IGNORE_SLOT_VALIDATION !== "false";

const META_PIXEL_ID = process.env.META_PIXEL_ID;
const META_CAPI_TOKEN = process.env.META_CAPI_TOKEN;
const META_GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v24.0";
const META_TEST_CODE = process.env.META_TEST_EVENT_CODE;

// ------------------------------------------------------------------ helpers
const sha256 = (v) => crypto.createHash("sha256").update(String(v).trim().toLowerCase()).digest("hex");

// Best-effort only: serverless instances are recycled, so this throttles a
// burst from one IP on one instance, not a distributed flood. Put Vercel's
// firewall or Cloudflare in front if the form starts getting hammered.
const seen = new Map();
function rateLimited(ip, limit = 8, windowMs = 60_000) {
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
    const msg = JSON.stringify(data).toLowerCase();
    if (!msg.includes("version")) break;   // a real error, not a version problem
  }
  const err = new Error(ghlMessage(last));
  err.status = last?.status || 502;
  err.ghl = last?.data;
  throw err;
}

function ghlMessage(last) {
  const m = last?.data?.message;
  if (Array.isArray(m)) return m.join(", ");
  if (typeof m === "string") return m;
  return `GHL error ${last?.status || "unknown"}`;
}

// Meta Conversions API. Same eventId as the browser pixel, so Meta collapses
// the two into one conversion instead of counting the booking twice.
async function sendCapi({ eventId, email, phone, fbp, fbc, service, pageUrl, ip, ua, value }) {
  if (!META_PIXEL_ID || !META_CAPI_TOKEN) return { skipped: true };
  const payload = {
    data: [{
      event_name: "Schedule",
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
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
      custom_data: { content_name: service, ...(value ? { value, currency: process.env.META_CURRENCY || "GBP" } : {}) },
    }],
    ...(META_TEST_CODE ? { test_event_code: META_TEST_CODE } : {}),
  };
  const res = await fetch(
    `https://graph.facebook.com/${META_GRAPH_VERSION}/${META_PIXEL_ID}/events?access_token=${META_CAPI_TOKEN}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
  );
  return { ok: res.ok, status: res.status };
}

// -------------------------------------------------------------------- route
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  if (!TOKEN || !LOCATION_ID || !CALENDAR_ID) {
    console.error("missing env: GHL_PRIVATE_TOKEN / GHL_LOCATION_ID / GHL_CALENDAR_ID");
    return res.status(500).json({ ok: false, error: "Booking is not configured yet." });
  }

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  if (rateLimited(ip || "unknown")) return res.status(429).json({ ok: false, error: "Too many attempts. Please wait a minute." });

  const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const { name, email, phone, startTime, endTime, service, eventId, test, company, fbp, fbc, pageUrl } = b;

  // Honeypot: a filled hidden field means a bot. Answer 200 so it stops retrying.
  if (company) return res.status(200).json({ ok: true, appointmentId: null, status: "ignored" });

  if (!name || !email || !phone || !startTime) {
    return res.status(400).json({ ok: false, error: "Missing required fields." });
  }
  if (!/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(email) || !/^\+\d{8,15}$/.test(phone)) {
    return res.status(400).json({ ok: false, error: "Invalid email or phone." });
  }
  const start = new Date(startTime);
  if (Number.isNaN(start.getTime()) || start.getTime() < Date.now() - 60_000) {
    return res.status(400).json({ ok: false, error: "That time is no longer available." });
  }

  const isTest = test === true;
  const [firstName, ...rest] = String(name).trim().split(/\s+/);
  const tags = [service || SOURCE].concat(isTest ? ["TEST-DONOTCOUNT"] : []);

  try {
    const contactRes = await ghl("/contacts/upsert", {
      locationId: LOCATION_ID,
      firstName: (isTest ? "[TEST] " : "") + (firstName || name),
      lastName: rest.join(" ") || "-",
      email,
      phone,
      source: SOURCE,
      tags,
    }, CONTACT_VERSIONS);

    const contactId = contactRes?.contact?.id || contactRes?.id;
    if (!contactId) throw Object.assign(new Error("Contact was not created."), { status: 502 });

    const end = endTime || new Date(start.getTime() + 60 * 60000).toISOString();
    const appt = await ghl("/calendars/events/appointments", {
      calendarId: CALENDAR_ID,
      locationId: LOCATION_ID,
      contactId,
      ...(USER_ID ? { assignedUserId: USER_ID } : {}),
      startTime,
      endTime: end,
      title: `${name} — ${service || SOURCE}`,
      appointmentStatus: "confirmed",
      meetingLocationType: "custom",
      toNotify: !isTest,
      ignoreFreeSlotValidation: IGNORE_SLOT_VALIDATION,
      selectedTimezone: TZ,
    }, CALENDAR_VERSIONS);

    const appointmentId = appt?.id || appt?.appointmentId || appt?.appointment?.id || null;

    if (appointmentId && !isTest) {
      // Never let a tracking failure fail a booking the customer already made.
      sendCapi({
        eventId, email, phone, fbp, fbc, service, pageUrl, ip,
        ua: req.headers["user-agent"],
        value: process.env.LEAD_VALUE ? Number(process.env.LEAD_VALUE) : undefined,
      }).catch((e) => console.error("capi failed", e));
    }

    // Reaching here means both calls returned 2xx. A missing appointment id is
    // a captured lead, not a booking — say so instead of claiming a slot.
    return res.status(200).json({
      ok: true,
      appointmentId,
      status: appointmentId ? "booked" : "lead_only",
      contactId,
    });
  } catch (e) {
    console.error("booking failed", e.status, e.message, e.ghl || "");
    const taken = /slot|available|conflict/i.test(e.message || "");
    return res.status(e.status && e.status < 500 ? 400 : 502).json({
      ok: false,
      error: taken ? "That time was just taken. Please pick another slot." : (e.message || "Booking failed."),
    });
  }
}
