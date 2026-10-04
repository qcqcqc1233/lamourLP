/* ---------------------------------------------------------------------------
   A small GoHighLevel client. The token never leaves the server.
--------------------------------------------------------------------------- */

import "server-only"

const GHL_BASE = "https://services.leadconnectorhq.com"

export const CONTACT_VERSIONS = [process.env.GHL_VERSION_CONTACTS || "v3", "2021-07-28"]
export const CALENDAR_VERSIONS = [process.env.GHL_VERSION_CALENDARS || "v3", "2021-04-15"]

export const ghlConfigured = () => Boolean(process.env.GHL_PRIVATE_TOKEN && process.env.GHL_LOCATION_ID)
export const locationId = () => process.env.GHL_LOCATION_ID as string

export class GhlError extends Error {
  status: number
  body: unknown
  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

type Method = "GET" | "POST" | "DELETE"

/**
 * Calls GHL, trying each API version in turn only while GHL complains about
 * the version itself. Any other error is final and thrown as GhlError.
 */
export async function ghl<T = Record<string, unknown>>(
  method: Method,
  path: string,
  body: unknown,
  versions: string[],
  timeoutMs = 15000,
): Promise<T> {
  let last: { status: number; data: unknown } | undefined
  for (const version of versions) {
    const res = await fetch(GHL_BASE + path, {
      method,
      headers: {
        Authorization: `Bearer ${process.env.GHL_PRIVATE_TOKEN}`,
        Version: version,
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    })
    const text = await res.text()
    let data: unknown = {}
    try {
      data = text ? JSON.parse(text) : {}
    } catch {
      data = { raw: text }
    }
    if (res.ok) return data as T
    last = { status: res.status, data }
    if (!JSON.stringify(data).toLowerCase().includes("version")) break
  }
  const message = (last?.data as { message?: unknown } | undefined)?.message
  const text = Array.isArray(message)
    ? message.join(", ")
    : typeof message === "string"
      ? message
      : `GHL error ${last?.status ?? "unknown"}`
  throw new GhlError(text, last?.status || 502, last?.data)
}

/** GHL's wording when a calendar refuses a start time. */
export const looksLikeSlotRefusal = (e: unknown) =>
  e instanceof GhlError && e.status < 500 && /slot|available|conflict|booked/i.test(e.message)
