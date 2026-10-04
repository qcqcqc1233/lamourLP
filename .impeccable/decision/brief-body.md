# Surface: /face-neck (first face & neck treatment booking)

Scope: one route, `app/face-neck/page.tsx`, and its booking component. Visitor mode: Persuade.
Audience: women arriving on a phone from a Meta face & neck ad. Job: understand the offer and book a real hour within seconds.
Action: choose a day and an hour (London time), give name, email and phone, get a real appointment in the GHL "Non-Surgical Face & Neck Lift" calendar. The clinic then phones to take a £35 deposit.
Proof on hand: one bright real clinic interior (reception floor). No reviews, no practitioner facts, no clinic results. Dark interiors were rejected by the user.
Constraints: offer facts come from `lib/offer.ts` only (£149 total, £35 deposit by phone, £114 at the clinic, 1 hour with an assessment, no needles or injections, little to no downtime). No refund promise, no "not charged if unsuitable". British English. Old pages stay byte-identical.
Memorable moment: the appointment slip that fills in line by line as she chooses.
Unresolved: online deposit, cancellation policy, branded subdomain, campaign pixel, GA4.

## Direction contract

THESIS: The booking is the page. The offer and the day picker share the first screen, so the first tap is a day, not a scroll. It refuses the category default of a big mood photo, a slogan and a button that leads somewhere else.

OWN-WORLD: Bone ground #F4F0E7 with linen panels #FCFAF5; ink #23271F text; one deep pine #223528 owns every action, every chosen day and time, and the appointment slip. The clinic's stencil wordmark, traced from its 2000px logo, is the only decorative letterform; everything else is Jost (medium for headings, regular for text) for instant legibility. Hairline rules, square-shouldered panels, real bright rooms only.

STORY: In one glance she reads what it is, where, £149 with a £35 deposit taken by phone and £114 at the clinic, and that it is one hour with no needles; she taps a day, an hour, sees the slip fill in, leaves name, email and phone, and gets "Your appointment is booked" with the deposit call explained.

FIRST VIEWPORT: Phone 390x664: 56px bar, wordmark left, phone number right; H1 30px Jost medium over two lines; £149 at 36px semibold beside "first treatment / 1 hour, assessment included"; one deposit sentence; two ticks and the address; a hairline, "Choose your appointment" and the first two rows of day tiles. Desktop 1366x768: left 5/12 H1 48px, lede, price, deposit, ticks, then the pine slip; right 7/12 a linen booking panel with day tiles, times and the first form fields all above the fold.

SIGNATURE: the appointment slip. A pine panel whose ruled lines (Treatment, Day, Time in London, Length, Where, Total, Deposit by phone, At the clinic) ink in one by one as she chooses, then become the confirmation.

FORM: Booking-led "The appointment book" (card 2 of the original round, position 2 of the ordered structural list), adopted on the user's direction on 2026-10-04 after reviewing the place-led build; seed key a3d50c56.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
