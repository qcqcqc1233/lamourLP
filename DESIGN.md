---
name: L'amour De Soi
description: A Hampstead skin clinic's booking surface; bone paper, ink text in Jost, one deep pine for every action.
colors:
  bone: "#f4f0e7"
  linen: "#fcfaf5"
  sand: "#ede7da"
  hover-wash: "#e7e0cf"
  ink: "#23271f"
  ink-soft: "#4a4e42"
  pine: "#223528"
  pine-deep: "#182a1e"
  cream: "#f6f2e9"
  on-pine-soft: "#c9d4c7"
  rule: "rgb(35 39 31 / 0.16)"
  rule-strong: "rgb(35 39 31 / 0.34)"
  rule-on-pine: "rgb(246 242 233 / 0.2)"
  destructive: "#a12a1c"
typography:
  display-xs:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  display:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  display-md:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  display-lg:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  closing:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  closing-lg:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  headline-lg:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  panel-title:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  panel-title-lg:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.25
  price:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  price-lg:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  numeral:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 500
    lineHeight: 1
    fontFeature: "tnum"
  lede:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.5
  small:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.375
  small-xs:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.375
  date-part:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "0.025em"
rounded:
  sm: "2.4px"
  md: "3.2px"
  lg: "4px"
  panel: "8px"
spacing:
  gutter: "20px"
  stack-sm: "12px"
  stack: "16px"
  stack-lg: "28px"
  column-gap: "56px"
  section: "56px"
  section-lg: "80px"
  container: "72rem"
  header: "56px"
components:
  button-primary:
    backgroundColor: "{colors.pine}"
    textColor: "{colors.cream}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 24px"
    height: "52px"
  button-cream:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.pine}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 24px"
    height: "52px"
  button-outline-cream:
    textColor: "{colors.cream}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 24px"
    height: "52px"
  button-touch:
    rounded: "{rounded.lg}"
    padding: "0 20px"
    height: "48px"
  choice-tile:
    backgroundColor: "{colors.linen}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "8px"
    height: "48px"
  choice-tile-hover:
    backgroundColor: "{colors.hover-wash}"
  choice-tile-selected:
    backgroundColor: "{colors.pine}"
    textColor: "{colors.cream}"
  input:
    backgroundColor: "{colors.linen}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "8px 14px"
    height: "48px"
  booking-panel:
    backgroundColor: "{colors.linen}"
    rounded: "{rounded.panel}"
    padding: "28px 32px 32px"
  appointment-slip:
    backgroundColor: "{colors.pine}"
    textColor: "{colors.cream}"
    rounded: "{rounded.lg}"
    padding: "20px 24px 24px"
  sticky-bar:
    backgroundColor: "{colors.bone}"
    padding: "12px 16px"
---

# Design System: L'amour De Soi

## Overview

**Creative North Star: "The Appointment Book"**

The page is a clinic's appointment book left open on a bone-paper desk. The booking is the composition: the offer reads in a few lines and the day tiles sit directly under it, inside the first screen on a phone and beside it on desktop. Everything is set in one legible geometric sans (Jost); the only decorative letterform is the clinic's own stencil wordmark, traced from its 2000px logo. One deep pine owns every action, every chosen day and hour, and the appointment slip, so the eye always knows where to go next.

Density is calm but direct: hairline rules instead of boxes, square-shouldered corners, plain facts in ruled lists, and a single bright photograph of the real clinic further down the page. There is no hero photograph above the booking, no dark interior, no gold, and no display serif; the user rejected a thin high-contrast serif (Bodoni) as unreadable and dark rooms as gloomy.

Scope: the Next.js surfaces (today `/face-neck`). The legacy static campaign pages in `public/` are a separate older system kept byte-identical for live ads and are out of scope here.

**Key Characteristics:**
- Light by commitment: bone ground, linen panels, ink text, no dark variant.
- One accent, pine, for actions, selections and the slip; cream is its only foreground.
- One family, Jost: medium (500) for headings, semibold (600) only for money, regular (400) for text.
- Hairline rules (16% ink) carry structure; boxes are rare.
- The appointment slip is the signature: a pine card whose values ink in as she chooses.

## Colors

Warm paper neutrals with one deep green voice; no second accent.

### Primary
- **Rosslyn Pine** (pine): every primary button, every chosen day and time tile, the appointment slip, the closing band, focus rings, text selection, caret, ticks and step numbers.
- **Night Pine** (pine-deep): the footer only, one step below the closing band.

