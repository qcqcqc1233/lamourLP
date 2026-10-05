"use client"

import { useEffect, useState } from "react"
import { ArrowUpIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
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
 * Phone-only bar that brings her back to the booking once she has scrolled
 * past it. It stays out of the way while the booking is on screen or a
 * keyboard is open, so it never covers a time, a field or the booking button.
 */
export function StickyCta() {
  const [bookingVisible, setBookingVisible] = useState(true)
  const [typing, setTyping] = useState(false)

  useEffect(() => {
    const book = document.getElementById("book")
    if (!book || !("IntersectionObserver" in window)) return
    const bookIo = new IntersectionObserver(([e]) => setBookingVisible(e.isIntersecting))
    bookIo.observe(book)

    const isField = (t: EventTarget | null) => t instanceof HTMLElement && t.matches("input, textarea, select")
    const onFocusIn = (e: FocusEvent) => isField(e.target) && setTyping(true)
    const onFocusOut = (e: FocusEvent) => isField(e.target) && setTyping(false)
    document.addEventListener("focusin", onFocusIn)
    document.addEventListener("focusout", onFocusOut)
    return () => {
      bookIo.disconnect()
      document.removeEventListener("focusin", onFocusIn)
      document.removeEventListener("focusout", onFocusOut)
    }
  }, [])

  const show = !bookingVisible && !typing

  return (
    <div
      aria-hidden={!show}
      inert={!show}
      className={cn(
        "fixed inset-x-0 bottom-0 z-20 bg-paper/90 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-1px_0_var(--hairline)] backdrop-blur-md transition-transform duration-300 ease-[var(--ease-out-soft)] lg:hidden",
        show ? "translate-y-0" : "translate-y-[110%]",
      )}
    >
      <Button asChild size="xl" className="w-full">
        <a href="#book">
          Book my appointment
          <ArrowUpIcon data-icon="inline-end" strokeWidth={1.75} />
        </a>
      </Button>
    </div>
  )
}
