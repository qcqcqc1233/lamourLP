---
name: L'amour De Soi
description: A Hampstead skin clinic's booking surface; a quiet off-white page, Jost throughout, one deep pine for what she has chosen and what she should press.
colors:
  paper: "#fafaf8"
  surface: "#ffffff"
  tint: "#f3f3ef"
  tint-hover: "#e9e9e3"
  ink: "#1e201c"
  ink-soft: "#5b5f57"
  pine: "#223528"
  pine-deep: "#182a1e"
  cream: "#f6f4ee"
  on-pine-soft: "#c9d4c7"
  hairline: "rgb(30 32 28 / 0.08)"
  field: "rgb(30 32 28 / 0.18)"
  rule-on-pine: "rgb(246 244 238 / 0.18)"
  destructive: "#a12a1c"
typography:
  display:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  display-lg:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  section:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  section-lg:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  small:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
rounded:
  control: "12px"
  chip: "16px"
  photo: "20px"
  surface: "24px"
  round: "9999px"
spacing:
  gutter: "20px"
  chip-gap: "8px"
  week-gap: "16px"
  step: "40px"
  hero-gap: "36px"
  column-gap: "64px"
  section: "64px"
  section-lg: "96px"
  card-pad: "36px"
  container: "68rem"
  header: "56px"
components:
  button-primary:
    backgroundColor: "{colors.pine}"
    textColor: "{colors.cream}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "52px"
  button-cream:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.pine}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "48px"
  button-outline-cream:
    textColor: "{colors.cream}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "48px"
  choice-chip:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.chip}"
    padding: "10px 8px"
    height: "48px"
  choice-chip-hover:
    backgroundColor: "{colors.tint-hover}"
  choice-chip-selected:
    backgroundColor: "{colors.pine}"
    textColor: "{colors.cream}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "8px 14px"
    height: "48px"
  booking-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.surface}"
    padding: "36px"
  appointment-slip:
    backgroundColor: "{colors.pine}"
    textColor: "{colors.cream}"
    rounded: "{rounded.surface}"
    padding: "36px"
  quiet-band:
    backgroundColor: "{colors.tint}"
    rounded: "{rounded.surface}"
    padding: "56px 24px"
  sticky-bar:
    backgroundColor: "{colors.paper}"
    padding: "12px 16px"
---

# Design System: L'amour De Soi

## Overview

**Creative North Star: "One Question at a Time"**

The page asks one thing, waits for the answer, then asks the next. A quiet off-white page holds a short offer and a row of soft day chips; choosing a day opens the times beneath it, choosing a time opens her details with the chosen hour echoed once, and booking replaces the whole light form with a single solid pine confirmation. Nothing on screen asks for a decision she has not reached yet.

Calm comes from subtraction. Choices have no borders, sections have no rules, and separation is made by space and by one soft neutral fill. One legible geometric sans, Jost, carries every word at two weights; the only decorative letterform is the clinic's traced stencil wordmark. Deep pine is rare on purpose: it marks the chosen day and time, the main button, and the booked appointment, so its appearance always means "this is yours" or "press here". The one photograph is a bright, real clinic interior: a short strip at the top of the phone screen, and beside the booking card on desktop.

Scope: the Next.js surfaces (today `/face-neck`). The legacy static campaign pages in `public/` are a separate older system and are out of scope.

**Key Characteristics:**
- Light by commitment: off-white paper, white surfaces, a soft neutral fill; no dark theme.
- One accent, pine, only for chosen states, the primary button and the booked slip.
- Jost only, two weights (400, 500), a five-step scale.
- No borders on choices; colour carries state and space carries structure.
- Progressive disclosure: each booking step rises in softly once the one before it is answered.

## Colors

Cool, barely-warm neutrals with one deep green voice and no second accent.

### Primary
- **Rosslyn Pine** (pine): the chosen day and time chip, every primary button, the booked appointment slip, the focus outline, the caret, text selection, inline links in the clinic band, and the step numerals.
- **Night Pine** (pine-deep): a reserved step below pine; defined but not used on the shipped surface.

### Neutral
- **Gallery Paper** (paper): the page ground, the sticky bar (at 90% with blur) and the scrollbar track.
- **White Surface** (surface): the desktop booking card and every input.
- **Soft Fill** (tint): unchosen chips, the clinic band, the closing band, step numeral discs, skeleton chips, the test-mode note.
- **Soft Fill Hover** (tint-hover): hover on unchosen chips and other quiet controls.
- **Ink** (ink): headings and body text.
- **Soft Ink** (ink-soft): the secondary line under the H1, date range, step text, field hints, list terms, the footer. The lightest tone allowed for price or terms.
- **Cream** (cream): text and the primary action on pine; also the text of selected chips and primary buttons.
- **Sage Mist** (on-pine-soft): row labels and small print on the slip.
- **Hairline** (hairline): FAQ row dividers, the footer top rule, the sticky bar's top edge.
- **Field Line** (field): input borders and the scrollbar thumb.
- **Hairline on Pine** (rule-on-pine): the single rule inside the slip and the outline-cream border.
- **Brick** (destructive): field errors and failed-booking or slot-taken alerts only.

