"use client"

import { useEffect, useSyncExternalStore } from "react"

import { Button } from "@/components/ui/button"
import { clearConsent, getConsent, setConsent, subscribeConsent } from "@/lib/consent"
import { CLINIC } from "@/lib/offer"
import { captureAttribution, startTrackers } from "@/lib/track"

/** "pending" until the page has hydrated, so the server never guesses her choice. */
export function useConsent() {
  return useSyncExternalStore(subscribeConsent, () => getConsent() ?? "unset", () => "pending" as const)
}

/** Starts the pixel, the Google tag and stored attribution once she has accepted. */
export function Trackers() {
  const consent = useConsent()
  useEffect(() => {
    if (consent !== "granted") return
    captureAttribution()
    startTrackers()
  }, [consent])
  return null
}

/*
 * Asked once. Reject and Accept carry the same weight, as the ICO asks. On a
 * phone it sits over the logo and the photo at the top, so the calendar stays
 * in view and bookable while she decides; from sm up it sits bottom left, over
 * the photo, clear of the booking card.
 */
export function ConsentBanner() {
  const consent = useConsent()
  if (consent !== "unset") return null
  return (
    <section
      aria-label="Cookies"
      className="fixed inset-x-2 top-[calc(0.5rem+env(safe-area-inset-top))] z-30 rounded-[1.25rem] bg-surface p-3 shadow-[0_1px_2px_rgb(30_32_28/0.06),0_16px_40px_-12px_rgb(30_32_28/0.28)] ring-1 ring-black/[0.06] motion-safe:animate-[step-in_320ms_var(--ease-out-soft)] sm:inset-x-auto sm:top-auto sm:bottom-6 sm:left-6 sm:max-w-[25rem] sm:p-5"
    >
      <p className="px-1 text-[0.875rem] leading-snug text-ink-soft">
        May we use cookies from Meta and Google to measure our ads?{" "}
        <a href={CLINIC.privacyUrl} target="_blank" rel="noopener noreferrer" className="text-ink underline">
          Privacy policy
        </a>
      </p>
      <div className="mt-2.5 grid grid-cols-2 gap-2 sm:mt-4">
        <Button variant="secondary" size="md" onClick={() => setConsent("denied")}>
          Reject
        </Button>
        <Button variant="secondary" size="md" onClick={() => setConsent("granted")}>
          Accept
        </Button>
      </div>
    </section>
  )
}

/** Footer link that asks again. Trackers already running stop on the reload. */
export function CookieSettings({ className }: { className?: string }) {
  const consent = useConsent()
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        clearConsent()
        if (consent === "granted") window.location.reload()
      }}
    >
      Cookie settings
    </button>
  )
}
