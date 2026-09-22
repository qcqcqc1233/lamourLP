# Bye Bye Eye Bags — the same page, on your own GHL

A byte-level copy of `lamoure-eyebags.ilovefacialtreatment.com`. Same HTML,
same CSS, same copy, same 4 steps, same gold, same 6-day strip skipping
Sundays, same 10 AM–5 PM hourly slots, same pixels, same confirmation screen.

```
index.html      identical to the live page (+ one hidden honeypot field)
styles.css      identical to the live page, byte for byte
script.js       identical UI logic; only the network layer changed
api/book.js     new — the server side that talks to GHL
images/         put the real treatment.jpg here (see step 1)
```

## What actually changed, and why

**One thing.** The live page holds its GHL location id, calendar id and user id
in `script.js`, and posts bookings straight from the browser. It also posts
every lead to a logging service on a *different client's* subdomain
(`est-non-surgical-fneck.ilovefacialtreatment.com`) — a comment in that file
says it's temporary and should move.

Here the browser posts once to `/api/book`, and the function decides which
sub-account and calendar that is, from environment variables. Nothing
identifying your GHL account is in the page. That matters because a page that
carries those values hands anyone who views source enough to start poking at
your location — and the token that used to sit there could list the calendar,
i.e. every customer's name and appointment time.

Everything the visitor sees and does is unchanged.

---

## 1. The photo

`images/treatment.jpg` is a grey placeholder. Open
`https://lamoure-eyebags.ilovefacialtreatment.com/images/treatment.jpg`,
right-click → Save image as, and drop it in over the placeholder under the same
name. It's ~300 KB — worth running through squoosh.app to get it under 150 KB,
since it's the heaviest thing on the page.

## 2. Get your new GHL values

| Value | Where |
|---|---|
| `GHL_PRIVATE_TOKEN` | New sub-account → Settings → Private Integrations → Create new integration. Scopes: `contacts.write`, `calendars/events.write`. Shown once |
| `GHL_LOCATION_ID` | Settings → Business Profile, or the `/v2/location/<ID>/` part of the URL |
| `GHL_CALENDAR_ID` | Settings → Calendars → open the calendar → id in the URL |
| `GHL_ASSIGNED_USER_ID` | Settings → My Staff (optional) |

## 3. Put it online — no terminal needed

1. github.com → New repository → `lamoure-eyebags` → **Private** → Create.
2. On the empty repo page click **uploading an existing file**, drag in
   everything from this folder (including the `api` and `images` folders),
   **Commit changes**.
3. vercel.com → **Continue with GitHub** → **Add New… → Project** → Import
   `lamoure-eyebags`.
4. Framework preset **Other**. Don't touch the build settings — there is no
   build step. **Deploy**.

It goes live on a `something.vercel.app` URL in about 30 seconds. The page will
look right but booking will fail until step 4.

From then on, editing a file on GitHub (pencil icon → Commit) redeploys the
live site by itself.

*Prefer the terminal? `npx vercel` then `npx vercel --prod` in this folder.*

## 4. Give Vercel the GHL keys

The page has no idea which GHL account it belongs to. You tell Vercel, Vercel
tells the function at runtime, and nothing lands in the page source.

Vercel → your project → **Settings → Environment Variables**. Add each one
(Key, Value, leave all three environments ticked, Save):

| Key | Value |
|---|---|
| `GHL_PRIVATE_TOKEN` | the `pit-…` token |
| `GHL_LOCATION_ID` | the new sub-account id |
| `GHL_CALENDAR_ID` | the calendar id |
| `GHL_ASSIGNED_USER_ID` | the staff member (optional) |
| `BUSINESS_TZ` | `Europe/London` |
| `LEAD_SOURCE` | `Bye Bye Eye Bags LP` |

Then **Deployments → the top one → ⋯ → Redeploy**. Environment variables are
read when the function boots, so nothing changes until you redeploy. This is
the single most common reason people think it's broken.

**Test it:** open the live URL with `?test=1` on the end and book a slot. A
contact tagged `TEST-DONOTCOUNT` should appear in the new sub-account within
seconds, with the appointment on the calendar. Automations don't run and no
pixel fires in test mode, so repeat as often as you like.

## 5. Point your domain (it's on Shopify)

Keep the store on the root domain, give the page a subdomain.

1. Vercel → Settings → Domains → add `eyebags.yourdomain.com`. Vercel shows a
   CNAME target (`cname.vercel-dns.com`).
2. Shopify admin → Settings → Domains → your domain → **Edit DNS** (if bought
   through Shopify) or your registrar's panel (if only connected to Shopify).
3. Add: type `CNAME`, name `eyebags`, value `cname.vercel-dns.com`.
4. Back in Vercel, wait for green. SSL is automatic.

Don't touch the root `@` or `www` records — those are Shopify's, and changing
them takes the store offline.

## 6. Tracking

Both pixel ids are already in `index.html`, unchanged:
`1178133073434960` (account-wide) and `27589073474112473` (this page). Keeping
them preserves the ad account's optimisation history — you need access to both
in Business Manager, or the events land somewhere you can't read.

The funnel is identical to the live page: `PageView` → `AddToCart` (day) →
`InitiateCheckout` (time) → `Lead` → `Schedule` + `CompleteRegistration`, and
the last two fire **only when GHL returns a real appointment id**.

Optional upgrade the old page doesn't have: set `META_PIXEL_ID` and
`META_CAPI_TOKEN` (Events Manager → pixel → Settings → Conversions API →
Generate access token) and redeploy. The server then sends its own `Schedule`
with the same `event_id`, so Meta merges the two rather than counting twice —
and you recover the events iOS and ad blockers kill in the browser.

## 7. The one behaviour worth reconsidering

The slot grid is hardcoded and doesn't read your calendar. Two people can land
on the same 2 PM. The live page books both anyway
(`ignoreFreeSlotValidation: true`), and this copy defaults to the same, so
nothing changes on the cutover.

Set `GHL_IGNORE_SLOT_VALIDATION=false` in Vercel and GHL rejects the second
one instead — the visitor sees "That time was just taken. Please pick another
slot." One env var, then redeploy.

---

## Cutover checklist

- [ ] Real photo in `images/treatment.jpg`
- [ ] Deployed, env vars set, redeployed
- [ ] `?test=1` booking lands in the new sub-account
- [ ] Subdomain live with SSL
- [ ] One real booking through the live domain, then delete the test contacts
- [ ] Ad set's destination URL swapped to the new domain
- [ ] **Old page switched off or redirected** — until then it keeps writing
      into the old GHL and the leads split between two systems
- [ ] Contacts exported from the old sub-account and imported into the new one
- [ ] Anyone already booked for a date after the cutover re-created by hand —
      those appointments do not migrate

## Troubleshooting

| Symptom | Cause |
|---|---|
| `Booking is not configured yet.` | Env vars missing, or you didn't redeploy after adding them |
| `The token does not have access to this location` | Token is from a different sub-account than `GHL_LOCATION_ID` |
| `email must be an email` | A real typo — the page already repairs stray spaces and doubled `@`/`.` |
| Page loads, booking 404s | The `api` folder didn't get uploaded to GitHub |
| Domain stuck "Invalid Configuration" | CNAME on the root instead of the subdomain |
