/* ---------------------------------------------------------------------------
   Meta Conversions API: the server copy of a browser event.

   The browser pixel and this call send the SAME event_name and event_id, so
   Meta keeps one conversion and recovers the ones iOS or an ad blocker drop.
--------------------------------------------------------------------------- */

import "server-only"

import crypto from "node:crypto"

export const sha256 = (v: string) => crypto.createHash("sha256").update(String(v).trim().toLowerCase()).digest("hex")

// Meta's own format for a click id when the _fbc cookie was not written yet
// (Safari, ad blockers, a fast submit). Built only from a real fbclid.
export function buildFbc(fbc?: string, fbclid?: string) {
  if (fbc) return fbc
  if (!fbclid) return undefined
  return `fb.1.${Date.now()}.${fbclid}`
}

export const capiConfigured = () => Boolean(process.env.META_PIXEL_ID && process.env.META_CAPI_TOKEN)

export async function sendCapi(event: {
  eventName: string
  eventId: string
  email: string
  phone: string
  fbp?: string
  fbc?: string
  pageUrl?: string
  ip?: string
  ua?: string
  contentName: string
  value?: number
}) {
  const pixel = process.env.META_PIXEL_ID
  const token = process.env.META_CAPI_TOKEN
  if (!pixel || !token) return { skipped: "no pixel or token configured" }
  const version = process.env.META_GRAPH_VERSION || "v24.0"
  const testCode = process.env.META_TEST_EVENT_CODE

  const payload = {
    data: [
      {
        event_name: event.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        event_source_url: event.pageUrl,
        action_source: "website",
        user_data: {
          em: [sha256(event.email)],
          ph: [sha256(event.phone.replace(/\D/g, ""))],
          ...(event.fbp ? { fbp: event.fbp } : {}),
          ...(event.fbc ? { fbc: event.fbc } : {}),
          ...(event.ip ? { client_ip_address: event.ip } : {}),
          ...(event.ua ? { client_user_agent: event.ua } : {}),
        },
        custom_data: {
          content_name: event.contentName,
          ...(event.value ? { value: event.value, currency: process.env.META_CURRENCY || "GBP" } : {}),
        },
      },
    ],
    ...(testCode ? { test_event_code: testCode } : {}),
  }

  const res = await fetch(`https://graph.facebook.com/${version}/${pixel}/events?access_token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000),
  })
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) console.error("capi rejected", res.status, JSON.stringify(body))
  return { ok: res.ok, status: res.status, events_received: body.events_received, fbtrace_id: body.fbtrace_id }
}
