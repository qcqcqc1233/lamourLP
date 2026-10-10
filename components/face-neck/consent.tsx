"use client"

import { useEffect, useSyncExternalStore } from "react"

import { Button } from "@/components/ui/button"
import { markNoticeSeen, noticeSeen, subscribeNotice } from "@/lib/consent"
import { CLINIC } from "@/lib/offer"
import { captureAttribution, startTrackers } from "@/lib/track"

/** Starts the pixel, the Google tag and stored attribution on page load. */
export function Trackers() {
  useEffect(() => {
    captureAttribution()
    startTrackers()
  }, [])
  return null
}

/*
 * A notice, not a question: one line and an OK that hides it. On a phone it
 * sits over the logo and the photo at the top, so the calendar stays in view;
 * from sm up it sits bottom left, over the photo, clear of the booking card.
 * Hidden on the server and until hydration, so it never flashes for someone
 * who has already seen it.
 */
export function ConsentBanner() {
  const seen = useSyncExternalStore(subscribeNotice, noticeSeen, () => true)
  if (seen) return null
  return (
    <section
      aria-label="Cookies"
      className="fixed inset-x-2 top-[calc(0.5rem+env(safe-area-inset-top))] z-30 flex items-center gap-3 rounded-[1.25rem] bg-surface p-3 shadow-[0_1px_2px_rgb(30_32_28/0.06),0_16px_40px_-12px_rgb(30_32_28/0.28)] ring-1 ring-black/[0.06] motion-safe:animate-[step-in_320ms_var(--ease-out-soft)] sm:inset-x-auto sm:top-auto sm:bottom-6 sm:left-6 sm:max-w-[26rem] sm:p-4"
    >
      <p className="flex-1 px-1 text-[0.875rem] leading-snug text-ink-soft">
        By using this site you agree to our use of cookies, including Meta and Google to measure our ads.{" "}
        <a href={CLINIC.privacyUrl} target="_blank" rel="noopener noreferrer" className="text-ink underline">
          Privacy policy
        </a>
      </p>
      <Button variant="secondary" size="md" className="shrink-0" onClick={markNoticeSeen}>
        OK
      </Button>
    </section>
  )
}
