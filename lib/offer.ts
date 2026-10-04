/* ---------------------------------------------------------------------------
   The face & neck offer, in one place.

   The page copy, the booking widget and /api/book all read these values, so a
   price or a duration can never say one thing in the headline and another at
   booking. Every fact here was confirmed by the clinic on 2026-10-04. Anything
   not confirmed (deposit, refunds, device name, results) is deliberately absent.

   Nothing secret lives here: this file ships to the browser. The calendar id is
   resolved on the server from environment variables (lib/services.server.ts).
--------------------------------------------------------------------------- */

export const CLINIC = {
  name: "L'amour De Soi",
  street: "40 Rosslyn Hill",
  area: "Hampstead",
  city: "London",
  postcode: "NW3 1NH",
  // Published on the clinic's live booking page.
  phoneE164: "+447401460465",
  phoneDisplay: "07401 460465",
  // Public contact page: Monday-Saturday 10:00-18:00, Sunday closed.
  hoursDisplay: "Monday to Saturday, 10:00 to 18:00",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=L%27amour%20De%20Soi%2C%2040%20Rosslyn%20Hill%2C%20London%20NW3%201NH",
  privacyUrl: "https://lamourdesoi.co.uk/policies/privacy-policy",
  siteUrl: "https://lamourdesoi.co.uk/",
} as const

export const ADDRESS_ONE_LINE = `${CLINIC.street}, ${CLINIC.area}, ${CLINIC.city} ${CLINIC.postcode}`

export const FACE_NECK = {
  slug: "face-neck",
  // What the visitor reads.
  title: "Non-surgical face & neck treatment",
  // What GHL calls it. Matches the existing service tag so the clinic's
  // workflows for this calendar keep firing for bookings from this page.
  crmService: "Non-Surgical Face & Neck Lift Treatment",
  currency: "GBP",
  totalPrice: 149,
  payNow: 0, // nothing is taken online
  durationMin: 60,
} as const

export const BALANCE_AT_CLINIC = FACE_NECK.totalPrice - FACE_NECK.payNow

/* Booking rules. The start times are a fixed list on purpose (a product
   decision, not a missing availability feed); the server applies the same
   rules before it creates anything. */
export const FACE_NECK_RULES = {
  timeZone: "Europe/London",
  // Calendar days ahead, counting today.
  windowDays: 14,
  // 0 = Sunday. The clinic is closed on Sundays.
  closedWeekdays: [0] as readonly number[],
  // Hourly starts, London time. A one-hour visit starting at 17:00 ends at
  // 18:00, when the clinic closes.
  startHours: [10, 11, 12, 13, 14, 15, 16, 17] as readonly number[],
  closingHour: 18,
  // Same-day bookings need at least this much notice.
  minNoticeMinutes: 120,
} as const

export type BookingRules = typeof FACE_NECK_RULES

export const formatGBP = (n: number) => `£${n.toLocaleString("en-GB")}`
