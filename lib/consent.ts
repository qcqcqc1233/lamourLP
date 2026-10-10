/* ---------------------------------------------------------------------------
   Cookie notice for /face-neck.

   Measurement (Meta pixel, GA4, the Conversions API) runs from the first page
   view; that is the client's decision (2026-10-10). The notice only tells her
   that using the site means agreeing to cookies, and remembers, in a
   first-party cookie, that she has seen it.
--------------------------------------------------------------------------- */

const NOTICE_COOKIE = "lds_cookie_notice"
const CHANGE = "lds-cookie-notice"
const SIX_MONTHS = 60 * 60 * 24 * 182

export const noticeSeen = () => new RegExp(`(?:^|;\\s*)${NOTICE_COOKIE}=1(?:;|$)`).test(document.cookie)

export function markNoticeSeen() {
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${NOTICE_COOKIE}=1; Max-Age=${SIX_MONTHS}; Path=/; SameSite=Lax${secure}`
  window.dispatchEvent(new Event(CHANGE))
}

export function subscribeNotice(onChange: () => void) {
  window.addEventListener(CHANGE, onChange)
  return () => window.removeEventListener(CHANGE, onChange)
}