### Named Rules
**The Pine Means Yours Rule.** Pine appears only where something is chosen, primary, or booked. If it is not one of those three, it is not pine.

**The Light Ground Rule.** Every surface while she is choosing is paper, white or soft fill. The booked slip is the only dark object on the page. No dark photographs.

## Typography

**Display Font:** Jost (with ui-sans-serif, system-ui, sans-serif)
**Body Font:** Jost (`--font-sans`, `--font-display` and `--font-heading` all resolve to `--font-jost`)
**Brand mark:** the traced stencil wordmark SVG, never typeset

**Character:** One clean geometric sans. Headings gain presence from size and a slight negative track, never from a second family or a heavier weight.

### Hierarchy
- **Display** (500, 2rem phone / 3rem from 1024px, 1.12 / 1.08, -0.02em): the page H1 only, two lines on a phone.
- **Section** (500, 1.5rem / 1.75rem from 1024px, 1.2, -0.015em): section H2s and the booked heading.
- **Title** (500, 1.25rem): booking step headings ("Choose a day", "Choose a time", "Your details"), visit-step H3s, day numerals (line-height 1, tabular) and the slip total.
- **Body** (400, 1.0625rem, 1.6): running text, chip and button labels, field labels, inputs, FAQ questions (500) and answers. Measure capped at 30rem in the offer, 44rem in the FAQ.
- **Small** (400, 0.875rem): date range, weekday on a chip (75% opacity), list terms, slip labels, hints, errors, footnotes, footer.

### Named Rules
**The Two Weights Rule.** 400 for reading, 500 for headings, labels and the price. There is no 600; money gains emphasis from weight 500 alone.

**The Legible Heading Rule.** Headings are Jost 500 at 20px or larger. No display serif, no thin weights, no text over photographs.

## Layout

A single 68rem container with 20px gutters and a 56px header (wordmark left, a 44px round phone button right). The offer and booking open the page as one grid with named areas. On phones it is one column with a 24px gap: a 2:1 photo strip (3:1 on screens under 600px tall), the H1 at 28px, one row of three short fact pills (1 hour, No needles, £149 first visit; 10px side padding and 6px gaps on phones so they hold one row from 320px, where the icons step aside), one 14px soft-ink line under them ("Nothing is paid online. We call for a £35 deposit."), then the booking card, with 20px between them. From 1024px the left column holds the H1 (48px) and pills with the photo (3:2) below them, and the booking card starts at the top of the right column (6fr) so nothing pushes it down; at 1366x768 the photo and the first day choices are both above the fold.

The booking is a white card on every screen (20px padding on phones, 36px from 1024px), so it reads as one object apart from the copy. Booking steps stack with 32px between them on phones and 40px from 1024px; their labels are 17px on phones and 20px from 1024px. The phone day row is a single swipeable line: chips are fluid at `max(3.25rem, (100vw - 5.75rem) / 4.5)` so about four and a half show and the cut chip invites the swipe; the row bleeds to the card's edges with matching 20px scroll-padding and snaps chip starts. Each Monday after the first day adds a 16px gap on top of the 8px chip gap, so the weeks read apart without a label. From 1024px the days become a 6-column grid (Monday to Saturday) and each day is placed in its weekday column, so the two weeks read as two calendar rows. Times are a 3-column grid of nine hours, 09:00 to 17:00.

Below the booking: client reviews (white cards, stacked on phones, three columns from 1024px; never a carousel), the clinic band (soft fill, full bleed, text only: heading, one line, then address, hours and phone in three columns from 640px), the first-visit steps (3 columns from 768px), the FAQ, and a closing soft-fill panel. Sections take 64px vertical padding, 96px from 1024px.

When a step is answered the page scrolls the next step into view on every screen (smooth, instant under reduced motion): choosing a day brings the day row to the top on phones and the whole booking card to the top on desktop, so the days and times are on screen together; choosing a time brings "Your details" to the top, with the button in view.

The cookie question is a white card with the card lift: on phones fixed over the logo and photo at the top (it never covers the headline or the calendar, and the page stays usable under it), from 640px bottom left, 25rem wide. Reject and Accept are equal soft-fill 44px buttons.

On phones a sticky bar rises from the bottom once the booking has scrolled away, holding one full-width primary button back to `#book`; it hides while the booking is visible or a field is focused and never appears from 1024px.

## Elevation & Depth

Flat, with tonal layering. Depth while choosing is paper to white to soft fill. One soft lift exists, on the booking card only (while choosing); the slip, chips, bands and images sit flat.

### Shadow Vocabulary
- **Card lift** (`box-shadow: 0 1px 2px rgb(30 32 28 / 0.04), 0 24px 48px -28px rgb(30 32 28 / 0.22)` plus a 1px ring at 4% black): the desktop booking card while choosing.
- **Bar edge** (`box-shadow: 0 -1px 0 var(--hairline)`): the sticky bar's top edge, a hairline drawn as a shadow.

