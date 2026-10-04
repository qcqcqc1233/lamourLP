---
name: L'amour De Soi
description: A Hampstead skin clinic's booking surface; bone paper, ink text, one deep pine for every action.
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
  display:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "clamp(2.125rem, 5vw, 3.75rem)"
    fontWeight: 400
    lineHeight: 1.06
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "clamp(2rem, 3.5vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 1.1
  title:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.25
  figure:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "2.75rem"
    fontWeight: 400
    lineHeight: 1
    fontFeature: "\"tnum\""
  body:
    fontFamily: "Jost, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  step:
    fontFamily: "Jost, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: "Jost, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "2.4px"
  md: "3.2px"
  lg: "4px"
  full: "9999px"
spacing:
  gutter: "20px"
  section: "56px"
  section-lg: "80px"
  column-gap: "48px"
  header: "56px"
  measure: "1120px"
components:
  button-primary:
    backgroundColor: "{colors.pine}"
    textColor: "{colors.cream}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0 24px"
    height: "52px"
  button-cream:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.pine}"
    rounded: "{rounded.lg}"
    padding: "0 24px"
    height: "52px"
  button-outline-cream:
    backgroundColor: "transparent"
    textColor: "{colors.cream}"
    rounded: "{rounded.lg}"
    padding: "0 24px"
    height: "52px"
  button-touch:
    rounded: "{rounded.lg}"
    padding: "0 20px"
    height: "48px"
  choice:
    backgroundColor: "{colors.linen}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "8px"
    height: "48px"
  choice-hover:
    backgroundColor: "{colors.hover-wash}"
  choice-selected:
    backgroundColor: "{colors.pine}"
    textColor: "{colors.cream}"
  input:
    backgroundColor: "{colors.linen}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "8px 14px"
    height: "48px"
  appointment-slip:
    backgroundColor: "{colors.pine}"
    textColor: "{colors.cream}"
    rounded: "{rounded.lg}"
    padding: "20px 24px 24px"
  address-plate:
    backgroundColor: "{colors.pine}"
    textColor: "{colors.cream}"
    typography: "{typography.label}"
    padding: "10px 16px"
---

# Design System: L'amour De Soi

## Overview

**Creative North Star: "The Room on Rosslyn Hill"**

The system is the clinic itself, put on paper: a warm bone ground, linen panels laid over it like stationery on a reception desk, ink for every word, and a single deep pine that belongs to whatever the visitor can act on. Hierarchy comes from the Bodoni display face, whose hairline-and-weight contrast echoes the clinic's stencil-didone wordmark, set against plain, readable Jost. Everything else is hairline rules and square-shouldered panels.

Density is calm and ledger-like. Facts are laid out as ruled rows (term on the left, detail on the right) rather than as cards or icon grids, and the booking itself is a ruled pine slip whose values ink in as they are chosen. Photography is only of the real rooms (reception, lounge, corridor), never faces. The page is light by brand commitment; there is no dark theme.

The legacy campaign pages in `public/` (`index.html`, `lift/`, `nonsurgical-lift/`, `public/styles.css`) are a separate, older visual system kept byte-identical for live ads. They are out of scope for this document and must not be used as a reference for it.

**Key Characteristics:**
- Bone ground, linen bands, ink text, one pine for action and for the booking surface.
- Bodoni Moda display (variable, optical size axis) over Jost UI and body.
- Hairline ink rules organise content; ledger rows instead of cards.
- Square shoulders: a 4px radius everywhere it rounds at all.
- Real clinic interiors as the only imagery.
- Motion is one gesture: values ink in on the appointment slip.

## Colors

A warm, paper-and-ink palette with exactly one saturated-dark accent.

### Primary
- **Rosslyn Pine** (`pine`): every action (primary buttons, selected days and times, text links, focus outline, selection highlight, caret) and the two pine surfaces: the appointment slip and the closing band. Also the address plate on the hero photo.
- **Deep Pine** (`pine-deep`): the footer only, one step below the closing band.

