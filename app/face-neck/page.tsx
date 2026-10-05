import type { Metadata } from "next"
import Image from "next/image"
import Script from "next/script"
import { ArrowUpIcon, PhoneIcon } from "lucide-react"

import { Booking } from "@/components/face-neck/booking"
import { PageEffects, StickyCta } from "@/components/face-neck/page-effects"
import { Wordmark } from "@/components/face-neck/wordmark"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { BALANCE_AT_CLINIC, CLINIC, FACE_NECK, formatGBP } from "@/lib/offer"
import { PIXEL_ID } from "@/lib/track"

import clinicOrchids from "@/public/images/face-neck/clinic-orchids.jpg"

const price = formatGBP(FACE_NECK.totalPrice)
const deposit = formatGBP(FACE_NECK.deposit)
const balance = formatGBP(BALANCE_AT_CLINIC)

export const metadata: Metadata = {
  title: `Non-surgical face & neck treatment in Hampstead · ${price} · L'amour De Soi`,
  description: `Book your first non-surgical face and neck treatment at L'amour De Soi, 40 Rosslyn Hill, Hampstead. One hour with an assessment, no needles or injections. ${price}, with a ${deposit} deposit taken by phone.`,
  alternates: { canonical: "/face-neck" },
  // A campaign landing page, reached from ads; the clinic's site carries search.
  robots: { index: false, follow: false },
  openGraph: {
    title: "Non-surgical face & neck treatment in Hampstead",
    description: `One hour at 40 Rosslyn Hill with an assessment. ${price}.`,
    url: "/face-neck",
    siteName: "L'amour De Soi",
    locale: "en_GB",
    type: "website",
  },
}

const STEPS = [
  ["Assessment", "We look at your face and neck, talk about what you'd like to improve and explain the treatment."],
  ["Treatment, if it suits you", "If it's right for you, the treatment goes ahead in the same visit."],
  ["Aftercare", "Advice for the days after, and our honest view on whether more sessions would help."],
] as const

const FAQ = [
  {
    q: "How much does the first visit cost?",
    a: `${price} in total. Nothing is paid online: after you book, we call you to take a ${deposit} deposit, and the remaining ${balance} is paid at the clinic.`,
  },
  {
    q: "What happens before treatment?",
    a: "Your visit starts with an assessment. We look at your face and neck, explain the treatment and check that it suits you before anything begins. If it isn't right for you, we'll tell you why.",
  },
  {
    q: "What results should I expect?",
    a: "Results differ from person to person, so we don't promise a particular result from one visit. At your assessment we'll explain what the treatment can do for your skin and whether more sessions would help.",
  },
  {
    q: "How do I change my appointment?",
    a: `Call us on ${CLINIC.phoneDisplay}.`,
  },
]

function ClinicPhoto({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="relative aspect-[3/2] overflow-hidden rounded-[1.25rem]">
        <Image
          src={clinicOrchids}
          alt="White armchairs and orchids in the lounge at L'amour De Soi, 40 Rosslyn Hill"
          fill
          sizes="(min-width: 1024px) 600px, 100vw"
          className="object-cover"
        />
      </div>
    </div>
  )
}

