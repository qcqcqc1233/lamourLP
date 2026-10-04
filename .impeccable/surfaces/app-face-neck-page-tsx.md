---
version: 1
slug: "app-face-neck-page-tsx"
primary_target: "app/face-neck/page.tsx"
related_targets: ["components/face-neck"]
---

# Surface: /face-neck (first face & neck treatment booking)

Scope: one route, `app/face-neck/page.tsx`, and its booking component. Visitor mode: Persuade.
Audience: women arriving on a phone from a Meta face & neck ad. Job: understand the offer and book a real hour.
Action: choose a day and an hour (London time), give name, email and phone, get a real appointment in the GHL "Non-Surgical Face & Neck Lift" calendar.
Proof on hand: real clinic interiors only (reception/retail floor, dark lounge, corridor). No reviews, no practitioner facts, no clinic results.
Constraints: offer facts come from `lib/offer.ts` only (£149 total, paid at the clinic, 1 hour, no needles or injections, little to no downtime). No deposit, no refund promise, no "not charged if unsuitable". British English. Old pages stay byte-identical.
Memorable moment: the appointment slip that fills in line by line as she chooses.
Unresolved: online deposit, cancellation policy, branded subdomain, campaign pixel, GA4.

## Direction contract

THESIS: The page opens inside the real clinic at 40 Rosslyn Hill and hands her the appointment: place, price and hour readable in one glance. It refuses the category default of a stock face close-up, gold script and a "free consultation" lead form.

OWN-WORLD: Bone ground #F4F0E7 with linen panels #FCFAF5; ink #23271F for all text; one deep pine #223528 owns every action and the whole booking surface. The stencil-didone wordmark leads; Bodoni Moda display echoes its hairline contrast; Jost for UI and body. Hairline ink rules, square-shouldered panels, photographs are real rooms, never faces.

STORY: She sees a real Hampstead clinic, learns it is a non-surgical face & neck treatment, £149 paid at the clinic, one hour; sees the hours are genuinely bookable; picks a day and hour in London time; leaves name, email, phone; gets an honest confirmation or a clear way to try another hour.

FIRST VIEWPORT: Phone 390x844: 56px bar, wordmark left, "Hampstead, London" right; real clinic photo band about 34vh with an address plate bottom-left; H1 in Bodoni about 34px; a ledger line "£149 · 1 hour · paid at the clinic"; full-width 52px pine button "See available appointments" above the fold. Desktop 1440: 1120px measure, copy column left 5/12 with H1 about 64px, photo right 7/12 at full viewport height with the pine address plate on it.

SIGNATURE: the appointment slip. A pine panel whose ruled lines (Treatment, Day, Time in London, Total, Paid now, At the clinic) ink in one by one as she chooses, then become the confirmation.

FORM: Place-led "The room on Rosslyn Hill", position 4 of the ordered structural list (dealt lead), seed key a3d50c56.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
