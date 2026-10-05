# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui, deployed on the existing Vercel project `lamoure-eyebag` from GitHub `qcqcqc1233/lamourLP`. User decision, 2026-10-04. The older campaign pages (`/`, `/lift`, `/nonsurgical-lift`) stay as static files served unchanged while live campaigns still point at them.

## Users

Women in and around Hampstead / North London, mostly arriving on a phone from a Meta ad (Instagram / Facebook in-app browser) about a face and neck treatment. They have seen one short creative, know nothing else about the clinic, and decide within seconds whether this is a real, nearby, fairly priced appointment they can book now.

## Product Purpose

A single-service booking page for the clinic's first face & neck treatment visit. Success is a real appointment created in the clinic's GoHighLevel calendar for that service, with the visitor knowing exactly what she booked, where, when (London time) and what she will pay. Leads without an appointment, clicks and page views are not success.

## Positioning

L'amour De Soi is a premium skin clinic at 40 Rosslyn Hill, Hampstead, London NW3 1NH. The offer is one concrete, fixed-price first visit at a physical Hampstead clinic, not a free consultation, a sales call or a package.

## Operating Context

- Traffic: Meta ads (A/B/C creatives of the same idea, separated by UTMs), mostly mobile in-app browsers.
- Booking: the page shows fixed hourly start times (09:00-17:00, Mon-Sat, London time, kept deliberately) and posts to `/api/book`, which upserts the contact and creates the appointment in GHL server-side. Calendar, price and duration are decided on the server from config, never from the browser.
- CRM: GoHighLevel sub-account (location ending `so8M`). Face & neck calendar = the "Non-Surgical Face & Neck Lift" calendar (id ending `kb6B`).
- Measurement: Meta pixel `1178133073434960` (has CAPI on the server; confirmed as the campaign pixel 2026-10-05) and `27589073474112473`; GA4 `G-ZN3W0XQ1E5`. On `/face-neck` both load only after cookie consent (UK GDPR/PECR), and the server sends CAPI only when the consent cookie says granted.

## Capabilities and Constraints

Confirmed by the user (2026-10-04):
- First face & neck treatment: **£149 total**. Nothing is paid online. After the online booking **the clinic phones the client to take a £35 deposit** before the treatment; the remaining **£114 is paid at the clinic**. The appointment counts as booked from the moment it is made online (confirmed 2026-10-04).
- The visit is **one hour** and includes an assessment.
- **No needles and no injections.**
- **Little to no downtime.**
- GHL calendar: Non-Surgical Face & Neck Lift.

Explicitly NOT confirmed, so never published:
- "Not charged if the treatment is not suitable" (the user did not confirm it).
- Any refund, cancellation window, deposit refund terms, discount or crossed-out price.
- Device or technology name, specific results, timing of results, number of sessions.
- Practitioner name, credentials, years of experience, ratings or review counts.

Open decisions: online deposit payment (today the deposit is taken by phone), cancellation and deposit-refund policy, branded subdomain (needs DNS access), real client reviews.

## Brand Commitments

- Name: L'amour De Soi (wordmark logo is a high-contrast stencil serif in black).
- All customer-facing copy in British English.
- Light base (white / light cream), dark text, one accent colour for actions. Not a gold-everywhere "luxury clinic" template.
- Logo: use the wordmark traced from the clinic's 2000px logo file (`components/face-neck/wordmark.tsx`).
- Headings must be highly legible: the user rejected a thin high-contrast display serif (Bodoni) as unreadable. Headings use Jost.
- The booking must be reachable instantly: the day picker sits in the first viewport on phone and desktop. No large hero photo above it. No dark or gloomy interior photos.
- Calm, never busy (user verdict 2026-10-05 on a dense build: "chaos for the eyes"): one question at a time, no bordered tiles, no heavy summary while choosing, each fact stated once.
- Tagline used across the clinic's pages: "We keep your look natural."
- No countdowns, fake scarcity, popups, exit intent, review carousels or struck-through prices.

## Evidence on Hand

- Logo: high-resolution file supplied by the user (2000x2000 JPG, in the project folder); the old Shopify `New_Project.png` is 180x100 and too small.
- Real clinic photos on the Shopify CDN: reception and retail floor (`70736c49-...jpg`, also `clinic.jpg`), dark waiting lounge (`9b451b82-...jpg`), corridor (`e9e86b0e-..._2.jpg`).
- Treatment images in the repo (`images/nonsurgical.webp`, `images/lift.webp`) and on Shopify (`neck.jpg` before/after) are not verified as this clinic's own work: never present them as clinic results.
- No verified reviews or testimonials yet. Never publish invented ones (UK DMCC Act 2024). While the page is a mockup for the clinic (no ad traffic, per the user 2026-10-05), sample review copy shows for every visitor (`SHOW_SAMPLE_REVIEWS` in `lib/reviews.ts`). Before the page takes real traffic, turn it off or replace it with real reviews in `REVIEWS`.
- Phone published on the live Shopify booking page: 07401 460465.
- Opening hours, confirmed by the clinic 2026-10-05: Monday-Saturday 09:00-18:00, Sunday closed. Two hours' notice for same-day bookings is confirmed.

## Product Principles

1. One page, one service, one action: book the first face & neck visit.
2. Say the price, the place and the duration before asking for anything.
3. Never show a state the system has not reached: no "confirmed" without a real appointment id.
4. Every claim on the page is one the clinic confirmed; absence of proof is shown as absence, not filled.
5. Mobile in-app browser first: fast, legible, thumb-reachable.

## Accessibility & Inclusion

WCAG 2.2 AA: body text 16-18px, 48px minimum touch targets, visible focus, real labels, errors next to the field, price and terms never in small grey text, reduced-motion respected.