### Named Rules
**The One Lift Rule.** Only the desktop booking card floats, and only while she is choosing. On phones the form dissolves into the page.

## Shapes

Soft and consistent: one radius family (base `--radius: 0.75rem`). Buttons and inputs take 12px, choice chips 16px, the clinic photograph 20px, and large surfaces (booking card, slip, closing panel) 24px. Small markers (step numerals, the booked tick, the phone button) are full circles. Images carry a 1px inset outline at 6% black so light photos hold their edge on light ground. Borders appear only on inputs and the outline-cream button; choices never have them.

## Components

### Buttons
Calm and full-height, with a small press.
- **Shape:** 12px radius.
- **Primary:** pine with cream text, 52px tall (`xl`), 24px side padding, 1.0625rem medium text with 0.01em tracking, 18px icons; full width in the form and the sticky bar.
- **Touch:** 48px, 20px side padding, 1.0625rem; the confirmation actions.
- **Cream / Outline cream:** actions on pine: cream fill with pine text (hover mixes 8% pine), or a transparent fill with a hairline-on-pine border (hover 8% white).
- **States:** primary hover fades to 80%; every button scales to 0.96 on press over 150ms; focus is a 3px ring at 50% plus the global 2px pine outline offset 3px.

### Choice chips (days and times)
- **Style:** soft fill, ink text, no border, 16px radius, at least 48px tall, 10px/8px padding, 1.0625rem medium. Day chips stack a 0.875rem weekday (75% opacity) over a 1.25rem tabular numeral; time chips hold one tabular label.
- **State:** hover to soft-fill hover; chosen turns solid pine with cream text and keeps it on hover; press scales to 0.96. Single-select groups. While days load, soft-fill skeleton chips hold the row at 68px.

### Cards / Containers
- **Booking card:** the form itself takes the white surface, 24px radius, 36px padding and the card lift, from 1024px and only while choosing. When booked, the slip replaces it.
- **Quiet bands:** soft fill, full-bleed for the clinic band, a 24px-radius panel for the close.

### Inputs / Fields
- **Style:** 48px tall, white, 1px field-line border, 12px radius, 14px side padding, 1.0625rem text; labels above at 1.0625rem medium, hints below at 0.875rem soft ink.
- **Focus:** pine border with a 3px pine ring at 50%.
- **Error:** brick border and 20% ring; the message replaces the hint at 0.875rem.

### Navigation
A 56px header on paper with no rule: the wordmark left (22px tall, 24px from 640px) in ink, a 44px round phone icon button right that fills soft on hover. No menu.

### FAQ accordion
Hairline-divided rows, at least 64px tall, questions in 1.0625rem medium, answers in soft ink. A 1.5-stroke plus icon rotates 45 degrees into a cross when open (200ms).

### Progressive booking (signature)
Day, then time, then details. Each later step mounts only when the one before it is answered and rises in with `step-in` (opacity 0 and 8px rise to rest over 320ms on `ease-out-soft`). On phones the newly opened step scrolls into view. The details step echoes the chosen day and hour once, in soft ink, under its heading.

### The Appointment Slip (signature)
The booked state only. A solid pine panel (24px radius, 24px/28px padding on phones, 36px from 640px) leads with a cream tick disc and the section-size heading "Your appointment is booked", then the deposit call in body text, then one hairline-on-pine rule and four rows: When, Where, Length, Total. Labels are 0.875rem sage mist, values cream and tabular, Total at title size. Cream and outline-cream touch buttons add it to a calendar; small print offers directions and the phone number.

## Do's and Don'ts

### Do:
- **Do** keep the day choice inside the first viewport on phone and desktop.
- **Do** say the offer in the hero as one headline plus short fact pills; explain the deposit at the phone field and in the confirmation, not in hero prose.
- **Do** ask one question at a time: reveal times only after a day, details only after a time.
- **Do** reserve pine for chosen states, the primary button and the booked slip, with cream on top.
- **Do** separate choices with space and fill, never with borders.
- **Do** keep every heading in Jost 500 at the recorded sizes (H1 2rem / 3rem; section 1.5rem / 1.75rem; title 1.25rem).
- **Do** use the traced wordmark SVG from the clinic's 2000px logo, inheriting `currentColor`.
- **Do** keep touch targets at 48px or more (primary 52px, chips, inputs and touch buttons 48px).
- **Do** show price and terms at 0.875rem or larger in ink or soft ink, never lighter.
- **Do** respect reduced motion: animations and transitions collapse to 0.01ms and smooth scroll turns off.

### Don't:
- **Don't** use a thin display serif or any display serif for headings.
- **Don't** put a big photograph above the booking.
- **Don't** use dark or gloomy interior photographs.
- **Don't** draw borders around day or time choices; no bordered tiles.
- **Don't** show a heavy summary card while she is choosing; the dark slip appears only once the booking is real.
- **Don't** restate the same facts in several places on screen; say each fact once, and echo only her chosen time.
- **Don't** use a beige or bone ground; the page stays off-white paper.
- **Don't** add a second accent colour, a third weight, or a dark theme.
