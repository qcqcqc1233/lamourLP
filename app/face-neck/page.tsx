import type { Metadata } from "next"
import Image from "next/image"
import Script from "next/script"
import { ArrowDownIcon, MapPinIcon, PhoneIcon } from "lucide-react"

import { Booking } from "@/components/face-neck/booking"
import { PageEffects, StickyCta } from "@/components/face-neck/page-effects"
import { Wordmark } from "@/components/face-neck/wordmark"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { ADDRESS_ONE_LINE, CLINIC, FACE_NECK, formatGBP } from "@/lib/offer"
import { PIXEL_ID } from "@/lib/track"

import clinicRosslynHill from "@/public/images/face-neck/clinic-rosslyn-hill.jpg"
import clinicLounge from "@/public/images/face-neck/clinic-lounge.jpg"

const price = formatGBP(FACE_NECK.totalPrice)

export const metadata: Metadata = {
  title: `Non-surgical face & neck treatment in Hampstead · ${price} · L'amour De Soi`,
  description: `Book your first non-surgical face and neck treatment at L'amour De Soi, 40 Rosslyn Hill, Hampstead. One hour with an assessment, no needles or injections, ${price} paid at the clinic.`,
  alternates: { canonical: "/face-neck" },
  // A campaign landing page, reached from ads; the clinic's site carries search.
  robots: { index: false, follow: false },
  openGraph: {
    title: "Non-surgical face & neck treatment in Hampstead",
    description: `One hour at 40 Rosslyn Hill with an assessment. ${price}, paid at the clinic.`,
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
        {price} for your first face and neck treatment visit, paid at the clinic. You don&apos;t pay anything online
        to book.
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
        Yes. Call us on <a href={`tel:${CLINIC.phoneE164}`}>{CLINIC.phoneDisplay}</a> as early as you can and
        we&apos;ll move or cancel it for you.
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

export default function FaceNeckPage() {
  return (
    <>
      {/* Meta pixel: the account pixel with the Conversions API attached.
          Skipped entirely on ?test=1 visits. */}
      <Script id="meta-pixel" strategy="afterInteractive">
        {`if(!/[?&]test=1(&|$)/.test(location.search)){!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');fbq('trackSingle','${PIXEL_ID}','PageView');}`}
      </Script>
      <PageEffects />

      <a
        href="#book"
        className="sr-only z-50 bg-pine px-4 py-3 text-cream focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to booking
      </a>

      <header className="border-b border-border">
        <div className="mx-auto flex h-[var(--header-h)] max-w-[70rem] items-center justify-between gap-4 px-5">
          <Wordmark className="h-[1.375rem] w-auto text-ink sm:h-6" />
          <p className="text-[0.9375rem] text-ink-soft">Hampstead, London</p>
        </div>
      </header>

      <main>
        {/* ---------------------------------------------------------- hero */}
        <section className="mx-auto max-w-[70rem] px-5 lg:grid lg:grid-cols-12 lg:gap-12 lg:py-10">
          <div className="relative -mx-5 h-[30svh] min-h-[13.5rem] max-h-[22rem] overflow-hidden lg:order-last lg:col-span-7 lg:mx-0 lg:h-[calc(100svh-var(--header-h)-5rem)] lg:min-h-[34rem] lg:max-h-[48rem] lg:rounded-lg">
            <Image
              src={clinicRosslynHill}
              alt="Inside L'amour De Soi at 40 Rosslyn Hill: armchairs, orchids and tall arched windows"
              priority
              fill
              sizes="(min-width: 1024px) 640px, 100vw"
              className="object-cover object-[30%_55%]"
            />
            <p className="absolute bottom-0 left-0 flex items-center gap-2 bg-pine px-4 py-2.5 text-[0.9375rem] text-cream lg:bottom-6 lg:left-6 lg:rounded-md lg:px-5 lg:py-3">
              <MapPinIcon className="size-4" aria-hidden />
              {CLINIC.street}, {CLINIC.area} {CLINIC.postcode.split(" ")[0]}
            </p>
          </div>

          <div className="pt-7 pb-10 lg:col-span-5 lg:flex lg:flex-col lg:justify-center lg:py-0">
            <h1 className="font-display text-[2.125rem] leading-[1.06] tracking-[-0.01em] sm:text-[2.75rem] lg:text-[3.75rem]">
              Non-surgical face &amp; neck treatment in Hampstead.
            </h1>
            <p className="mt-4 max-w-[34rem] text-[1.0625rem] lg:mt-6 lg:text-lg">
              Your first visit starts with an assessment and a clear explanation of the treatment. No needles, no
              injections, and little to no downtime.
            </p>

            <div className="mt-6 flex items-end justify-between gap-4 border-y border-border py-4 lg:mt-8">
              <div>
                <p className="text-[0.9375rem] text-ink-soft">First treatment</p>
                <p className="font-display text-[2.75rem] leading-none tabular-nums">{price}</p>
              </div>
              <p className="max-w-[12rem] text-right text-[0.9375rem] leading-snug">
                One hour, assessment included.
                <br />
                Paid at the clinic.
              </p>
            </div>
            <p className="mt-3 text-[0.9375rem] text-ink-soft">Nothing to pay when you book.</p>

            <Button asChild size="xl" className="mt-6 w-full sm:w-auto" id="hero-cta">
              <a href="#book">
                See available appointments
                <ArrowDownIcon data-icon="inline-end" />
              </a>
            </Button>
            <p className="mt-4 flex items-start gap-2 text-[0.9375rem]">
              <MapPinIcon className="mt-1 size-4 shrink-0 text-pine" aria-hidden />
              <span>{ADDRESS_ONE_LINE}</span>
            </p>
          </div>
        </section>

        {/* ------------------------------------------------- the clinic */}
        <section className="border-t border-border bg-linen">
          <div className="mx-auto grid max-w-[70rem] gap-8 px-5 py-14 md:grid-cols-12 md:items-center md:gap-12 lg:py-20">
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg md:col-span-7">
              <Image
                src={clinicLounge}
                alt="The quiet waiting area at the clinic, two dark armchairs under a lamp"
                fill
                sizes="(min-width: 1024px) 640px, (min-width: 768px) 58vw, 100vw"
                className="object-cover object-[40%_60%]"
              />
            </div>
            <div className="md:col-span-5">
              <h2 className="font-display text-[2rem] leading-[1.1] lg:text-[2.5rem]">A skin clinic on Rosslyn Hill</h2>
              <p className="mt-4">
                {CLINIC.name} is a skin clinic at {CLINIC.street} in Hampstead. Your appointment takes place here,
                at the clinic.
              </p>
              <blockquote className="mt-6 border-t border-border pt-4 font-display text-[1.375rem] leading-snug">
                &ldquo;We keep your look natural.&rdquo;
              </blockquote>
              <p className="mt-6 text-[0.9375rem] text-ink-soft">
                {CLINIC.hoursDisplay}.
                <br />
                <a href={CLINIC.mapsUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-pine underline">
                  Get directions
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------ what you're booking */}
        <section className="mx-auto max-w-[70rem] px-5 py-14 lg:py-20">
          <div className="grid gap-8 md:grid-cols-12 md:gap-12">
            <h2 className="font-display text-[2rem] leading-[1.1] md:col-span-4 lg:text-[2.5rem]">What you&apos;re booking</h2>
            <dl className="border-t border-ink md:col-span-8">
              {[
                ["Treatment", "A non-surgical treatment for the face and neck"],
                ["Your first visit", "An assessment and a clear explanation, then the treatment if it suits you"],
                ["How it's done", "No needles and no injections"],
                ["Afterwards", "Little to no downtime"],
                ["Time", "Allow one hour"],
                ["Price", `${price} in total, paid at the clinic`],
              ].map(([term, detail]) => (
                <div key={term} className="grid gap-1 border-b border-border py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
                  <dt className="text-[0.9375rem] text-ink-soft">{term}</dt>
                  <dd className="text-[1.0625rem]">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ------------------------------------------------------ booking */}
        <section id="book" className="scroll-mt-4 border-y border-border bg-linen" aria-labelledby="book-title">
          <div className="mx-auto max-w-[70rem] px-5 py-14 lg:py-20">
            <h2 id="book-title" className="font-display text-[2.25rem] leading-[1.08] lg:text-[3rem]">
              Choose your appointment
            </h2>
            <p className="mt-3 text-[1.0625rem]">
              {FACE_NECK.title} · one hour · {price}, paid at the clinic
            </p>
            <ol className="mt-4 flex flex-wrap gap-x-2 gap-y-1 text-[0.9375rem] text-ink-soft">
              <li>Choose a day and time</li>
              <li aria-hidden>→</li>
              <li>Enter your details</li>
              <li aria-hidden>→</li>
              <li>Confirmed in our calendar</li>
            </ol>
            <div className="mt-10 min-h-[38rem] lg:min-h-[30rem]">
              <Booking />
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------- the visit */}
        <section className="mx-auto max-w-[70rem] px-5 py-14 lg:py-20">
          <div className="grid gap-8 md:grid-cols-12 md:gap-12">
            <div className="md:col-span-4">
              <h2 className="font-display text-[2rem] leading-[1.1] lg:text-[2.5rem]">Your visit</h2>
              <p className="mt-4 text-ink-soft">One hour at {CLINIC.street}.</p>
            </div>
            <ol className="border-t border-ink md:col-span-8">
              {[
                ["Assessment", "We look at your face and neck, talk about what you'd like to improve and explain the treatment."],
                ["Treatment, if it suits you", "If the treatment is right for you, it goes ahead in the same visit. No needles and no injections."],
                ["Before you leave", "Aftercare advice, and our honest view on whether further sessions would help."],
              ].map(([title, text]) => (
                <li key={title} className="border-b border-border py-5">
                  <h3 className="text-lg font-medium">{title}</h3>
                  <p className="mt-1 max-w-[38rem]">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------------------------------------------------------- FAQ */}
        <section className="border-t border-border bg-linen">
          <div className="mx-auto grid max-w-[70rem] gap-8 px-5 py-14 md:grid-cols-12 md:gap-12 lg:py-20">
            <h2 className="font-display text-[2rem] leading-[1.1] md:col-span-4 lg:text-[2.5rem]">Before you book</h2>
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
          </div>
        </section>

        {/* -------------------------------------------------------- close */}
        <section className="bg-pine text-cream">
          <div className="mx-auto max-w-[70rem] px-5 py-16 lg:py-24">
            <h2 className="max-w-[40rem] font-display text-[2.25rem] leading-[1.08] lg:text-[3.25rem]">
              Book your first face &amp; neck treatment.
            </h2>
            <p className="mt-4 max-w-[36rem] text-on-pine-soft lg:text-lg">
              One hour at {CLINIC.street}, Hampstead, with an assessment first. {price}, paid at the clinic.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="cream" size="xl">
                <a href="#book">
                  See available appointments
                  <ArrowDownIcon data-icon="inline-end" />
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
        <div className="mx-auto grid max-w-[70rem] gap-6 px-5 py-10 text-[0.9375rem] sm:grid-cols-3">
          <div>
            <Wordmark className="h-5 w-auto text-cream" />
            <p className="mt-3">We keep your look natural.</p>
          </div>
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
