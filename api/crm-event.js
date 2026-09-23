/* ---------------------------------------------------------------------------
   POST /api/crm-event — the outcome half of the funnel.

   /api/book tells Meta a booking happened. This tells Meta what the booking
   turned out to be worth: she showed up, or she showed up and paid. That is
   the signal that separates "people who book" from "people who come", and it
   is the only way the campaign can learn to buy the second kind.

   GHL calls this from a workflow webhook once the outcome is known, carrying
   the click identifiers that /api/book parked on the contact — so an event
   fired a week later still matches the ad click that produced the booking.
--------------------------------------------------------------------------- */

import crypto from "node:crypto";

const SECRET             = process.env.CRM_WEBHOOK_SECRET;
const META_PIXEL_ID      = process.env.META_PIXEL_ID;
const META_CAPI_TOKEN    = process.env.META_CAPI_TOKEN;
const META_GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v24.0";
const META_TEST_CODE     = process.env.META_TEST_EVENT_CODE;
const CURRENCY           = process.env.META_CURRENCY || "GBP";

const sha256 = (v) => crypto.createHash("sha256").update(String(v).trim().toLowerCase()).digest("hex");

// Only these can be sent. An open event name would let anyone who found the URL
// write arbitrary conversions into the ad account's pixel.
const ALLOWED = new Set(["Purchase", "Qualified", "Showed", "NoShow"]);
// GHL's webhook builder is easy to get slightly wrong — a stray space, a
// lowercase q. Accept those and normalise, rather than rejecting a real
// outcome over punctuation.
const CANONICAL = new Map([...ALLOWED].map((e) => [e.toLowerCase(), e]));

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  if (!SECRET) {
    console.error("CRM_WEBHOOK_SECRET is not set");
    return res.status(500).json({ ok: false, error: "Not configured" });
  }
  // Constant-time compare so the secret can't be guessed a character at a time.
  const given = String(req.headers["x-webhook-secret"] || "");
  const ok = given.length === SECRET.length &&
    crypto.timingSafeEqual(Buffer.from(given), Buffer.from(SECRET));
  if (!ok) return res.status(401).json({ ok: false, error: "Unauthorized" });

  const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const { email, phone, fbc, fbp, event, value, service, appointmentId, eventTime, test } = b;

  // Tell the caller what actually arrived. A webhook that only says "invalid"
  // costs an hour of guessing at the other end.
  const eventName = CANONICAL.get(String(event ?? "").trim().toLowerCase());
  if (!eventName) {
    return res.status(400).json({
      ok: false,
      error: `event must be one of ${[...ALLOWED].join(", ")}`,
      received: event === undefined ? null : event,
      bodyKeys: Object.keys(b),
    });
  }
  if (!email && !phone) {
    return res.status(400).json({ ok: false, error: "email or phone is required to match the person" });
  }
  if (!META_PIXEL_ID || !META_CAPI_TOKEN) {
    return res.status(500).json({ ok: false, error: "Meta CAPI is not configured" });
  }

  // One id per outcome per person. If the workflow fires twice — a retry,
  // someone dragging the card back and forth — Meta collapses them instead of
  // counting two conversions.
  //
  // A merge token that did not resolve arrives as the literal "{{appointment.id}}",
  // which is the SAME string for every contact. Using it would give every
  // customer the same event_id and Meta would collapse the whole day's
  // conversions into one. Anything that still looks like a token is discarded
  // and we fall back to hashing the person, which is unique per person per event.
  const apptId = typeof appointmentId === "string" &&
    appointmentId.trim() && !appointmentId.includes("{{") && !appointmentId.includes("}}")
      ? appointmentId.trim() : null;
  const eventId = `crm_${eventName}_${apptId || sha256((email || phone) + eventName).slice(0, 16)}`;

  const user_data = {};
  if (email) user_data.em = [sha256(email)];
  if (phone) user_data.ph = [sha256(String(phone).replace(/\D/g, ""))];
  if (fbc) user_data.fbc = fbc;
  if (fbp) user_data.fbp = fbp;

  const numericValue = value !== undefined && value !== null && value !== "" ? Number(value) : undefined;

  const payload = {
    data: [{
      event_name: eventName,
      event_time: Math.floor((eventTime ? new Date(eventTime).getTime() : Date.now()) / 1000),
      event_id: eventId,
      // The appointment happened at the salon, not in a browser. Meta's own
      // label for a CRM-pushed event is system_generated.
      action_source: "system_generated",
      user_data,
      custom_data: {
        ...(service ? { content_name: service } : {}),
        ...(Number.isFinite(numericValue) ? { value: numericValue, currency: CURRENCY } : {}),
      },
    }],
    ...(META_TEST_CODE ? { test_event_code: META_TEST_CODE } : {}),
  };

  // GHL's webhook builder sends every custom-data value as text, so a "test"
  // row arrives as the STRING "true". A strict === true check would treat that
  // as a live run and quietly write a real conversion into the pixel — the one
  // failure mode a dry run exists to prevent.
  if (test === true || String(test).trim().toLowerCase() === "true") {
    return res.status(200).json({ ok: true, dryRun: true, wouldSend: payload });
  }

  try {
    const r = await fetch(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/${META_PIXEL_ID}/events?access_token=${META_CAPI_TOKEN}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
    );
    const body = await r.json().catch(() => ({}));
    console.log(JSON.stringify({ at: "crm-event", event: eventName, appointmentId: apptId, value: numericValue,
      status: r.status, events_received: body.events_received, fbtrace_id: body.fbtrace_id }));
    if (!r.ok) {
      console.error("capi rejected", r.status, JSON.stringify(body));
      return res.status(502).json({ ok: false, error: body?.error?.message || `Meta returned ${r.status}` });
    }
    return res.status(200).json({ ok: true, event: eventName, eventId, events_received: body.events_received });
  } catch (e) {
    console.error("crm-event failed", e);
    return res.status(502).json({ ok: false, error: String(e && e.message || e) });
  }
}
