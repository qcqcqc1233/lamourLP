import assert from "node:assert/strict"
import { test } from "node:test"
import { parsePhoneNumberFromString as parseMax } from "libphonenumber-js/max"
import { parsePhoneNumberFromString as parseMin } from "libphonenumber-js/min"

import { checkContact, checkEmail, checkPhone } from "./contact"

for (const [label, parse] of [["browser (min)", parseMin], ["server (max)", parseMax]] as const) {
  test(`UK numbers are the default, in any common format: ${label}`, () => {
    assert.equal(checkPhone("07123 456789", parse).value, "+447123456789")
    assert.equal(checkPhone("+44 7123 456789", parse).value, "+447123456789")
    assert.equal(checkPhone("0044 7123 456789", parse).value, "+447123456789")
    assert.equal(checkPhone("020 7946 0958", parse).value, "+442079460958")
  })

  test(`other countries work with their code, and a 10-digit number is not assumed American: ${label}`, () => {
    assert.equal(checkPhone("+33 6 12 34 56 78", parse).value, "+33612345678")
    assert.equal(checkPhone("+353 85 123 4567", parse).value, "+353851234567")
    assert.ok(checkPhone("2025550123", parse).error, "no silent +1")
  })

  test(`incomplete numbers are refused, not truncated: ${label}`, () => {
    assert.ok(checkPhone("0712345", parse).error)
    assert.ok(checkPhone("", parse).error)
    assert.ok(checkPhone("+44 7123 4567890123", parse).error)
  })
}

test("email is trimmed at the ends and otherwise left exactly as typed", () => {
  assert.deepEqual(checkEmail("  jane.doe@example.co.uk  "), { value: "jane.doe@example.co.uk" })
  // The old page squeezed these into a different, valid-looking address.
  assert.ok(checkEmail("jane doe@example.com").error)
  assert.ok(checkEmail("jane@@example.com").error)
  assert.ok(checkEmail("jane@example..com").error)
  assert.ok(checkEmail("jane@example").error)
})

test("all three fields are reported together", () => {
  const r = checkContact({ name: " ", email: "x", phone: "1" }, parseMin)
  assert.equal(r.ok, false)
  assert.deepEqual(Object.keys(r.errors).sort(), ["email", "name", "phone"])
})
