/* ---------------------------------------------------------------------------
   GET /api/health — is everything wired?

   Answers the question you actually have after pasting eight environment
   variables into Vercel: did each treatment get a calendar, and did I paste
   the right one. It never returns a secret — only booleans and the last four
   characters of each id, which is enough to tell two ids apart at a glance.
--------------------------------------------------------------------------- */

import { SERVICES } from "./book.js";

const tail = (v) => (v ? "…" + String(v).slice(-4) : null);

export default function handler(req, res) {
  const services = {};
  for (const [slug, svc] of Object.entries(SERVICES)) {
    const cal = svc.calendar();
    services[slug] = {
      name: svc.name,
      calendar: tail(cal),
      assignedUser: tail(svc.user()),
      ready: Boolean(cal),
    };
  }

  // Two treatments pointing at the same calendar is almost always a paste slip,
  // and it stays invisible for weeks: both pages book fine, the bookings just
  // pile into one calendar. Say it out loud here instead.
  const byCalendar = {};
  for (const [slug, s] of Object.entries(services)) {
    if (!s.calendar) continue;
    (byCalendar[s.calendar] ||= []).push(slug);
  }
  const duplicateCalendars = Object.values(byCalendar).filter((g) => g.length > 1);

  const out = {
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
    // A warning, not a failure — one shared calendar across treatments is a
    // legitimate setup if the salon runs it that way.
    ...(duplicateCalendars.length ? { warning: "two treatments share a calendar", duplicateCalendars } : {}),
  };

  out.allReady = out.token && Boolean(process.env.GHL_LOCATION_ID) &&
    Object.values(services).every((s) => s.ready);

  res.setHeader("Cache-Control", "no-store");
  res.status(out.allReady ? 200 : 503).json(out);
}
