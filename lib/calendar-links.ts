/* ---------------------------------------------------------------------------
   "Add to calendar" for a confirmed appointment only.

   The event carries what the visit needs (treatment, place, price, how to
   change it) and nothing about the person: no name, email or phone in a URL
   that ends up in browser history and Google's logs.
--------------------------------------------------------------------------- */

import { ADDRESS_ONE_LINE, CLINIC, FACE_NECK, formatGBP } from "./offer"

const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")

const title = `${FACE_NECK.title} at ${CLINIC.name}`
const details =
  `${FACE_NECK.title}, ${FACE_NECK.durationMin} minutes. ` +
  `${formatGBP(FACE_NECK.totalPrice)}, paid at the clinic. ` +
  `To change or cancel, call ${CLINIC.phoneDisplay}.`

export function googleCalendarUrl(start: string, end: string) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${stamp(start)}/${stamp(end)}`,
    details,
    location: `${CLINIC.name}, ${ADDRESS_ONE_LINE}`,
    ctz: "Europe/London",
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

const icsEscape = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n")

export function icsDataUrl(start: string, end: string, uid: string) {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//L'amour De Soi//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}@lamourdesoi.co.uk`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${icsEscape(title)}`,
    `DESCRIPTION:${icsEscape(details)}`,
    `LOCATION:${icsEscape(`${CLINIC.name}, ${ADDRESS_ONE_LINE}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`
}
