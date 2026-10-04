import type { Metadata } from "next"
import Image from "next/image"
import Script from "next/script"
import { ArrowUpIcon, CheckIcon, MapPinIcon, PhoneIcon } from "lucide-react"

import { Booking } from "@/components/face-neck/booking"
import { PageEffects, StickyCta } from "@/components/face-neck/page-effects"
import { Wordmark } from "@/components/face-neck/wordmark"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { ADDRESS_ONE_LINE, BALANCE_AT_CLINIC, CLINIC, FACE_NECK, formatGBP } from "@/lib/offer"
import { PIXEL_ID } from "@/lib/track"

import clinicRosslynHill from "@/public/images/face-neck/clinic-rosslyn-hill.jpg"

const price = formatGBP(FACE_NECK.totalPrice)
const deposit = formatGBP(FACE_NECK.deposit)
const balance = formatGBP(BALANCE_AT_CLINIC)

export const metadata: Metadata = {
  title: `Non-surgical face & neck treatment in Hampstead · ${price} · L'amour De Soi`,
  description: `Book your first non-surgical face and neck treatment at L'amour De Soi, 40 Rosslyn Hill, Hampstead. One hour with an assessment, no needles or injections. ${price}: ${deposit} deposit by phone, ${balance} at the clinic.`,
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

const FAQ = [
  {
    q: "How much does the first visit cost?",
    a: (
      <p>
        {price} in total. After you book, we&apos;ll call you to take a {deposit} deposit by phone before your
        treatment, and the remaining {balance} is paid at the clinic. Nothing is paid online.
      </p>
    ),
  },
  {
    q: "What happens before treatment?",
    a: (
      <p>
        Your visit starts with an assessment. We look at your face and neck, talk about what you&apos;d like to
        improve, explain the treatment and check that it suits you before anything begins. If it isn&apos;t the right
        treatment for you, we&apos;ll tell you why.
      </p>
    ),
  },
  {
    q: "What results should I expect?",
    a: (
      <p>
        Results differ from person to person, so we don&apos;t promise a particular result from a single visit. At
        your assessment we&apos;ll explain what this treatment can do for your skin and whether further sessions
        would help.
      </p>
    ),
  },
  {
    q: "Can I change or cancel my appointment?",
    a: (
      <p>
        Call us on <a href={`tel:${CLINIC.phoneE164}`}>{CLINIC.phoneDisplay}</a> as early as you can and we&apos;ll
        help you move or cancel it.
      </p>
    ),
  },
  {
    q: "Where is the clinic and how long is the visit?",
    a: (
      <p>
        {CLINIC.name}, {ADDRESS_ONE_LINE}. Please allow one hour.{" "}
        <a href={CLINIC.mapsUrl} target="_blank" rel="noopener noreferrer">
          Get directions
        </a>
        .
      </p>
    ),
  },
]

/* The offer, read in a few seconds, right above the day picker. */
function Intro() {
  return (
    <>
      <h1 className="text-[1.875rem] leading-[1.1] font-medium tracking-[-0.02em] max-[359px]:text-[1.625rem] sm:text-[2.5rem] lg:text-[3rem]">
        Non-surgical face &amp; neck treatment in Hampstead
      </h1>
      <p className="mt-4 hidden max-w-[32rem] text-lg sm:block">
        Your first visit starts with an assessment and a clear explanation of the treatment.
      </p>

      <div className="mt-4 flex items-baseline gap-3 max-[359px]:mt-3 sm:mt-6">
        <p className="text-[2.25rem] leading-none font-semibold tracking-[-0.02em] tabular-nums lg:text-[2.75rem]">{price}</p>
        <p className="text-[0.9375rem] leading-snug text-ink-soft">
          first treatment
          <br />1 hour, assessment included
        </p>
      </div>
      <p className="mt-3 max-w-[32rem] text-[0.9375rem] leading-snug max-[359px]:mt-2">
        Book online, nothing to pay now. We&apos;ll call you to take a <strong className="font-semibold">{deposit} deposit</strong>; the
        remaining {balance} is paid at the clinic.
      </p>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[0.9375rem] max-[359px]:mt-3 max-[359px]:gap-x-2.5 max-[359px]:text-[0.875rem]">
        <li className="flex items-center gap-1.5">
          <CheckIcon className="size-4 text-pine" aria-hidden />
          No needles or injections
        </li>
        <li className="flex items-center gap-1.5">
          <CheckIcon className="size-4 text-pine" aria-hidden />
          Little to no downtime
        </li>
        <li className="flex items-center gap-1.5">
          <MapPinIcon className="size-4 text-pine" aria-hidden />
          {CLINIC.street}, {CLINIC.postcode}
        </li>
      </ul>
    </>
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

      <header className="border-b border-border">
        <div className="mx-auto flex h-[var(--header-h)] max-w-[72rem] items-center justify-between gap-4 px-5">
          <Wordmark className="h-[1.375rem] w-auto shrink-0 text-ink sm:h-7" />
          <a
            href={`tel:${CLINIC.phoneE164}`}
            className="flex items-center gap-1.5 text-[0.9375rem] whitespace-nowrap text-ink-soft hover:text-ink"
          >
            <PhoneIcon className="size-4 text-pine" aria-hidden />
            {CLINIC.phoneDisplay}
          </a>
        </div>
      </header>

      <main>
        {/* ------------------------------------------ offer + booking */}
        <section id="book" aria-labelledby="book-title" className="scroll-mt-2">
          <div className="mx-auto max-w-[72rem] px-5 pt-6 pb-14 max-[359px]:pt-4 lg:pt-10 lg:pb-20">
            <Booking intro={<Intro />} />
          </div>
        </section>

        {/* ------------------------------------------ what you're booking */}
        <section className="border-t border-border bg-linen">
          <div className="mx-auto grid max-w-[72rem] gap-8 px-5 py-14 md:grid-cols-12 md:gap-12 lg:py-20">
            <h2 className="text-[1.75rem] leading-[1.15] font-medium tracking-[-0.015em] md:col-span-4 lg:text-[2.25rem]">
              What you&apos;re booking
            </h2>
            <dl className="border-t border-ink md:col-span-8">
              {[
                ["Treatment", "A non-surgical treatment for the face and neck"],
                ["Your first visit", "An assessment and a clear explanation, then the treatment if it suits you"],
                ["How it's done", "No needles and no injections"],
                ["Afterwards", "Little to no downtime"],
                ["Time", "Allow one hour"],
                ["Price", `${price} in total: a ${deposit} deposit by phone before your visit, then ${balance} at the clinic`],
              ].map(([term, detail]) => (
                <div key={term} className="grid gap-1 border-b border-border py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
                  <dt className="text-[0.9375rem] text-ink-soft">{term}</dt>
                  <dd className="text-[1.0625rem]">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ------------------------------------------------- the clinic */}
        <section className="mx-auto max-w-[72rem] px-5 py-14 lg:py-20">
          <div className="grid gap-8 md:grid-cols-12 md:items-center md:gap-12">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg md:col-span-7">
              <Image
                src={clinicRosslynHill}
                alt="Inside L'amour De Soi at 40 Rosslyn Hill: armchairs, orchids and tall arched windows"
                fill
                sizes="(min-width: 1024px) 640px, (min-width: 768px) 58vw, 100vw"
                className="object-cover object-[30%_55%]"
              />
            </div>
            <div className="md:col-span-5">
              <h2 className="text-[1.75rem] leading-[1.15] font-medium tracking-[-0.015em] lg:text-[2.25rem]">
                A skin clinic on Rosslyn Hill
              </h2>
              <p className="mt-4">
                {CLINIC.name} is a skin clinic at {CLINIC.street} in Hampstead, and your appointment takes place
                here, at the clinic. We keep your look natural.
              </p>
              <p className="mt-6 border-t border-border pt-4 text-[0.9375rem] text-ink-soft">
                {CLINIC.hoursDisplay}.
                <br />
                <a href={CLINIC.mapsUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-pine underline">
                  Get directions
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------- the visit */}
        <section className="border-t border-border bg-linen">
          <div className="mx-auto max-w-[72rem] px-5 py-14 lg:py-20">
            <h2 className="text-[1.75rem] leading-[1.15] font-medium tracking-[-0.015em] lg:text-[2.25rem]">Your visit</h2>
            <p className="mt-2 text-ink-soft">One hour at {CLINIC.street}, in this order.</p>
            <ol className="mt-8 grid gap-6 md:grid-cols-3 md:gap-8">
              {[
                ["Assessment", "We look at your face and neck, talk about what you'd like to improve and explain the treatment."],
                ["Treatment, if it suits you", "If the treatment is right for you, it goes ahead in the same visit. No needles and no injections."],
                ["Before you leave", "Aftercare advice, and our honest view on whether further sessions would help."],
              ].map(([title, text], i) => (
                <li key={title} className="border-t-2 border-pine pt-4">
                  <h3 className="text-xl font-medium">
                    <span className="text-pine tabular-nums">{i + 1}.</span> {title}
                  </h3>
                  <p className="mt-2">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------------------------------------------------------- FAQ */}
        <section className="mx-auto grid max-w-[72rem] gap-8 px-5 py-14 md:grid-cols-12 md:gap-12 lg:py-20">
          <h2 className="text-[1.75rem] leading-[1.15] font-medium tracking-[-0.015em] md:col-span-4 lg:text-[2.25rem]">
            Before you book
          </h2>
          <Accordion type="single" collapsible className="border-t border-ink md:col-span-8">
            {FAQ.map(({ q, a }) => (
              <AccordionItem key={q} value={q} className="border-b border-border last:border-b">
                <AccordionTrigger className="min-h-14 items-center py-4 text-left text-[1.0625rem] font-medium hover:no-underline">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="max-w-[40rem] pb-5 text-[1.0625rem] text-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* -------------------------------------------------------- close */}
        <section className="bg-pine text-cream">
          <div className="mx-auto max-w-[72rem] px-5 py-16 lg:py-24">
            <Wordmark className="mb-10 h-auto w-full max-w-[34rem] text-cream lg:mb-14" />
            <h2 className="max-w-[40rem] text-[2rem] leading-[1.1] font-medium tracking-[-0.02em] lg:text-[2.75rem]">
              Book your first face &amp; neck treatment
            </h2>
            <p className="mt-4 max-w-[36rem] text-on-pine-soft lg:text-lg">
              One hour at {CLINIC.street}, Hampstead, with an assessment first. {price}: a {deposit} deposit by phone,
              then {balance} at the clinic.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="cream" size="xl">
                <a href="#book">
                  Choose your appointment
                  <ArrowUpIcon data-icon="inline-end" />
                </a>
              </Button>
              <Button asChild variant="outline-cream" size="xl">
                <a href={CLINIC.mapsUrl} target="_blank" rel="noopener noreferrer">
                  <MapPinIcon data-icon="inline-start" />
                  Get directions
                </a>
              </Button>
            </div>
            <p className="mt-6 text-on-pine-soft">
              Have a question before booking?{" "}
              <a href={`tel:${CLINIC.phoneE164}`} className="font-medium text-cream underline">
                Call {CLINIC.phoneDisplay}
              </a>
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-pine-deep pb-28 text-on-pine-soft lg:pb-0">
        <div className="mx-auto grid max-w-[72rem] gap-6 px-5 py-10 text-[0.9375rem] sm:grid-cols-3">
          <p className="text-cream">We keep your look natural.</p>
          <address className="not-italic">
            {CLINIC.name}
            <br />
            {CLINIC.street}, {CLINIC.area}
            <br />
            {CLINIC.city} {CLINIC.postcode}
            <br />
            {CLINIC.hoursDisplay}
          </address>
          <ul className="flex flex-col gap-2">
            <li>
              <a href={`tel:${CLINIC.phoneE164}`} className="inline-flex min-h-6 items-center gap-2 text-cream underline">
                <PhoneIcon className="size-4" aria-hidden />
                {CLINIC.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={CLINIC.privacyUrl} target="_blank" rel="noopener noreferrer" className="text-cream underline">
                Privacy policy
              </a>
            </li>
            <li>
              <a href={CLINIC.siteUrl} target="_blank" rel="noopener noreferrer" className="text-cream underline">
                lamourdesoi.co.uk
              </a>
            </li>
          </ul>
        </div>
      </footer>

      <StickyCta />
    </>
  )
}
