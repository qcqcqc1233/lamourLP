/* ---------------------------------------------------------------------------
   Client reviews for /face-neck.

   REVIEWS holds published reviews from real clients, used with their
   permission. When it has any, they replace the sample set.

   SAMPLE_REVIEWS is layout copy: the page is currently a mockup for the clinic
   and takes no ad traffic, so it shows while SHOW_SAMPLE_REVIEWS is true.
   Before the page takes real traffic, set it to false or fill REVIEWS: fake
   reviews on a live consumer page are banned in the UK (DMCC Act 2024).
--------------------------------------------------------------------------- */

export type Review = {
  quote: string
  name: string // first name and initial
  area: string
  month: string // e.g. "September 2026"
  rating: 1 | 2 | 3 | 4 | 5
}

export const REVIEWS: readonly Review[] = []

export const SHOW_SAMPLE_REVIEWS = true

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
