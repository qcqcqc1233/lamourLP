import assert from "node:assert/strict"
import { test } from "node:test"

import { FACE_NECK, FACE_NECK_RULES } from "./offer"
import { bookableDays, checkSlot, londonWallToUtc, slotsForDay, toLondonIso } from "./schedule"

const rules = FACE_NECK_RULES
const dur = FACE_NECK.durationMin

test("London wall time converts across the October 2026 clock change", () => {
  // Saturday 24 Oct is still BST (UTC+1); Monday 26 Oct is GMT (UTC+0).
  assert.equal(londonWallToUtc({ y: 2026, m: 10, d: 24 }, 10).toISOString(), "2026-10-24T09:00:00.000Z")
  assert.equal(londonWallToUtc({ y: 2026, m: 10, d: 26 }, 10).toISOString(), "2026-10-26T10:00:00.000Z")
  assert.equal(toLondonIso(new Date("2026-10-24T09:00:00Z")), "2026-10-24T10:00:00+01:00")
  assert.equal(toLondonIso(new Date("2026-10-26T10:00:00Z")), "2026-10-26T10:00:00+00:00")
})

test("London wall time converts across the March 2027 clock change", () => {
  assert.equal(londonWallToUtc({ y: 2027, m: 3, d: 27 }, 10).toISOString(), "2027-03-27T10:00:00.000Z")
  assert.equal(londonWallToUtc({ y: 2027, m: 3, d: 29 }, 10).toISOString(), "2027-03-29T09:00:00.000Z")
})

test("days skip Sundays, stay inside 14 days, and use London's date, not the browser's", () => {
  // 23:30 in London on Saturday 3 Oct is already Sunday in Tel Aviv.
  const now = new Date("2026-10-03T22:30:00Z")
  const days = bookableDays(now, rules, dur)
  assert.ok(days.every((d) => d.weekday !== 0), "no Sundays")
  assert.equal(days[0].key, "2026-10-05", "Saturday is over, Sunday is closed, so Monday is first")
  assert.ok(days.at(-1)!.key <= "2026-10-16", "inside the 14-day window")
  assert.deepEqual(days[0].slots.map((s) => s.label), ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"])
})

test("a one-hour visit never ends after closing time", () => {
  for (const s of slotsForDay({ y: 2026, m: 10, d: 5 }, new Date("2026-10-01T00:00:00Z"), rules, dur)) {
    assert.ok(s.endLondon.slice(11, 13) <= "18")
  }
  const long = slotsForDay({ y: 2026, m: 10, d: 5 }, new Date("2026-10-01T00:00:00Z"), rules, 90)
  assert.ok(!long.some((s) => s.hour === 17), "a 90-minute visit cannot start at 17:00")
})

test("same-day times respect the notice period", () => {
  // 11:30 London on Monday 5 Oct (BST): with 2 hours' notice, 14:00 is the first time.
  const now = new Date("2026-10-05T10:30:00Z")
  const today = bookableDays(now, rules, dur)[0]
  assert.equal(today.key, "2026-10-05")
  assert.equal(today.slots[0].label, "14:00")
})

test("the server refuses times the page would never offer", () => {
  const now = new Date("2026-10-05T08:00:00Z") // 09:00 London
  assert.equal(checkSlot("2026-10-06T10:00:00+01:00", now, rules, dur).ok, true)
  assert.deepEqual(checkSlot("2026-10-11T10:00:00+01:00", now, rules, dur), { ok: false, reason: "closed_day" })
  assert.deepEqual(checkSlot("2026-10-06T09:00:00+01:00", now, rules, dur), { ok: false, reason: "outside_hours" })
  assert.deepEqual(checkSlot("2026-10-06T18:00:00+01:00", now, rules, dur), { ok: false, reason: "outside_hours" })
  assert.deepEqual(checkSlot("2026-10-06T10:30:00+01:00", now, rules, dur), { ok: false, reason: "not_on_the_hour" })
  assert.deepEqual(checkSlot("2026-10-05T10:00:00+01:00", now, rules, dur), { ok: false, reason: "too_soon" })
  assert.deepEqual(checkSlot("2026-10-20T10:00:00+01:00", now, rules, dur), { ok: false, reason: "too_far" })
  assert.deepEqual(checkSlot("not a date", now, rules, dur), { ok: false, reason: "unparseable" })
  // The same instant written in UTC is the same appointment.
  assert.equal(checkSlot("2026-10-06T09:00:00Z", now, rules, dur).ok, true)
})

test("a slot after the clock change is accepted at its London hour", () => {
  const now = new Date("2026-10-20T08:00:00Z")
  const ok = checkSlot("2026-10-26T10:00:00+00:00", now, rules, dur)
  assert.equal(ok.ok, true)
  if (ok.ok) assert.equal(ok.endLondon, "2026-10-26T11:00:00+00:00")
})
