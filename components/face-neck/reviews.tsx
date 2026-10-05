"use client"

import { useSyncExternalStore } from "react"
import { StarIcon } from "lucide-react"

import { REVIEWS, SAMPLE_REVIEWS } from "@/lib/reviews"
import { cn } from "@/lib/utils"

const noSubscribe = () => () => {}
const isReviewPreview = () => new URLSearchParams(window.location.search).get("preview") === "reviews"

/*
 * Real reviews when there are any. The sample set only for the clinic's own
 * preview link; ordinary visitors see nothing until real reviews arrive.
 * Stacked on phones (no carousel, so none is hidden off screen), three columns from 1024px.
 */
export function Reviews() {
  const preview = useSyncExternalStore(noSubscribe, isReviewPreview, () => false)
  const list = REVIEWS.length > 0 ? REVIEWS : preview ? SAMPLE_REVIEWS : []
  if (list.length === 0) return null

  return (
    <section aria-labelledby="reviews-title" className="mx-auto max-w-[68rem] px-5 pb-16 lg:pb-24">
      <h2 id="reviews-title" className="text-2xl leading-[1.2] font-medium tracking-[-0.015em] lg:text-[1.75rem]">
        What clients say
      </h2>
      <ul className="mt-6 grid gap-3 lg:grid-cols-3 lg:gap-5">
        {list.map((r) => (
          <li
            key={r.name}
            className="flex flex-col rounded-[1.25rem] bg-surface p-6 shadow-[0_1px_2px_rgb(30_32_28/0.04),0_16px_32px_-24px_rgb(30_32_28/0.2)] ring-1 ring-black/[0.04] lg:p-7"
          >
            <div role="img" aria-label={`${r.rating} out of 5 stars`} className="flex gap-0.5 text-pine">
              {Array.from({ length: 5 }, (_, i) => (
                <StarIcon
                  key={i}
                  className={cn("size-4", i < r.rating ? "fill-current" : "opacity-25")}
                  strokeWidth={1.5}
                  aria-hidden
                />
              ))}
            </div>
            <blockquote className="mt-4 text-[1.0625rem] leading-relaxed text-pretty">
              <p>&ldquo;{r.quote}&rdquo;</p>
            </blockquote>
            <p className="mt-auto pt-6 text-[0.875rem] text-ink-soft">
              <span className="font-medium text-ink">{r.name}</span>
              {" · "}
              {r.area}
              {" · "}
              {r.month}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
