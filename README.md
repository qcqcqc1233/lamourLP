# L'amour De Soi booking pages

Next.js (App Router) + Tailwind + shadcn/ui on Vercel, project `lamoure-eyebag`.

| Route | What it is |
|---|---|
| `/face-neck` | The face & neck campaign page. Built in `app/face-neck/page.tsx`, booking in `components/face-neck/booking.tsx` |
| `/`, `/lift`, `/nonsurgical-lift` | The original campaign pages, plain HTML in `public/`, served byte-identical while ads still use them |
| `POST /api/book` | Creates the GHL contact and appointment. The page sends a slug, never a calendar id |
| `GET /api/health` | Which calendar each page resolved to (last 4 characters only). `?availability=1` also compares the face & neck start times with the calendar's own free slots |
| `POST /api/crm-event` | GHL workflow webhook that sends booking outcomes (Showed, Purchase...) to Meta CAPI |

## The offer lives in one file

`lib/offer.ts` holds the face & neck price, duration, address, phone and booking rules (days, start
times, notice). The page copy, the booking widget and `/api/book` all read it, so changing the price
there changes it everywhere. Only facts the clinic confirmed are in it.

Booking rules for `/face-neck` (enforced in the browser **and** on the server, `lib/schedule.ts`):
London time always; 14 days ahead; Sundays closed; hourly starts 10:00-17:00 (a fixed list on
purpose); a one-hour visit must end by 18:00; same-day bookings need 2 hours' notice.

## What `/api/book` answers for `/face-neck`

| Situation | Response | Page shows |
|---|---|---|
| Appointment created | `200 {status:"booked", appointmentId, booking}` | "Your appointment is confirmed." + calendar links |
| GHL returned no appointment id | `200 {status:"lead_only"}` | "We have your details, but your appointment is not confirmed yet." |
| Time outside the rules, or GHL refused the slot | `409 {code:"slot_unavailable"}` | "That time is no longer available..." and the details stay filled in |
| Bad name/email/phone | `400 {code:"invalid", fields}` | Message under each field |
| GHL down or erroring | `502 {code:"upstream"}` | Try again or call; details kept |

A double tap or a retry reuses the same `eventId`; the server answers both from one booking, and on a
cold instance it checks the contact's existing appointments before creating another.

`?test=1`: the contact is tagged `TEST-DONOTCOUNT`, GHL notifications are off, nothing goes to Meta,
and the test appointment is deleted again straight after it is created.

## Environment variables (Vercel → Settings → Environment Variables)

| Key | Notes |
|---|---|
| `GHL_PRIVATE_TOKEN` | Sub-account Private Integration token. Scopes: contacts.write, contacts.readonly, calendars/events.write, calendars.readonly |
| `GHL_LOCATION_ID` | Sub-account id |
| `GHL_CALENDAR_ID_EYEBAGS` / `_LIFT` / `_NONSURGICAL` | One per original page |
| `GHL_CALENDAR_ID_FACE_NECK` | Optional. Falls back to `GHL_CALENDAR_ID_NONSURGICAL` (the calendar the clinic chose) |
| `GHL_ASSIGNED_USER_ID`, `GHL_USER_ID_*` | Optional staff member per calendar |
| `GHL_IGNORE_SLOT_VALIDATION` | `true` (default) books even when GHL thinks the slot is taken, as the original pages always did |
| `GHL_IGNORE_SLOT_VALIDATION_FACE_NECK` | Optional override for `/face-neck` only. Set `false` once `/api/health?availability=1` shows the calendar's hours match the page |
| `GHL_STORE_CLICK_IDS` | `true` only after the four custom fields (fb_fbc, fb_fbp, booking_service, booking_value) exist in GHL |
| `META_PIXEL_ID`, `META_CAPI_TOKEN` | Server copy of `Schedule`, deduplicated with the browser by `event_id` |
| `META_TEST_EVENT_CODE` | Set while testing in Events Manager, then remove |
| `CRM_WEBHOOK_SECRET` | Shared secret for `/api/crm-event` |
| `SITE_URL` | Public base URL, for metadata and CAPI fallbacks |

Env vars are read when a function starts: redeploy after changing them.

## Measurement on `/face-neck`

Pixel `1178133073434960` only (the one with the Conversions API). Day and time clicks are custom
events (`SelectSlot`), never `AddToCart` or `InitiateCheckout`. `Lead` fires when the CRM has the
contact, `Schedule` only with a real appointment id, with the same `event_id` the server sends. No
personal data goes to the pixel or the dataLayer. See `lib/track.ts`.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000/face-neck
npm test           # London time, clock changes, slot rules, phone and email checks
npm run test:api   # /api/book against a fake GHL: double taps, retries, refused slots, test mode
npm run build
```

Deploys: every push to a branch gets a Vercel preview; `main` is production.