export default function FaceNeckPage() {
  return (
    <>
      {/* Meta pixel: the account pixel with the Conversions API attached.
          Skipped entirely on ?test=1 visits. */}
      <Script id="meta-pixel" strategy="afterInteractive">
        {`if(!/[?&]test=1(&|$)/.test(location.search)){!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');fbq('trackSingle','${PIXEL_ID}','PageView');}`}
      </Script>
      <PageEffects />

      <header className="mx-auto flex h-[var(--header-h)] max-w-[68rem] items-center justify-between px-5">
        <Wordmark className="h-[1.375rem] w-auto text-ink sm:h-6" />
        <a
          href={`tel:${CLINIC.phoneE164}`}
          aria-label={`Call the clinic on ${CLINIC.phoneDisplay}`}
          className="-mr-2.5 flex size-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-tint"
        >
          <PhoneIcon className="size-5" strokeWidth={1.5} aria-hidden />
        </a>
      </header>

      <main>
        {/* ------------------------------------------ offer + booking */}
        <section id="book" aria-labelledby="hero-title" className="scroll-mt-2">
          <div className="mx-auto grid max-w-[68rem] grid-cols-[minmax(0,1fr)] gap-9 px-5 pt-6 pb-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start lg:gap-16 lg:pt-14 lg:pb-28">
            <div className="lg:sticky lg:top-10">
              <h1
                id="hero-title"
                className="text-[2rem] leading-[1.12] font-medium tracking-[-0.02em] lg:text-[3rem] lg:leading-[1.08]"
              >
                Non-surgical face &amp; neck treatment in Hampstead
              </h1>
              <p className="mt-4 max-w-[30rem] text-ink-soft lg:mt-5">
                One hour, with an assessment first. No needles or injections, and little to no downtime.
              </p>
              <p className="mt-5 max-w-[30rem]">
                <span className="font-medium">{price}</span> for your first visit. We call you to take a {deposit}{" "}
                deposit; the rest is paid at the clinic.
              </p>
            </div>

            <div className="min-w-0">
              <Booking />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ the clinic */}
        <section className="bg-tint">
          <div className="mx-auto grid max-w-[68rem] grid-cols-[minmax(0,1fr)] gap-8 px-5 py-16 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-center lg:gap-16 lg:py-24">
            <div className="lg:order-last">
              <h2 className="text-2xl leading-[1.2] font-medium tracking-[-0.015em] lg:text-[1.75rem]">
                A skin clinic on Rosslyn Hill
              </h2>
              <p className="mt-2 text-ink-soft">Your appointment is here, at {CLINIC.name} in Hampstead.</p>
              <dl className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
                <div>
                  <dt className="text-[0.875rem] text-ink-soft">Address</dt>
                  <dd className="mt-1">
                    {CLINIC.street}, {CLINIC.area}, {CLINIC.city} {CLINIC.postcode}
                    <br />
                    <a href={CLINIC.mapsUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-pine underline">
                      Get directions
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.875rem] text-ink-soft">Opening hours</dt>
                  <dd className="mt-1">Monday to Saturday, 10:00 to 18:00</dd>
                </div>
                <div>
                  <dt className="text-[0.875rem] text-ink-soft">Phone</dt>
                  <dd className="mt-1">
                    <a href={`tel:${CLINIC.phoneE164}`} className="font-medium text-pine underline">
                      {CLINIC.phoneDisplay}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
            <ClinicPhoto />
          </div>
        </section>

        {/* ---------------------------------------------- the first visit */}
        <section className="mx-auto max-w-[68rem] px-5 py-16 lg:py-24">
          <h2 className="text-2xl leading-[1.2] font-medium tracking-[-0.015em] lg:text-[1.75rem]">Your first visit</h2>
          <ol className="mt-8 grid gap-10 md:grid-cols-3 md:gap-12">
            {STEPS.map(([title, text], i) => (
              <li key={title}>
                <span
                  aria-hidden
                  className="flex size-9 items-center justify-center rounded-full bg-tint text-[0.875rem] font-medium text-pine tabular-nums"
                >
                  {i + 1}
                </span>
                <h3 className="mt-4 text-xl font-medium">{title}</h3>
                <p className="mt-2 text-ink-soft">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------------------------------------------------------- FAQ */}
        <section className="mx-auto max-w-[68rem] px-5 pb-16 lg:pb-24">
          <div className="max-w-[44rem]">
            <h2 className="text-2xl leading-[1.2] font-medium tracking-[-0.015em] lg:text-[1.75rem]">Questions</h2>
            <Accordion type="single" collapsible className="mt-6">
              {FAQ.map(({ q, a }) => (
                <AccordionItem key={q} value={q} className="border-b border-border">
                  <AccordionTrigger className="min-h-16 items-center py-5 text-left text-[1.0625rem] font-medium hover:no-underline">
                    {q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 text-[1.0625rem] text-ink-soft">
                    <p>{a}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* -------------------------------------------------------- close */}
        <section className="mx-auto max-w-[68rem] px-5 pb-24 lg:pb-32">
          <div className="rounded-[1.5rem] bg-tint px-6 py-14 text-center lg:py-20">
            <h2 className="text-2xl leading-[1.2] font-medium tracking-[-0.015em] lg:text-[1.75rem]">
              Book your first visit
            </h2>
            <Button asChild size="xl" className="mt-7">
              <a href="#book">
                Book my appointment
                <ArrowUpIcon data-icon="inline-end" strokeWidth={1.75} />
              </a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[68rem] flex-col gap-2 px-5 py-10 pb-28 text-[0.875rem] text-ink-soft sm:flex-row sm:flex-wrap sm:justify-between lg:pb-10">
          <p>{CLINIC.name}, Hampstead</p>
          <p className="flex gap-5">
            <a href={`tel:${CLINIC.phoneE164}`} className="underline">
              {CLINIC.phoneDisplay}
            </a>
            <a href={CLINIC.privacyUrl} target="_blank" rel="noopener noreferrer" className="underline">
              Privacy policy
            </a>
          </p>
        </div>
      </footer>

      <StickyCta />
    </>
  )
}
