import { CLINIC, FACE_NECK, formatGBP } from "@/lib/offer"
import { cn } from "@/lib/utils"

/* The booked appointment: the one dark, solid object on the page, shown only
   once the booking is real. Everything before it stays light. The next thing
   she has to do (take the deposit call) is the first thing she reads. */

type Row = { label: string; value: string; strong?: boolean }

export function AppointmentSlip({
  heading,
  lead,
  when,
  className,
  children,
}: {
  heading: React.ReactNode
  lead: React.ReactNode
  when: string
  className?: string
  children?: React.ReactNode
}) {
  const rows: Row[] = [
    { label: "When", value: when },
    { label: "Where", value: `${CLINIC.street}, ${CLINIC.postcode}` },
    { label: "Length", value: "1 hour" },
    { label: "Total", value: formatGBP(FACE_NECK.totalPrice), strong: true },
  ]

  return (
    <section
      aria-label="Your appointment"
      className={cn("rounded-[1.5rem] bg-pine px-6 pt-7 pb-7 text-cream sm:px-9 sm:pt-9 sm:pb-9", className)}
    >
      {heading}
      <div className="mt-4">{lead}</div>
      <dl className="mt-7 flex flex-col gap-3 border-t border-[color:var(--rule-on-pine)] pt-6">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-4">
            <dt className="text-[0.875rem] text-on-pine-soft">{r.label}</dt>
            <dd className={cn("text-right tabular-nums", r.strong && "text-xl font-medium")}>{r.value}</dd>
          </div>
        ))}
      </dl>
      {children}
    </section>
  )
}