### Neutral
- **Bone Paper** (bone): the page ground and the browser theme colour.
- **Linen** (linen): raised surfaces: the desktop booking panel, unchosen tiles, inputs, and alternating content bands.
- **Sand** (sand): secondary and muted fills.
- **Hover Wash** (hover-wash): hover fill on unchosen choice tiles.
- **Ink** (ink): all body and heading text; also the strong top rule of ruled lists.
- **Soft Ink** (ink-soft): secondary text: price notes, list terms, hints, the header phone number, booking footnotes. The lightest tone allowed for anything about price or terms.
- **Cream** (cream): text and buttons on pine.
- **Sage Mist** (on-pine-soft): secondary text on pine (slip labels, placeholders, closing copy).
- **Hairline** (rule), **Strong Hairline** (rule-strong), **Hairline on Pine** (rule-on-pine): dividers, tile and input borders, slip row rules.
- **Brick** (destructive): field errors and failed-booking alerts only.

### Named Rules
**The One Voice Rule.** Pine is the only accent. If something is clickable-and-primary or chosen, it is pine; nothing else is.

**The Light Ground Rule.** Surfaces stay bone or linen; pine is the only dark surface and is reserved for the slip, the closing band and the footer. No dark photographs.

## Typography

**Display Font:** Jost (with ui-sans-serif, system-ui, sans-serif)
**Body Font:** Jost (same family; `--font-sans`, `--font-display` and `--font-heading` all resolve to `--font-jost`)
**Brand mark:** the traced stencil wordmark SVG, never typeset

**Character:** One clean geometric sans at three weights. Headings get presence from size and slight negative tracking (-0.01em to -0.02em), not from a second family.

### Hierarchy
- **Display** (500, 1.875rem phone / 2.5rem from 640px / 3rem from 1024px, 1.625rem under 360px; 1.1; -0.02em): the page H1 only.
- **Closing** (500, 2rem / 2.75rem from 1024px, 1.1): the H2 on the pine closing band.
- **Headline** (500, 1.75rem / 2.25rem from 1024px, 1.15, -0.015em): section H2s; also the confirmation heading on the slip (1.75rem).
- **Panel title** (500, 1.375rem / 1.5rem from 1024px, -0.01em): "Choose your appointment".
- **Title** (500, 1.25rem): the slip heading and visit-step H3s.
- **Price** (600, 2.25rem / 2.75rem from 1024px, line-height 1, tabular): the £ figure beside the offer.
- **Numeral** (500, 1.375rem, line-height 1, tabular): day numbers in the day tiles; the same size at 600 for the slip total.
- **Lede** (400, 1.125rem): the intro sentence (hidden below 640px) and closing copy on desktop.
- **Body** (400, 1.0625rem, 1.6): running text, list details, FAQ; set on `body`. Measure capped at 32-40rem.
- **Label** (500, 1rem): step headings ("1. Day"), field labels, button text, choice tiles.
- **Small** (400, 0.9375rem, ~1.375): price notes, deposit sentence, ticks, slip labels, hints, errors, footer; 0.875rem for ticks under 360px.
- **Date part** (500, 0.8125rem, wide tracking, uppercase weekday at 80% opacity): weekday and month inside a day tile, nowhere else.

### Named Rules
**The Legible Heading Rule.** Headings are Jost 500. No display serif, no thin weights, no light text on photographs.

**The Money Weight Rule.** Weight 600 belongs to money (the price and the slip total) and the bold deposit phrase; headings stop at 500.

## Layout

A single 72rem container with 20px gutters. The booking section opens the page: on phones it is one column in the order intro, panel heading, days, times, slip, details, with 28px row gaps (20px under 360px so the first row of days stays above the fold). From 1024px it becomes a 5fr / 7fr grid with a 56px column gap: intro then a sticky slip (top 24px) on the left, the linen booking panel spanning both rows on the right. Day tiles run 4 across on phones and 6 from 640px; time tiles 4 across. Content sections below use a 12-column grid from 768px (heading 4 columns, ruled list 8; photo 7, text 5) with 56px vertical padding, 80px from 1024px. The header is 56px. Alternating bands switch between bone and linen, separated by hairlines.

On phones a sticky bar slides up from the bottom (bone at 95% with blur, hairline top) once the booking has scrolled away, holding one full-width pine button back to `#book`; it hides while the booking is visible or a field is focused, and never appears from 1024px.