### Neutral
- **Bone** (`bone`): the page ground and theme colour.
- **Linen** (`linen`): alternating section bands (clinic, booking, FAQ), form inputs and unchosen day/time choices.
- **Sand** (`sand`): muted/secondary surfaces from the component library.
- **Hover Wash** (`hover-wash`): the hover tint on unchosen choices.
- **Ink** (`ink`): all text, and the stronger top rule that opens a ledger.
- **Soft Ink** (`ink-soft`): secondary text: ledger terms, supporting lines, the header location.
- **Cream** (`cream`): text and light actions on pine.
- **Sage on Pine** (`on-pine-soft`): secondary text and slip labels on pine.
- **Rule / Strong Rule / Rule on Pine**: hairline dividers on bone (16% ink), input and choice borders (34% ink), and dividers inside pine surfaces (20% cream).
- **Clinic Red** (`destructive`): error alerts and invalid fields only.

### Named Rules
**The One Pine Rule.** Pine means "you can act on this" or "this is your appointment". It never decorates; a pine element that cannot be tapped is either the slip, the address plate, or a pine band.

**The Light Page Rule.** The page is light by brand commitment. Dark pine appears only as bounded surfaces (slip, closing band, footer), never as a theme.

## Typography

**Display Font:** Bodoni Moda (variable weight, `opsz` axis; fallback Georgia, serif)
**Body Font:** Jost (variable; fallback system sans)

**Character:** A didone with hairline contrast carries the wordmark's voice in headings and figures; a quiet geometric sans does every job a visitor reads closely or taps.

### Hierarchy
- **Display** (400, 34px phone / 44px tablet / 60px desktop, 1.06, -0.01em): the H1 only.
- **Headline** (400, 32px / 40px, 1.1): section headings. The booking and closing headings run a step larger (36px / 48-52px, 1.08).
- **Title** (400, 24px, ~1.25): visit steps and the slip heading.
- **Figure** (400, 44px, 1, tabular): the price in the hero ledger line; 22px Bodoni for the slip total and day numerals.
- **Body** (400, 17px, 1.6): all running text, measure capped around 34-40rem.
- **Step** (Jost 500, 18px): numbered booking steps ("1. Choose a day").
- **Label** (Jost 400, 15px): ledger terms, supporting notes, footer. The smallest reading size; nothing that carries price or terms goes below it.

### Named Rules
**The Didone-Leads Rule.** Bodoni is for headings, figures and numerals that should read as printed; it is never used for buttons, labels, fields or paragraphs.

**The 15px Floor Rule.** No visitor-facing text below 15px, except the 13px weekday/month annotations inside a day choice, which sit beside a 22px numeral.

## Layout

A single centred measure of 1120px (`70rem`) with 20px gutters. From 768px sections use a 12-column grid with a 48px gap, splitting 4/8 (heading beside ledger), 5/7 or 7/5 (copy beside photograph). The hero splits 5/12 copy left, 7/12 photograph right at full viewport height (minus header); on phones the photograph is a full-bleed band (30svh, 22svh on short screens) above the copy.

Sections breathe at 56px vertical padding on phones and 80px on desktop, alternating bone and linen bands separated by hairline rules. The header is a 56px bar. Booking reorders by breakpoint: on phones day, time, slip, details stack; from 1024px the choices sit left and the slip pins beside them in a 23rem column (sticky, 24px from the top).

A `short` variant (below 1024px wide and 760px tall) tightens the hero for in-app browsers so the primary button stays above the fold. A phone-only sticky bar repeats the primary action when the hero button is off screen, and steps aside while the booking section is visible or a field has focus.

## Elevation & Depth

Flat by default. Depth comes from tonal layering: linen bands on bone, pine surfaces on either. The single shadow belongs to the appointment slip, a soft downward ambient shadow that lifts it off the linen like a card set on paper.

### Shadow Vocabulary
- **Slip lift** (`box-shadow: 0 18px 40px -24px rgb(24 42 30 / 0.55)`): the appointment slip only.

### Named Rules
**The One Card Rule.** Only the appointment slip casts a shadow. Everything else is flat and separated by rules or tone.

## Shapes

Square-shouldered. A single 4px radius (`--radius: 0.25rem`) covers buttons, choices, inputs, the slip and inset photographs; the desktop address plate uses 3.2px. Full-bleed phone photographs and the phone address plate are square. The only round shape is the 10px pine dot marking each step on the visit timeline, which hangs on a 1px pine line at 40% opacity.

