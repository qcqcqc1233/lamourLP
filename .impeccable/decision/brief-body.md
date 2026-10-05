# Surface: /face-neck (first face & neck treatment booking)

Scope: one route, `app/face-neck/page.tsx`, and its booking component. Visitor mode: Persuade.
Audience: women 45-65 arriving on a phone from a Meta face & neck ad. Job: understand the offer and book a real hour within seconds.
Action: choose a day, then a time, then leave name, email and phone; a real appointment is created in the GHL "Non-Surgical Face & Neck Lift" calendar. The clinic then phones to take a £35 deposit.
Proof on hand: one bright real clinic interior. No reviews, no practitioner facts, no clinic results.
Constraints: offer facts come from `lib/offer.ts` only (£149 total, £35 deposit by phone, £114 at the clinic, 1 hour with an assessment, no needles or injections, little to no downtime). No refund promise. British English. Old pages stay byte-identical.
User verdicts that bind: thin serif headings unreadable; big photo above booking rejected; dark photos rejected; the dense booking-first build was "chaos for the eyes".
Unresolved: treatment or device name, practitioner, reviews, cancellation and deposit-refund policy, branded subdomain, campaign pixel, GA4.

## Direction contract

THESIS: One question at a time. The page asks for a day, then a time, then her details, and shows nothing else while she decides. It refuses the booking-widget default of every option, box and summary on screen at once.

OWN-WORLD: Quiet off-white page #FAFAF8, white surface for the booking card, soft neutral fill #F3F3EF for chips and one quiet band; ink #1E201C and one soft ink #5B5F57; deep pine #223528 only for the chosen day and time, the main button and the booked confirmation. Jost throughout on a five-step scale (display 32/48, section 24/28, title 20, body 17, small 14) in two weights. No borders on choices, separation by space, one radius family (12px controls, 20-24px surfaces). The traced stencil wordmark in the header only.

STORY: She reads what it is, where, the price with the deposit by phone, then taps a day; times open below; she taps a time; her details open with the chosen time echoed; she books and sees "Your appointment is booked" with the deposit call explained.

FIRST VIEWPORT: Phone 390x664: wordmark and a phone icon; a bright 2:1 clinic photo strip (orchids, white chairs); H1 28px over two lines; one row of three quiet pills (1 hour, No needles, £149 first visit); then the white booking card with "Choose a day" and a swipeable row of soft day chips ending around 516px. Desktop 1366x768: left column H1 48px, pills, then the photo (3:2); the white booking card starts at the top of the right column. The deposit is explained at the phone field, right before the button, and leads the confirmation.

SIGNATURE: progressive disclosure: each step appears softly (8px rise, 320ms) only when the one before it is answered, and the booked state replaces the light card with one solid pine confirmation that leads with the deposit call.

FORM: "The appointment book" kept booking-led, rebuilt as a one-question-at-a-time flow after the user's critique on 2026-10-05; seed key a3d50c56.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
