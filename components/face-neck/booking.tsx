"use client"

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import { CalendarPlusIcon, CheckIcon, DownloadIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { googleCalendarUrl, icsDataUrl } from "@/lib/calendar-links"
import { checkContact, type Field as ContactField, type FieldErrors } from "@/lib/contact"
import { BALANCE_AT_CLINIC, CLINIC, FACE_NECK, FACE_NECK_RULES, formatGBP } from "@/lib/offer"
import { bookableDays, formatDayLong, formatWeekdayShort, type Day } from "@/lib/schedule"
import { isTestVisit, readAttribution, readCookie, track } from "@/lib/track"
import { cn } from "@/lib/utils"

import { AppointmentSlip } from "./appointment-slip"

/* One question at a time: a day, then a time, then her details. Each step
   appears only when the one before it is answered, so the screen never asks
   for more than one decision. */

type Confirmed = {
  appointmentId: string
  booking: { start: string; end: string }
  test?: boolean
  cleanedUp?: boolean
  // Frozen at the moment of booking, so the confirmation never depends on
  // whether that day is still in the (moving) list of bookable days.
  when: string
}

type Phase = "choose" | "submitting" | "booked" | "lead_only"

const newEventId = () => `sched_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

// A minute-resolution clock. The static HTML cannot know today's date, so the
// server snapshot is null and the days appear once the page is running.
const clock = {
  subscribe(onChange: () => void) {
    const t = window.setInterval(onChange, 30000)
    return () => window.clearInterval(t)
  },
  now: () => Math.floor(Date.now() / 60000) * 60000,
  server: () => null,
}
const noSubscribe = () => () => {}

const NETWORK_ERROR =
  "We couldn't reach our booking system. Please check your connection and try again; your details are still here."

const monthName = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", month: "long" })
function rangeLabel(days: Day[]) {
  if (!days.length) return ""
  const a = days[0]
  const b = days[days.length - 1]
  const ma = monthName.format(new Date(Date.UTC(a.y, a.m - 1, a.d, 12)))
  const mb = monthName.format(new Date(Date.UTC(b.y, b.m - 1, b.d, 12)))
  return ma === mb ? `${a.d} to ${b.d} ${mb}` : `${a.d} ${ma} to ${b.d} ${mb}`
}

// The next step can open below the fold; bring it into view on every screen.
const isPhone = () => window.matchMedia("(max-width: 1023.98px)").matches
function reveal(el: HTMLElement | null) {
  if (!el) return
  const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  window.requestAnimationFrame(() =>
    el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start", inline: "nearest" }),
  )
}

export function Booking() {
  const now = useSyncExternalStore(clock.subscribe, clock.now, clock.server)
  const days = useMemo(() => (now ? bookableDays(new Date(now), FACE_NECK_RULES, FACE_NECK.durationMin) : null), [now])

  // A choice that time has overtaken (the hour passed while the page was open)
  // simply stops matching, and the visitor picks again.
  const [dayKey, setDayKey] = useState("")
  const [slotStart, setSlotStart] = useState("")
  const day = days?.find((d) => d.key === dayKey)
  const slot = day?.slots.find((s) => s.startUtc === slotStart)

  const [values, setValues] = useState<Record<ContactField, string>>({ name: "", email: "", phone: "" })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState("")
  const [notice, setNotice] = useState("")
  const [phase, setPhase] = useState<Phase>("choose")
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null)
  const testMode = useSyncExternalStore(noSubscribe, isTestVisit, () => false)

  // One id per chosen slot. A retry of the same slot reuses it, so the server
  // and Meta both see one booking however many times the button is pressed.
  const eventId = useRef("")
  const honeypot = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const daysRef = useRef<HTMLDivElement>(null)
  const timesRef = useRef<HTMLDivElement>(null)
  const detailsRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (phase !== "booked" && phase !== "lead_only") return
    const el = resultRef.current
    el?.focus({ preventScroll: true })
    el?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [phase])

  function chooseDay(key: string) {
    if (!key) return
    setDayKey(key)
    setSlotStart("")
    setNotice("")
    // Keep the days in view with the times opening just below them: on a
    // phone the day row goes to the top, on desktop the whole booking card.
    reveal(isPhone() ? daysRef.current : formRef.current)
  }

  function chooseTime(start: string) {
    if (!start || !day) return
    setSlotStart(start)
    setNotice("")
    setFormError("")
    eventId.current = newEventId()
    const s = day.slots.find((x) => x.startUtc === start)
    if (s) track.selectSlot(day.key, s.hour)
    // The details step mounts on this render; reveal it on the next frame.
    window.setTimeout(() => reveal(detailsRef.current), 0)
  }

  function update(field: ContactField, value: string) {
    setValues((v) => ({ ...v, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (phase === "submitting" || !slot || !day) return
    setFormError("")

    // The phone rules are only needed now, so they load on the first submit
    // instead of with the page.
    let parse: Parameters<typeof checkContact>[1]
    try {
      parse = (await import("libphonenumber-js/min")).parsePhoneNumberFromString
    } catch {
      setFormError(NETWORK_ERROR)
      return
    }
    const check = checkContact(values, parse)
    if (!check.ok) {
      setErrors(check.errors)
      const first = (["name", "email", "phone"] as const).find((f) => check.errors[f])
      const ref = first === "name" ? nameRef : first === "email" ? emailRef : phoneRef
      ref.current?.focus()
      return
    }
    setErrors({})
    if (!eventId.current) eventId.current = newEventId()
    setPhase("submitting")

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          slug: FACE_NECK.slug,
          name: check.value.name,
          email: check.value.email,
          phone: check.value.phone,
          startTime: slot.startLondon,
          eventId: eventId.current,
          test: isTestVisit(),
          company: honeypot.current?.value || "",
          fbp: readCookie("_fbp"),
          fbc: readCookie("_fbc"),
          fbclid: new URLSearchParams(window.location.search).get("fbclid") || undefined,
          pageUrl: window.location.href,
          attribution: readAttribution(),
        }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok && data.ok && data.status === "booked" && data.appointmentId) {
        track.lead(eventId.current)
        track.booked(eventId.current, FACE_NECK.totalPrice, FACE_NECK.currency)
        setConfirmed({ ...data, when: `${formatDayLong(day)}, ${slot.label}` })
        setPhase("booked")
        return
      }
      if (res.ok && data.ok && data.status === "lead_only") {
        track.lead(eventId.current)
        setPhase("lead_only")
        return
      }
      if (data.code === "slot_unavailable") {
        setNotice(data.error)
        setSlotStart("")
        setPhase("choose")
        timesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        return
      }
      if (data.code === "invalid" && data.fields) {
        setErrors(data.fields)
        setPhase("choose")
        return
      }
      setFormError(data.error || NETWORK_ERROR)
      setPhase("choose")
    } catch {
      setFormError(NETWORK_ERROR)
      setPhase("choose")
    }
  }

  /* ------------------------------------------------------------ booked */
  if (phase === "booked" && confirmed) {
    return (
      <div ref={resultRef} tabIndex={-1} className="scroll-mt-4 outline-none">
        <AppointmentSlip
          when={confirmed.when}
          heading={
            <h2 className="flex items-center gap-3 text-2xl leading-tight font-medium lg:text-[1.75rem]">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cream text-pine">
                <CheckIcon className="size-[1.125rem]" strokeWidth={2.25} aria-hidden />
              </span>
              Your appointment is booked
            </h2>
          }
          lead={
            <p className="text-[1.0625rem]">
              We&apos;ll call you before your visit to take the {formatGBP(FACE_NECK.deposit)} deposit. The remaining{" "}
              {formatGBP(BALANCE_AT_CLINIC)} is paid at the clinic.
            </p>
          }
        >
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Button asChild variant="cream" size="touch">
              <a href={googleCalendarUrl(confirmed.booking.start, confirmed.booking.end)} target="_blank" rel="noopener noreferrer">
                <CalendarPlusIcon data-icon="inline-start" strokeWidth={1.75} />
                Google Calendar
              </a>
            </Button>
            <Button asChild variant="outline-cream" size="touch">
              <a href={icsDataUrl(confirmed.booking.start, confirmed.booking.end, confirmed.appointmentId)} download="lamour-de-soi-appointment.ics">
                <DownloadIcon data-icon="inline-start" strokeWidth={1.75} />
                Apple or Outlook
              </a>
            </Button>
          </div>
          <p className="mt-6 text-[0.875rem] text-on-pine-soft">
            <a href={CLINIC.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-cream underline">
              Get directions
            </a>
            {" "}or, to change your appointment, call{" "}
            <a className="text-cream underline" href={`tel:${CLINIC.phoneE164}`}>
              {CLINIC.phoneDisplay}
            </a>
            .
          </p>
          {confirmed.test && (
            <p className="mt-4 text-[0.875rem] text-on-pine-soft">
              Test booking: created in the calendar{confirmed.cleanedUp ? " and removed again" : ", but it could not be removed automatically"}. Nothing was sent to Meta.
            </p>
          )}
        </AppointmentSlip>
      </div>
    )
  }

  if (phase === "lead_only") {
    return (
      <div ref={resultRef} tabIndex={-1} className="scroll-mt-4 outline-none">
        <Alert>
          <AlertTitle className="text-[1.0625rem] font-medium">We have your details, but your appointment is not confirmed yet.</AlertTitle>
          <AlertDescription className="text-[1.0625rem] text-foreground">
            Please call us on <a href={`tel:${CLINIC.phoneE164}`}>{CLINIC.phoneDisplay}</a> and we&apos;ll confirm a time with you.
            Please don&apos;t book again in the meantime.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const submitting = phase === "submitting"

  /* ---------------------------------------------------------- choosing */
  return (
    <form
      ref={formRef}
      onSubmit={submit}
      noValidate
      aria-busy={submitting}
      className="flex min-w-0 scroll-mt-6 flex-col gap-8 rounded-[1.5rem] bg-surface p-5 shadow-[0_1px_2px_rgb(30_32_28/0.04),0_24px_48px_-28px_rgb(30_32_28/0.22)] ring-1 ring-black/[0.04] lg:gap-10 lg:p-9"
    >
      {testMode && (
        <p className="rounded-lg bg-tint px-4 py-3 text-[0.875rem] text-ink-soft">
          Test mode: the booking is created and then removed, and nothing is sent to Meta.
        </p>
      )}

      <div ref={daysRef} className="min-w-0 scroll-mt-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="pick-day" className="text-[1.0625rem] font-medium lg:text-xl">
            Choose a day
          </h2>
          {days && days.length > 0 && <p className="text-[0.875rem] text-ink-soft">{rangeLabel(days)}</p>}
        </div>
        {days ? (
          days.length ? (
            <ToggleGroup
              type="single"
              variant="choice"
              size="choice"
              value={day ? dayKey : ""}
              onValueChange={chooseDay}
              aria-labelledby="pick-day"
              className="no-scrollbar -mx-5 mt-4 flex w-auto snap-x scroll-px-5 gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:scroll-px-0 lg:grid lg:w-full lg:grid-cols-6 lg:overflow-visible lg:px-0"
            >
              {days.map((d, i) => {
                // A new week starts on Monday: a small gap on the phone row, a new
                // row on desktop, where each day sits in its weekday column.
                const newWeek = i > 0 && d.weekday === 1
                return (
                  <ToggleGroupItem
                    key={d.key}
                    value={d.key}
                    style={{ "--col": d.weekday } as React.CSSProperties}
                    className={cn(
                      "w-[max(3.25rem,calc((100vw_-_5.75rem)/4.5))] shrink-0 snap-start flex-col gap-0.5 lg:w-auto lg:[grid-column-start:var(--col)]",
                      newWeek && "ml-4 lg:ml-0",
                    )}
                  >
                    <span className="text-[0.875rem] opacity-75">{formatWeekdayShort(d)}</span>
                    <span className="text-xl leading-none font-medium tabular-nums">{d.d}</span>
                  </ToggleGroupItem>
                )
              })}
            </ToggleGroup>
          ) : (
            <p className="mt-4">
              There are no online times left in the next two weeks. Please call us on{" "}
              <a href={`tel:${CLINIC.phoneE164}`} className="font-medium underline">
                {CLINIC.phoneDisplay}
              </a>
              .
            </p>
          )
        ) : (
          <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-hidden px-5 lg:mx-0 lg:grid lg:grid-cols-6 lg:px-0" aria-hidden>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-[4.25rem] w-[max(3.25rem,calc((100vw_-_5.75rem)/4.5))] shrink-0 rounded-xl bg-tint lg:w-auto" />
            ))}
          </div>
        )}
        {!days && (
          <p className="sr-only" role="status">
            Loading appointment times
          </p>
        )}
      </div>

      {day && (
        <div ref={timesRef} className="step-in scroll-mt-4" key={`times-${day.key}`}>
          <h2 id="pick-time" className="text-[1.0625rem] font-medium lg:text-xl">
            Choose a time
          </h2>
          {notice && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle className="text-[1.0625rem]">{notice}</AlertTitle>
            </Alert>
          )}
          <ToggleGroup
            type="single"
            variant="choice"
            size="choice"
            value={slot ? slotStart : ""}
            onValueChange={chooseTime}
            aria-labelledby="pick-time"
            className="mt-4 grid w-full grid-cols-3 gap-2"
          >
            {day.slots.map((s) => (
              <ToggleGroupItem key={s.startUtc} value={s.startUtc} className="tabular-nums">
                {s.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      )}

      {day && slot && (
        <div ref={detailsRef} className="step-in scroll-mt-4" key="details">
          <h2 className="text-[1.0625rem] font-medium lg:text-xl">Your details</h2>
          <p className="mt-1 text-ink-soft">
            {formatDayLong(day)} at {slot.label}
          </p>

          <FieldGroup className="mt-5 gap-4">
            <ContactInput
              id="name" label="Full name" autoComplete="name" type="text"
              value={values.name} error={errors.name} inputRef={nameRef}
              onChange={(v) => update("name", v)}
            />
            <ContactInput
              id="email" label="Email" autoComplete="email" type="email" inputMode="email"
              value={values.email} error={errors.email} inputRef={emailRef}
              onChange={(v) => update("email", v)}
            />
            <ContactInput
              id="phone" label="Mobile number" autoComplete="tel" type="tel" inputMode="tel"
              value={values.phone} error={errors.phone} inputRef={phoneRef}
              description={`We'll call this number to take a ${formatGBP(FACE_NECK.deposit)} deposit. The remaining ${formatGBP(BALANCE_AT_CLINIC)} is paid at the clinic.`}
              onChange={(v) => update("phone", v)}
            />
          </FieldGroup>

          {/* Honeypot: off-screen, people never fill it. */}
          <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label>
              Company
              <input ref={honeypot} type="text" name="company" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          {formError && (
            <Alert variant="destructive" className="mt-5">
              <AlertTitle className="text-[1.0625rem] font-normal">{formError}</AlertTitle>
            </Alert>
          )}

          <Button type="submit" size="xl" className="mt-6 w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner data-icon="inline-start" />
                Booking your appointment
              </>
            ) : (
              "Book my appointment"
            )}
          </Button>
          <p className="mt-3 text-center text-[0.875rem] text-ink-soft">
            Nothing is paid online.{" "}
            <a href={CLINIC.privacyUrl} target="_blank" rel="noopener noreferrer" className="underline">
              Privacy policy
            </a>
          </p>
        </div>
      )}
    </form>
  )
}

function ContactInput({
  id,
  label,
  description,
  error,
  value,
  onChange,
  inputRef,
  ...rest
}: {
  id: string
  label: string
  description?: string
  error?: string
  value: string
  onChange: (value: string) => void
  inputRef: React.RefObject<HTMLInputElement | null>
} & Pick<React.ComponentProps<"input">, "autoComplete" | "type" | "inputMode">) {
  const describedBy = error ? `${id}-error` : description ? `${id}-hint` : ""
  return (
    <Field data-invalid={Boolean(error) || undefined} className="gap-1.5">
      <FieldLabel htmlFor={id} className="text-[1.0625rem]">
        {label}
      </FieldLabel>
      <Input
        id={id}
        name={id}
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy || undefined}
        required
        {...rest}
      />
      {error ? (
        <FieldError id={`${id}-error`} className="text-[0.875rem]">
          {error}
        </FieldError>
      ) : (
        description && (
          <FieldDescription id={`${id}-hint`} className="text-[0.875rem]">
            {description}
          </FieldDescription>
        )
      )}
    </Field>
  )
}
