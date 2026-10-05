/* ---------------------------------------------------------------------------
   Client reviews for /face-neck.

   REVIEWS holds published reviews from real clients, used with their
   permission. The section appears for every visitor as soon as it has one.

   SAMPLE_REVIEWS is layout copy for showing the clinic how the section will
   look: open /face-neck?preview=reviews. It is never rendered for ordinary
   visitors (UK law bans fake reviews outright, DMCC Act 2024), so it must
   never be moved into REVIEWS. Replace it with real reviews instead.
--------------------------------------------------------------------------- */

export type Review = {
  quote: string
  name: string // first name and initial
  area: string
  month: string // e.g. "September 2026"
  rating: 1 | 2 | 3 | 4 | 5
}

export const REVIEWS: readonly Review[] = []

export const SAMPLE_REVIEWS: readonly Review[] = [
  {
    quote:
      "I'd put off doing anything about my neck for years because I didn't want needles. The assessment was thorough and nobody tried to sell me anything. A very calm hour, and I went straight back to work afterwards.",
    name: "Caroline H.",
    area: "Belsize Park",
    month: "September 2026",
    rating: 5,
  },
  {
    quote:
      "Booked on my phone on a Sunday evening and had a call the next morning about the deposit. Lovely clinic, and they explained what they were doing at every step.",
    name: "Priya S.",
    area: "West Hampstead",
    month: "September 2026",
    rating: 5,
  },
  {
    quote:
      "Honest advice, which I appreciated. My skin looked fresher by the evening and there was no redness to speak of. I've already booked my next one.",
    name: "Joanne W.",
    area: "Highgate",
    month: "August 2026",
    rating: 5,
  },
]
