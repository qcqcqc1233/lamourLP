"use client"

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import { parsePhoneNumberFromString } from "libphonenumber-js/min"
import { CalendarPlusIcon, DownloadIcon, MapPinIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { googleCalendarUrl, icsDataUrl } from "@/lib/calendar-links"
import { checkContact, type Field as ContactField, type FieldErrors } from "@/lib/contact"
import { CLINIC, FACE_NECK, FACE_NECK_RULES } from "@/lib/offer"
import {
  bookableDays,
  formatDayLong,
  formatMonthShort,
  formatWeekdayShort,
  type Day,
} from "@/lib/schedule"
import { isTestVisit, readAttribution, readCookie, track } from "@/lib/track"

import { AppointmentSlip } from "./appointment-slip"
import styles from "./booking.module.css"

type Confirmed = {
  appointmentId: string
  booking: { start: string; end: string }
  test?: boolean
  cleanedUp?: boolean
  // Frozen at the moment of booking, so the confirmation never depends on
  // whether that day is still in the (moving) list of bookable days.
  dayLabel: string
  timeLabel: string
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
  const timesRef = useRef<HTMLDivElement>(null)
  const daysRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (phase === "booked" || phase === "lead_only") resultRef.current?.focus()
  }, [phase])

  function chooseDay(key: string) {
    if (!key) return
    setDayKey(key)
    setSlotStart("")
    setNotice("")
  }

  function chooseTime(start: string) {
    if (!start || !day) return
    setSlotStart(start)
    setNotice("")
    setFormError("")
    eventId.current = newEventId()
    const s = day.slots.find((x) => x.startUtc === start)
    if (s) track.selectSlot(day.key, s.hour)
  }

  function update(field: ContactField, value: string) {
    setValues((v) => ({ ...v, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (phase === "submitting") return
    setFormError("")

    if (!slot || !day) {
      setFormError(day ? "Please choose a time first." : "Please choose a day and a time first.")
      ;(day ? timesRef : daysRef).current?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }

    const check = checkContact(values, parsePhoneNumberFromString)
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
        setConfirmed({ ...data, dayLabel: formatDayLong(day), timeLabel: `${slot.label}, London time` })
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

  const dayLabel = day ? formatDayLong(day) : undefined
  const timeLabel = slot ? `${slot.label}, London time` : undefined

  if (phase === "booked" && confirmed) {
    return (
      <div ref={resultRef} tabIndex={-1} className="outline-none">
        <AppointmentSlip
          heading={<h3 className="text-[1.75rem]">Your appointment is confirmed.</h3>}
          dayLabel={confirmed.dayLabel}
          timeLabel={confirmed.timeLabel}
          className="mx-auto max-w-xl"
        >
          <p className="mt-5 text-on-pine-soft">
            It&apos;s in our calendar. Please arrive a few minutes early at {CLINIC.street}, {CLINIC.area}.
          </p>
          <div className="mt-5 flex flex-col gap-3">
            <Button asChild variant="cream" size="touch">
              <a href={googleCalendarUrl(confirmed.booking.start, confirmed.booking.end)} target="_blank" rel="noopener noreferrer">
                <CalendarPlusIcon data-icon="inline-start" />
                Add to Google Calendar
              </a>
            </Button>
            <Button asChild variant="outline-cream" size="touch">
              <a href={icsDataUrl(confirmed.booking.start, confirmed.booking.end, confirmed.appointmentId)} download="lamour-de-soi-appointment.ics">
                <DownloadIcon data-icon="inline-start" />
                Apple or Outlook calendar
              </a>
            </Button>
            <Button asChild variant="outline-cream" size="touch">
              <a href={CLINIC.mapsUrl} target="_blank" rel="noopener noreferrer">
                <MapPinIcon data-icon="inline-start" />
                Get directions
              </a>
            </Button>
          </div>
          <p className="mt-5 text-on-pine-soft">
            Need to change it? Call us on{" "}
            <a className="font-medium text-cream underline" href={`tel:${CLINIC.phoneE164}`}>
              {CLINIC.phoneDisplay}
            </a>
            .
          </p>
          {confirmed.test && (
            <p className="mt-4 rounded-md border border-[color:var(--rule-on-pine)] px-3 py-2 text-[0.9375rem] text-on-pine-soft">
              Test booking: created in the calendar{confirmed.cleanedUp ? " and removed again" : ", but it could not be removed automatically"}. Nothing was sent to Meta.
            </p>
          )}
        </AppointmentSlip>
      </div>
    )
  }

  if (phase === "lead_only") {
    return (
      <div ref={resultRef} tabIndex={-1} className="mx-auto max-w-xl outline-none">
        <Alert>
          <AlertTitle className="text-lg">We have your details, but your appointment is not confirmed yet.</AlertTitle>
          <AlertDescription className="text-base text-foreground">
            Please call us on <a href={`tel:${CLINIC.phoneE164}`}>{CLINIC.phoneDisplay}</a> and we&apos;ll confirm a time with you.
            Please don&apos;t book again in the meantime.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const submitting = phase === "submitting"

  return (
    <>
    {testMode && (
      <p className="mb-6 rounded-md border border-dashed border-input px-3 py-2 text-[0.9375rem] text-ink-soft">
        Test mode: the booking is created and then removed, and nothing is sent to Meta.
      </p>
    )}
    <form className={styles.layout} onSubmit={submit} noValidate aria-busy={submitting}>

      <div className={styles.day} ref={daysRef}>
        <h3 id="pick-day" className="text-lg font-medium">1. Choose a day</h3>
        {days ? (
          days.length ? (
            <ToggleGroup
              type="single"
              variant="choice"
              size="choice"
              value={day ? dayKey : ""}
              onValueChange={chooseDay}
              aria-labelledby="pick-day"
              className="mt-3 grid w-full grid-cols-4 gap-2 sm:grid-cols-6"
            >
              {days.map((d) => (
                <ToggleGroupItem key={d.key} value={d.key} aria-label={formatDayLong(d)} className="flex-col gap-0 leading-tight">
                  <DayFace day={d} />
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          ) : (
            <p className="mt-3">
              There are no online times left in the next two weeks. Please call us on{" "}
              <a href={`tel:${CLINIC.phoneE164}`} className="font-medium underline">{CLINIC.phoneDisplay}</a>.
            </p>
          )
        ) : (
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6" aria-hidden>
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="h-[4.25rem] rounded-lg border border-border bg-card/60" />
            ))}
          </div>
        )}
        {!days && <p className="sr-only" role="status">Loading appointment times</p>}
      </div>

      <div className={styles.time} ref={timesRef}>
        <h3 id="pick-time" className="text-lg font-medium">
          2. Choose a time <span className="font-normal text-ink-soft">(London time)</span>
        </h3>
        {notice && (
          <Alert variant="destructive" className="mt-3">
            <AlertTitle className="text-base">{notice}</AlertTitle>
          </Alert>
        )}
        {day ? (
          <ToggleGroup
            type="single"
            variant="choice"
            size="choice"
            value={slot ? slotStart : ""}
            onValueChange={chooseTime}
            aria-labelledby="pick-time"
            className="mt-3 grid w-full grid-cols-4 gap-2"
          >
            {day.slots.map((s) => (
              <ToggleGroupItem key={s.startUtc} value={s.startUtc} className="tabular-nums">
                {s.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        ) : (
          <p className="mt-3 text-ink-soft">Choose a day to see the times.</p>
        )}
      </div>

      <AppointmentSlip
        className={styles.slip}
        heading={<h3>Your appointment</h3>}
        dayLabel={dayLabel}
        timeLabel={timeLabel}
      />

      <div className={styles.details}>
        <h3 className="text-lg font-medium">3. Your details</h3>
        <FieldGroup className="mt-3 gap-4">
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
            description="UK numbers can start with 07. From abroad, start with your country code, e.g. +33."
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
            <AlertTitle className="text-base font-normal">{formError}</AlertTitle>
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
        <p className="mt-3 text-center text-[0.9375rem] text-ink-soft">
          Nothing to pay now. The £{FACE_NECK.totalPrice} is paid at the clinic.
        </p>
        <p className="mt-2 text-center text-[0.9375rem] text-ink-soft">
          We use your details only to manage your appointment.{" "}
          <a href={CLINIC.privacyUrl} target="_blank" rel="noopener noreferrer" className="underline">
            Privacy policy
          </a>
        </p>
      </div>
    </form>
    </>
  )
}

function DayFace({ day }: { day: Day }) {
  return (
    <>
      <span className="text-[0.8125rem] font-medium tracking-wide uppercase opacity-80">{formatWeekdayShort(day)}</span>
      <span className="font-display text-[1.375rem] leading-none tabular-nums">{day.d}</span>
      <span className="text-[0.8125rem] opacity-80">{formatMonthShort(day)}</span>
    </>
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
  const describedBy = [description ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ")
  return (
    <Field data-invalid={Boolean(error) || undefined}>
      <FieldLabel htmlFor={id} className="text-base">{label}</FieldLabel>
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
      {description && <FieldDescription id={`${id}-hint`} className="text-[0.9375rem]">{description}</FieldDescription>}
      {error && <FieldError id={`${id}-error`} className="text-[0.9375rem]">{error}</FieldError>}
    </Field>
  )
}
