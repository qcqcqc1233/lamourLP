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

  if (!ALLOWED.has(event)) {
    return res.status(400).json({ ok: false, error: `event must be one of ${[...ALLOWED].join(", ")}` });
  }
  if (!email && !phone) {
    return res.status(400).json({ ok: false, error: "email or phone is required to match the person" });
  }
  if (!META_PIXEL_ID || !META_CAPI_TOKEN) {
    return res.status(500).json({ ok: false, error: "Meta CAPI is not configured" });
  }

  // One id per outcome per appointment. If the workflow fires twice — a retry,
  // someone dragging the card back and forth — Meta collapses them instead of
  // counting two conversions.
  const eventId = `crm_${event}_${appointmentId || sha256((email || phone) + event).slice(0, 16)}`;

  const user_data = {};
  if (email) user_data.em = [sha256(email)];
  if (phone) user_data.ph = [sha256(String(phone).replace(/\D/g, ""))];
  if (fbc) user_data.fbc = fbc;
  if (fbp) user_data.fbp = fbp;

  const numericValue = value !== undefined && value !== null && value !== "" ? Number(value) : undefined;

  const payload = {
    data: [{
      event_name: event,
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

  if (test === true) {
    // Lets you fire the webhook from GHL and see exactly what would be sent,
    // without writing anything into the pixel.
    return res.status(200).json({ ok: true, dryRun: true, wouldSend: payload });
  }

  try {
    const r = await fetch(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/${META_PIXEL_ID}/events?access_token=${META_CAPI_TOKEN}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
    );
    const body = await r.json().catch(() => ({}));
    console.log(JSON.stringify({ at: "crm-event", event, appointmentId, value: numericValue,
      status: r.status, events_received: body.events_received, fbtrace_id: body.fbtrace_id }));
    if (!r.ok) {
      console.error("capi rejected", r.status, JSON.stringify(body));
      return res.status(502).json({ ok: false, error: body?.error?.message || `Meta returned ${r.status}` });
    }
    return res.status(200).json({ ok: true, event, eventId, events_received: body.events_received });
  } catch (e) {
    console.error("crm-event failed", e);
    return res.status(502).json({ ok: false, error: String(e && e.message || e) });
  }
}
