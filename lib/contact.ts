/* ---------------------------------------------------------------------------
   Name, email and phone checks shared by the form and /api/book.

   Nothing here "repairs" what a visitor typed. The old page squeezed spaces out
   of email addresses and collapsed doubled characters, which can quietly turn
   one person's address into someone else's. Here an address is trimmed at the
   ends and then either accepted or sent back with a message next to the field.

   Phone numbers default to the UK and accept any country that starts with +.
   The caller passes the libphonenumber build it wants: the small one in the
   browser, the full one on the server.
--------------------------------------------------------------------------- */

import type { CountryCode, PhoneNumber } from "libphonenumber-js"

export type Field = "name" | "email" | "phone"
export type FieldErrors = Partial<Record<Field, string>>

type ParsePhone = (text: string, country: CountryCode) => PhoneNumber | undefined

const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/

export function checkName(raw: string): { value: string; error?: string } {
  const value = raw.trim().replace(/\s+/g, " ")
  if (value.length < 2) return { value, error: "Please enter your name." }
  if (value.length > 80) return { value, error: "Please shorten your name to 80 characters." }
  return { value }
}

export function checkEmail(raw: string): { value: string; error?: string } {
  const value = raw.trim()
  if (!value) return { value, error: "Please enter your email address." }
  if (value.length > 254 || !EMAIL_RE.test(value)) {
    return { value, error: "That email address doesn't look complete. Please check it." }
  }
  return { value }
}

// Invisible direction marks iOS adds when a number is pasted from Contacts.
const INVISIBLES = /[​-‏‪-‮⁦-⁩﻿]/g

export function checkPhone(raw: string, parse: ParsePhone): { value: string; error?: string } {
  const text = raw.replace(INVISIBLES, "").trim()
  if (!text) return { value: "", error: "Please enter your phone number." }
  // A number starting 00 is an international prefix written the old way.
  const normalised = text.startsWith("00") ? "+" + text.slice(2) : text
  const parsed = parse(normalised, "GB")
  if (!parsed || !parsed.isValid()) {
    return {
      value: text,
      error: normalised.startsWith("+")
        ? "That number doesn't look right for that country code. Please check it."
        : "Please enter a valid UK number, e.g. 07123 456789. From abroad, start with your country code.",
    }
  }
  return { value: parsed.number } // E.164
}

export function checkContact(
  input: { name?: unknown; email?: unknown; phone?: unknown },
  parse: ParsePhone,
) {
  const name = checkName(String(input.name ?? ""))
  const email = checkEmail(String(input.email ?? ""))
  const phone = checkPhone(String(input.phone ?? ""), parse)
  const errors: FieldErrors = {}
  if (name.error) errors.name = name.error
  if (email.error) errors.email = email.error
  if (phone.error) errors.phone = phone.error
  return {
    ok: Object.keys(errors).length === 0,
    errors,
    value: { name: name.value, email: email.value, phone: phone.value },
  }
}
