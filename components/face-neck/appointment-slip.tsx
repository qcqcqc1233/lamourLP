import { BALANCE_AT_CLINIC, CLINIC, FACE_NECK, formatGBP } from "@/lib/offer"
import { cn } from "@/lib/utils"

/* The appointment slip: a pine card whose lines ink in as the visitor chooses,
   then becomes the confirmation. Each value is keyed by its content, so a new
   choice replays the ink-in instead of swapping silently. */

type Line = { label: string; value?: string; placeholder?: string; strong?: boolean }

export function AppointmentSlip({
  heading,
  dayLabel,
  timeLabel,
  className,
  children,
}: {
  heading: React.ReactNode
  dayLabel?: string
  timeLabel?: string
  className?: string
  children?: React.ReactNode
}) {
  const lines: Line[] = [
    { label: "Treatment", value: "Face & neck, non-surgical" },
    { label: "Day", value: dayLabel, placeholder: "Choose a day" },
    { label: "Time", value: timeLabel, placeholder: "Choose a time" },
    { label: "Length", value: "1 hour, assessment included" },
    { label: "Where", value: `${CLINIC.street}, ${CLINIC.postcode}` },
  ]
  const money: Line[] = [
    { label: "Total", value: formatGBP(FACE_NECK.totalPrice), strong: true },
    { label: "Deposit, by phone", value: formatGBP(FACE_NECK.deposit) },
    { label: "At the clinic", value: formatGBP(BALANCE_AT_CLINIC) },
  ]

  return (
    <section
      aria-label="Your appointment"
      className={cn("rounded-lg bg-pine px-5 pt-5 pb-6 text-cream shadow-[0_18px_40px_-24px_rgb(24_42_30/0.55)] sm:px-6", className)}
    >
      <div className="leading-tight">{heading}</div>
      <dl className="mt-4">
        {lines.map((l) => (
          <SlipRow key={l.label} {...l} />
        ))}
      </dl>
      <dl className="mt-4 border-t border-[color:var(--rule-on-pine)] pt-1">
        {money.map((l) => (
          <SlipRow key={l.label} {...l} />
        ))}
      </dl>
      {children}
    </section>
  )
}

function SlipRow({ label, value, placeholder, strong }: Line) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[color:var(--rule-on-pine)] py-2.5 last:border-b-0">
      <dt className="shrink-0 text-[0.9375rem] text-on-pine-soft">{label}</dt>
      <dd className="text-right">
        {value ? (
          <span key={value} className={cn("ink-in inline-block", strong ? "text-[1.375rem] leading-none font-semibold" : "font-medium")}>
            {value}
          </span>
        ) : (
          <span className="text-on-pine-soft">{placeholder}</span>
        )}
      </dd>
    </div>
  )
}