## Elevation & Depth

Mostly flat: depth comes from tonal steps (bone to linen) and hairlines. Two soft, low-opacity pine-tinted shadows lift the two booking objects off the paper; nothing else casts a shadow.

### Shadow Vocabulary
- **Panel lift** (`box-shadow: 0 24px 48px -36px rgb(24 42 30 / 0.35)`): the desktop booking panel.
- **Slip lift** (`box-shadow: 0 18px 40px -24px rgb(24 42 30 / 0.55)`): the appointment slip.

### Named Rules
**The Two Lifts Rule.** Only the booking panel and the slip float. Cards, tiles, inputs and images sit flat.

## Shapes

Square-shouldered: the base radius is 4px (`--radius: 0.25rem`), used on buttons, tiles, inputs, the slip and the clinic photo. The desktop booking panel alone takes 8px. Borders are 1px hairlines; ruled lists open with a 1px ink rule, and visit steps with a 2px pine top rule. No pills, no circles, no clipped silhouettes.

## Components

### Buttons
Firm, full-height, plain.
- **Shape:** gently squared (4px).
- **Primary:** pine with cream text, 52px tall (`xl`), 24px side padding, 1rem medium text, 18px icons; full width in the form and the sticky bar.
- **Cream / Outline cream:** the actions on pine surfaces: cream fill with pine text, or a transparent fill with a cream-on-pine hairline border.
- **Touch:** 48px secondary size used for the confirmation actions.
- **Hover / Focus:** primary fades to 80%; cream mixes 8% pine; 3px ring at 50% plus the global 2px pine outline offset 3px; pressed state nudges down 1px.

### Choice tiles (days and times)
- **Style:** linen fill, strong-hairline border, ink text, min 48px tall; day tiles stack weekday, numeral and month.
- **State:** hover to hover-wash; chosen turns solid pine with cream text and a pine border. Single-select groups.

### Cards / Containers
- **Booking panel (desktop only):** linen, hairline border, 8px radius, panel lift, 28px/32px padding. On phones it dissolves into the page grid and only a hairline above "Choose your appointment" remains.
- **Ruled lists:** definition lists and the FAQ accordion use a 1px ink top rule and hairline rows, no boxes.

### Inputs / Fields
- **Style:** 48px tall, linen fill, strong-hairline border, 4px radius, 1rem text, labels above at 1rem medium.
- **Focus:** pine border with a 3px pine ring at 50%.
- **Error:** brick border and ring at 20%; the message sits under the field in 0.9375rem.

### Navigation
A 56px bone header with a hairline bottom: the wordmark left (22px tall, 28px from 640px), the phone number right in 0.9375rem soft ink with a pine phone icon, hovering to ink. No menu.

### The Appointment Slip (signature)
A pine card (4px radius, slip lift, 20px/24px padding) with a 1.25rem heading and two ruled lists: Treatment, Day, Time, Length, Where; then Total (1.375rem semibold), Deposit by phone, At the clinic. Labels are 0.9375rem sage mist, values medium cream; unchosen values read "Choose a day" / "Choose a time" in sage mist. Each new value plays `ink-in` (opacity, 3px blur and 0.2em rise over 520ms on the expo-out curve), keyed by content so a change replays it. On success the same slip becomes the confirmation with cream and outline-cream actions.

## Do's and Don'ts

### Do:
- **Do** keep the day picker inside the first viewport on phone and desktop.
- **Do** use pine for every primary action and chosen state, and cream for everything on pine.
- **Do** set every heading in Jost 500 at the recorded sizes (H1 1.875rem / 2.5rem / 3rem; section 1.75rem / 2.25rem).
- **Do** use the traced wordmark SVG from the clinic's 2000px logo, inheriting `currentColor`.
- **Do** keep touch targets at 48px or more (buttons 52px / 48px, tiles and inputs 48px).
- **Do** show price and terms at 0.9375rem or larger in ink or soft ink, never lighter.
- **Do** respect reduced motion: animations and transitions collapse to 0.01ms.

### Don't:
- **Don't** use a display serif or thin high-contrast type for headings.
- **Don't** put a large hero photograph above the booking, or use dark or gloomy interior photos.
- **Don't** introduce a second accent colour, gold, or a dark theme.
- **Don't** add shadows beyond the panel and slip lifts.
- **Don't** use countdowns, popups, review carousels or struck-through prices.
