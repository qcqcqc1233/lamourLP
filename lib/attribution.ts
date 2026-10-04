/* ---------------------------------------------------------------------------
   Where a booking came from: UTMs and ad click ids, first and last touch.

   Kept to a fixed list of keys and short strings. No name, email, phone or
   anything medical ever goes in here, because these values also travel to
   analytics.
--------------------------------------------------------------------------- */

export const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "utm_id",
  "fbclid",
  "gclid",
  "ttclid",
  "campaign_id",
  "adset_id",
  "ad_id",
] as const

export type Touch = Partial<Record<(typeof ATTRIBUTION_KEYS)[number] | "landing_page" | "referrer" | "at", string>>
export type Attribution = { first?: Touch; last?: Touch }

const MAX = 300

export function cleanTouch(input: unknown): Touch | undefined {
  if (!input || typeof input !== "object") return undefined
  const src = input as Record<string, unknown>
  const out: Touch = {}
  for (const key of [...ATTRIBUTION_KEYS, "landing_page", "referrer", "at"] as const) {
    const v = src[key]
    if (typeof v === "string" && v.trim()) out[key] = v.trim().slice(0, MAX)
  }
  return Object.keys(out).length ? out : undefined
}

export function cleanAttribution(input: unknown): Attribution {
  const src = (input && typeof input === "object" ? input : {}) as Record<string, unknown>
  return { first: cleanTouch(src.first), last: cleanTouch(src.last) }
}

export const describeTouch = (t?: Touch) =>
  t
    ? Object.entries(t)
        .map(([k, v]) => `${k}=${v}`)
        .join(", ")
    : "none"
