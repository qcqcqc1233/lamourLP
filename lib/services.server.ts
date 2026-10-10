/* ---------------------------------------------------------------------------
   Which GHL calendar each page books into.

   The browser sends a SLUG ("eyebags", "face-neck", ...), never a calendar id.
   If the page could name its own calendar, anyone could point a booking at any
   calendar in the sub-account, so the mapping stays here, read from env at
   request time so /api/health reports the truth right after a redeploy.
--------------------------------------------------------------------------- */

import "server-only"

import { FACE_NECK, FACE_NECK_RULES, type BookingRules } from "./offer"

const env = (...names: string[]) => names.map((n) => process.env[n]).find(Boolean)

export type Service = {
  name: string // GHL tag and appointment title
  durationMin: number
  value: number // what a booked appointment is worth, sent to Meta
  calendar: () => string | undefined
  user: () => string | undefined
  // Pages built on the new booking flow. The three original pages keep their
  // exact old behaviour so live campaigns see no change.
  modern?: {
    rules: BookingRules
    source: string
    tags: string[]
    pagePath: string
    ignoreSlotValidation: () => boolean
  }
}

// true = book even if GHL thinks the slot is taken (what the original pages do).
const globalIgnore = () => process.env.GHL_IGNORE_SLOT_VALIDATION !== "false"

export const SERVICES: Record<string, Service> = {
  "eyebags": {
    name: "Bye Bye Eye Bags",
    durationMin: 60,
    value: 99,
    // GHL_CALENDAR_ID is the name the first deploy used, kept as a fallback.
    calendar: () => env("GHL_CALENDAR_ID_EYEBAGS", "GHL_CALENDAR_ID"),
    user: () => env("GHL_USER_ID_EYEBAGS", "GHL_ASSIGNED_USER_ID"),
  },
  "lift": {
    name: "Face & Neck Double Lift Skin Tightening",
    durationMin: 60,
    value: 99,
    calendar: () => env("GHL_CALENDAR_ID_LIFT"),
    user: () => env("GHL_USER_ID_LIFT", "GHL_ASSIGNED_USER_ID"),
  },
  "nonsurgical-lift": {
    name: "Non-Surgical Face & Neck Lift Treatment",
    durationMin: 60,
    value: 149,
    calendar: () => env("GHL_CALENDAR_ID_NONSURGICAL"),
    user: () => env("GHL_USER_ID_NONSURGICAL", "GHL_ASSIGNED_USER_ID"),
  },
  // The face & neck campaign page. Same GHL calendar and tag as the
  // non-surgical lift (the clinic confirmed that calendar), its own source and
  // an extra tag so the CRM can tell which page a booking came from.
  "face-neck": {
    name: FACE_NECK.crmService,
    durationMin: FACE_NECK.durationMin,
    value: FACE_NECK.totalPrice,
    calendar: () => env("GHL_CALENDAR_ID_FACE_NECK", "GHL_CALENDAR_ID_NONSURGICAL"),
    user: () => env("GHL_USER_ID_FACE_NECK", "GHL_USER_ID_NONSURGICAL", "GHL_ASSIGNED_USER_ID"),
    modern: {
      rules: FACE_NECK_RULES,
      source: "Face & Neck LP (/non-surgical-face-neck)",
      tags: ["face-neck-lp"],
      pagePath: "/non-surgical-face-neck",
      // Per-page override, so this calendar can start refusing double bookings
      // without changing what the older pages do.
      ignoreSlotValidation: () => {
        const own = process.env.GHL_IGNORE_SLOT_VALIDATION_FACE_NECK
        return own === undefined || own === "" ? globalIgnore() : own !== "false"
      },
    },
  },
}

export const ignoreSlotValidationFor = (svc: Service) =>
  svc.modern ? svc.modern.ignoreSlotValidation() : globalIgnore()
