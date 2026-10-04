"use client"

import { useEffect, useState } from "react"
import { ArrowDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatGBP, FACE_NECK } from "@/lib/offer"
import { captureAttribution, track } from "@/lib/track"
import { cn } from "@/lib/utils"

/** Remembers the ad that brought her here and notes when the booking section is first seen. */
export function PageEffects() {
  useEffect(() => {
    captureAttribution()
    const book = document.getElementById("book")
    if (!book || !("IntersectionObserver" in window)) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          track.viewBooking()
          io.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    io.observe(book)
    return () => io.disconnect()
  }, [])
  return null
}

/**
 * Phone-only bar that appears whenever the hero's button is off screen, and
 * steps aside whenever the booking section is on screen or a keyboard is open,
 * so it never covers a time, a field or the booking button.
 */
export function StickyCta() {
  const [heroGone, setHeroGone] = useState(false)
  const [bookingVisible, setBookingVisible] = useState(false)
  const [typing, setTyping] = useState(false)

  useEffect(() => {
    const hero = document.getElementById("hero-cta")
    const book = document.getElementById("book")
    if (!hero || !book || !("IntersectionObserver" in window)) return
    // Out of view either way: scrolled past, or still below the fold on a
    // short screen (in-app browsers), where no button would otherwise show.
    const heroIo = new IntersectionObserver(([e]) => setHeroGone(!e.isIntersecting))
    const bookIo = new IntersectionObserver(([e]) => setBookingVisible(e.isIntersecting), { rootMargin: "0px 0px -10% 0px" })
    heroIo.observe(hero)
    bookIo.observe(book)

    const isField = (t: EventTarget | null) => t instanceof HTMLElement && t.matches("input, textarea, select")
    const onFocusIn = (e: FocusEvent) => isField(e.target) && setTyping(true)
    const onFocusOut = (e: FocusEvent) => isField(e.target) && setTyping(false)
    document.addEventListener("focusin", onFocusIn)
    document.addEventListener("focusout", onFocusOut)
    return () => {
      heroIo.disconnect()
      bookIo.disconnect()
      document.removeEventListener("focusin", onFocusIn)
      document.removeEventListener("focusout", onFocusOut)
    }
  }, [])

  const show = heroGone && !bookingVisible && !typing

  return (
    <div
      aria-hidden={!show}
      inert={!show}
      className={cn(
        "fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bone/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-sm transition-transform duration-500 ease-[var(--ease-out-expo)] lg:hidden",
        show ? "translate-y-0" : "translate-y-[110%]",
      )}
    >
      <Button asChild size="xl" className="w-full">
        <a href="#book">
          See available appointments · {formatGBP(FACE_NECK.totalPrice)}
          <ArrowDownIcon data-icon="inline-end" />
        </a>
      </Button>
    </div>
  )
}