Rules are the main form device: 1px hairlines (`rule`) between rows, a 1px ink rule opening each ledger and the FAQ list, and ruled rows inside the slip in `rule-on-pine`.

## Components

### Buttons
Confident and plain: a solid block of pine with a trailing arrow.
- **Shape:** gently squared (4px).
- **Primary:** pine with cream text, Jost 16px medium, 0.01em tracking, 52px tall, 24px horizontal padding, 18px trailing icon. Full width on phones.
- **Hover / Focus / Active:** hover lightens to pine at 80%; focus shows a 3px pine ring at 50% plus the global 2px pine outline offset 3px; active nudges down 1px.
- **Cream / Outline-cream:** the pair for pine surfaces. Cream fills cream with pine text (hover mixes in 8% pine); outline-cream is transparent with a `rule-on-pine` border and cream text (hover 8% white wash).
- **Touch size:** 48px tall, 20px padding, for secondary actions (calendar links, directions in the confirmation).

### Day and time choices
- **Style:** linen fill, 1px strong-rule border, ink text, minimum 48px, 4px radius; days stack weekday (13px uppercase), Bodoni numeral (22px, tabular) and month.
- **State:** hover takes the hover wash; selected turns solid pine with cream text and stays pine on hover. Laid out 4 across on phones, 6 across for days from 640px.

### Inputs / Fields
- **Style:** 48px tall, linen fill, 1px strong-rule border, 4px radius, 16px text, 14px horizontal padding; labels above at 16px, hints at 15px.
- **Focus:** border turns pine with a 3px pine ring at 50%.
- **Error:** clinic-red border and ring at 20%, message directly under the field.

### Ledger rows
Term (15px soft ink) beside detail (17px ink) in an 11rem / 1fr grid from 640px, stacked on phones; rows divided by hairlines and opened by a 1px ink rule. Used for "What you're booking", the hero price line, and the FAQ accordion (16px-ish medium triggers, 56px minimum height).

### Navigation
A 56px header with a bottom hairline: wordmark left (18-24px tall, ink), "Hampstead, London" right in 15px soft ink. No menu. A skip link to booking appears on focus as a pine block.

### Address plate
A pine label with a map-pin icon and the short address, anchored to the bottom-left of the hero photograph: flush and square on phones, inset 24px with a 3.2px radius on desktop.

### Appointment Slip (signature)
A pine panel (4px radius, 20-24px padding, the slip-lift shadow) titled in 24px Bodoni. Ruled rows (label in sage-on-pine 15px, value in cream Jost medium, right-aligned) for Treatment, Day, Time, Length, Where; then a second ruled group for Total (22px Bodoni), Paid when you book, Paid at the clinic. Unchosen values show an italic sage placeholder. When a value arrives it **inks in**: opacity 0 to 1, blur 3px to 0, rising 0.2em, over 520ms on `cubic-bezier(0.16, 1, 0.3, 1)`, re-keyed so each new choice replays it. On success the same slip becomes the confirmation, with cream and outline-cream touch buttons inside.

### Wordmark
The clinic's stencil-didone logo traced to SVG, inheriting `currentColor`: ink in the header, cream and near full measure (up to 46rem) at the top of the closing band.

## Do's and Don'ts

### Do:
- **Do** give every action pine (`pine`) and every pine surface a reason: action, appointment, or a bounded closing band.
- **Do** set headings, prices and day numerals in Bodoni Moda at weight 400, and everything tappable or long-form in Jost.
- **Do** separate content with 1px hairlines (`rule`) and open lists with a 1px ink rule.
- **Do** keep primary actions 52px and every target at least 48px.
- **Do** use only photographs of the clinic's real rooms, cropped to the 4px radius when inset.
- **Do** respect reduced motion; the ink-in and sticky-bar slide collapse to instant.

### Don't:
- **Don't** add a dark theme or a second accent colour; the page is light with one pine.
- **Don't** use gold, script type, or faces as imagery.
- **Don't** add shadows beyond the appointment slip's.
- **Don't** round past 4px or introduce pills, except the timeline dot.
- **Don't** set buttons, labels or body copy in Bodoni, or any reading text below 15px.
- **Don't** borrow from the legacy `public/` pages; they are a separate system.
