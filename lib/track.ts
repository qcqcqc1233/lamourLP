/* ---------------------------------------------------------------------------
   Browser-side measurement for /face-neck.

   One owner per event, so nothing is counted twice:
     PageView     pixel snippet in the page head (browser only)
     ViewBooking  custom, when the booking section is first on screen
     SelectSlot   custom, when a start time is picked (NOT a checkout)
     Lead         when /api/book confirms the contact is in the CRM
     Schedule     when /api/book returns a real appointment id; the server
                  sends the same event with the same event_id through CAPI,
                  so Meta keeps one
   The dataLayer receives matching names for GA4/GTM if one is added later.
   No name, email, phone or free text ever goes to either.

   Only the account pixel that has the Conversions API connected is used here.
   With ?test=1 nothing is sent at all.
--------------------------------------------------------------------------- */

import { ATTRIBUTION_KEYS, type Attribution, type Touch } from "./attribution"

export const PIXEL_ID = "1178133073434960"

type Fbq = (...args: unknown[]) => void
declare global {
  interface Window {
    fbq?: Fbq
    dataLayer?: Record<string, unknown>[]
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

function dataLayer(event: string, params: Record<string, unknown> = {}) {
  if (isTestVisit()) return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event, ...params })
}

const fired = new Set<string>()

export const track = {
  viewBooking() {
    if (fired.has("view_booking")) return
    fired.add("view_booking")
    pixel("trackSingleCustom", "ViewBooking", { content_name: "face-neck" })
    dataLayer("view_booking", { service: "face-neck" })
  },
  selectSlot(dayKey: string, hour: number) {
    pixel("trackSingleCustom", "SelectSlot", { content_name: "face-neck" })
    dataLayer("select_slot", { service: "face-neck", slot_day: dayKey, slot_hour: hour })
  },
  lead(eventId: string) {
    pixel("trackSingle", "Lead", { content_name: "face-neck" }, `lead_${eventId}`)
    dataLayer("generate_lead", { service: "face-neck" })
  },
  booked(eventId: string, value: number, currency: string) {
    pixel("trackSingle", "Schedule", { content_name: "Non-Surgical Face & Neck Lift Treatment", value, currency }, eventId)
    dataLayer("appointment_booked", { service: "face-neck", value, currency })
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

/** Remember where this visit came from. First touch survives, last touch updates. */
export function captureAttribution() {
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

  if (!read(() => localStorage, FIRST)) write(() => localStorage, FIRST, touch)
  if (fromAd || !read(() => sessionStorage, LAST)) write(() => sessionStorage, LAST, touch)
}

export function readAttribution(): Attribution {
  return { first: read(() => localStorage, FIRST), last: read(() => sessionStorage, LAST) }
}

export const readCookie = (name: string) =>
  document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`))?.[1]
