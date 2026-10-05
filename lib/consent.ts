/* ---------------------------------------------------------------------------
   Cookie consent for /face-neck (UK GDPR and PECR).

   Nothing optional runs until she accepts: no Meta pixel, no Google tag, no
   attribution kept in her browser, and /api/book sends nothing to Meta's
   Conversions API. The choice itself sits in a first-party cookie, which is
   strictly necessary, so the server can read it as well as the page.
--------------------------------------------------------------------------- */

export const CONSENT_COOKIE = "lds_consent"
export type Consent = "granted" | "denied"

const CHANGE = "lds-consent-change"
const SIX_MONTHS = 60 * 60 * 24 * 182

/** Reads the choice from a Cookie header or from document.cookie. */
export function readConsent(cookies: string | null | undefined): Consent | undefined {
  return cookies?.match(/(?:^|;\s*)lds_consent=(granted|denied)(?:;|$)/)?.[1] as Consent | undefined
}

export const getConsent = () => readConsent(document.cookie)

export function setConsent(value: Consent) {
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${SIX_MONTHS}; Path=/; SameSite=Lax${secure}`
  window.dispatchEvent(new Event(CHANGE))
}

export function clearConsent() {
  document.cookie = `${CONSENT_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`
  window.dispatchEvent(new Event(CHANGE))
}

export function subscribeConsent(onChange: () => void) {
  window.addEventListener(CHANGE, onChange)
  return () => window.removeEventListener(CHANGE, onChange)
}
