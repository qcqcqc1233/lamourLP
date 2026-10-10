/* ---------------------------------------------------------------------------
   Browser-side measurement for /non-surgical-face-neck.

   The pixel and the Google tag are loaded by startTrackers() on page load
   (the cookie banner is a notice only, see lib/consent.ts). Calls made before
   it runs are no-ops, except ViewBooking, which waits for it.

   One owner per event, so nothing is counted twice:
     PageView     sent by startTrackers() (pixel and GA4 page_view)
     ViewBooking  custom, when the booking section is first on screen
     SelectSlot   custom, when a start time is picked (NOT a checkout)
     Lead         when /api/book confirms the contact is in the CRM
     Schedule     when /api/book returns a real appointment id; the server
                  sends the same event with the same event_id through CAPI,
                  so Meta keeps one
   GA4 receives matching events: view_booking, select_slot, generate_lead,
   appointment_booked. No name, email, phone or free text ever goes to either.

   Only the account pixel that has the Conversions API connected is used here.
   With ?test=1 nothing is sent at all.
--------------------------------------------------------------------------- */

import { ATTRIBUTION_KEYS, type Attribution, type Touch } from "./attribution"

export const PIXEL_ID = "1178133073434960"
export const GA4_ID = "G-ZN3W0XQ1E5"

type Tag = ((...args: unknown[]) => void) & Record<string, unknown>
declare global {
  interface Window {
    fbq?: Tag
    _fbq?: Tag
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

export const isTestVisit = () =>
  typeof window !== "undefined" && new URLSearchParams(window.location.search).get("test") === "1"

function pixel(kind: "trackSingle" | "trackSingleCustom", name: string, params: Record<string, unknown>, eventId?: string) {
  if (isTestVisit() || typeof window.fbq !== "function") return
  try {
    window.fbq(kind, PIXEL_ID, name, params, eventId ? { eventID: eventId } : {})
  } catch {
    /* a blocked pixel must never break booking */
  }
}

function ga(event: string, params: Record<string, unknown> = {}) {
  if (isTestVisit() || typeof window.gtag !== "function") return
  try {
    window.gtag("event", event, { send_to: GA4_ID, ...params })
  } catch {
    /* same rule as the pixel */
  }
}

function loadScript(src: string) {
  const s = document.createElement("script")
  s.async = true
  s.src = src
  document.head.appendChild(s)
}

let started = false
let bookingSeen = false
let bookingViewSent = false

function sendViewBooking() {
  if (!started || !bookingSeen || bookingViewSent) return
  bookingViewSent = true
  pixel("trackSingleCustom", "ViewBooking", { content_name: "face-neck" })
  ga("view_booking", { service: "face-neck" })
}

/** Loads the Meta pixel and the Google tag. Called once, on page load. */
export function startTrackers() {
  if (started || isTestVisit()) return
  started = true

  // The standard Meta pixel stub: calls queue until fbevents.js arrives.
  if (!window.fbq) {
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) (fbq.callMethod as (...a: unknown[]) => void)(...args)
      else (fbq.queue as unknown[][]).push(args)
    } as Tag
    Object.assign(fbq, { push: fbq, loaded: true, version: "2.0", queue: [] })
    window.fbq = fbq
    window._fbq ??= fbq
    loadScript("https://connect.facebook.net/en_US/fbevents.js")
  }
  window.fbq("init", PIXEL_ID)
  window.fbq("trackSingle", PIXEL_ID, "PageView")

  // The Google tag, as GA4 documents it: gtag() must push its arguments object.
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments)
  }
  window.gtag("js", new Date())
  window.gtag("config", GA4_ID)
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`)

  sendViewBooking()
}

export const track = {
  viewBooking() {
    bookingSeen = true
    sendViewBooking()
  },
  selectSlot(dayKey: string, hour: number) {
    pixel("trackSingleCustom", "SelectSlot", { content_name: "face-neck" })
    ga("select_slot", { service: "face-neck", slot_day: dayKey, slot_hour: hour })
  },
  lead(eventId: string) {
    pixel("trackSingle", "Lead", { content_name: "face-neck" }, `lead_${eventId}`)
    ga("generate_lead", { service: "face-neck" })
  },
  booked(eventId: string, value: number, currency: string) {
    pixel("trackSingle", "Schedule", { content_name: "Non-Surgical Face & Neck Lift Treatment", value, currency }, eventId)
    ga("appointment_booked", { service: "face-neck", value, currency })
  },
}

/* ------------------------------------------------------------ attribution */

const FIRST = "lds_first_touch"
const LAST = "lds_last_touch"

function read(storage: () => Storage, key: string): Touch | undefined {
  try {
    const raw = storage().getItem(key)
    return raw ? (JSON.parse(raw) as Touch) : undefined
  } catch {
    return undefined
  }
}
function write(storage: () => Storage, key: string, value: Touch) {
  try {
    storage().setItem(key, JSON.stringify(value))
  } catch {
    /* private mode or blocked storage: the booking still works */
  }
}

/** Where this visit came from, read from the URL and referrer. Stores nothing. */
function currentTouch(): { touch: Touch; fromAd: boolean } {
  const params = new URLSearchParams(window.location.search)
  const touch: Touch = {}
  for (const key of ATTRIBUTION_KEYS) {
    const v = params.get(key)
    if (v) touch[key] = v.slice(0, 300)
  }
  const fromAd = Object.keys(touch).length > 0
  touch.landing_page = window.location.pathname
  if (document.referrer && !document.referrer.startsWith(window.location.origin)) {
    touch.referrer = document.referrer.slice(0, 300)
  }
  touch.at = new Date().toISOString()
  return { touch, fromAd }
}

/** Remember where this visit came from. First touch survives, last touch updates. */
export function captureAttribution() {
  const { touch, fromAd } = currentTouch()
  if (!read(() => localStorage, FIRST)) write(() => localStorage, FIRST, touch)
  if (fromAd || !read(() => sessionStorage, LAST)) write(() => sessionStorage, LAST, touch)
}

/** Stored touches, or this visit's own URL if storage is blocked. */
export function readAttribution(): Attribution {
  const now = currentTouch().touch
  return { first: read(() => localStorage, FIRST) ?? now, last: read(() => sessionStorage, LAST) ?? now }
}

export const readCookie = (name: string) =>
  document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`))?.[1]
