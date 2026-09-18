# Builders Daily Blog-New Design Instructions

Use this file as the source of truth when continuing the `blog-new` landing page. The goal is to preserve the current art direction and avoid generic redesign drift.

## Route And Files

- Route: `/blog-new`
- Main component: `web/src/app/blog-new/page.js`
- Styles: `web/src/app/blog-new/page.module.css`
- Keep this as a staging page. Do not replace `/blog` unless explicitly requested.
- Existing `/blog-test` is not the target for this design.

## Core Design Direction

The page is an editorial AI blog landing page for **Builders Daily Blog**. It should feel cinematic, spacious, experimental, and premium without becoming busy.

Important traits:

- Large refined grotesk typography.
- Orange accent: `#ff4d12` / `#ff5a12`.
- Warm off-white base: `#f5eee8`.
- Deep charcoal sections: `#080909`, `#0c0d0d`, `#111414`.
- Strong full-bleed imagery, not decorative SVGs.
- Left-side vertical section rail on every section.
- Scroll-linked rail fill/dot motion.
- Section elements reveal on scroll with blur/translate/opacity, using CSS only.
- Keep UI simple. Avoid extra decorative controls that do not work.

## Font

The page uses a local font:

```js
const fkGrotesk = localFont({
  src: '../fonts/FKGroteskTrial-Regular.otf',
  variable: '--font-blog-new',
  display: 'swap',
});
```

All major text should use `var(--font-blog-new)` before fallback fonts. Do not introduce a new font unless explicitly requested.

## Header

Current header brand is text-only:

```txt
Builders Daily Blog
```

Rules:

- Do not show the logo icon in the header. It may be used later in the footer.
- Keep “Blog” orange.
- Do not add the light/dark mode button back.
- `Subscribe` is the only right-side header CTA on desktop.
- Header should remain calm and not oversized.

## Section 01: Hero

Asset:

- Background image: `/hero.webp`

Intent:

- Match the original AIXP-style hero reference but branded as Builders Daily Blog.
- Light warm background with right-side surreal orange sun/stair image.
- Left text:
  - `Exploring AI.`
  - `Experimenting with Tomorrow.`
- Subcopy:
  - `Thoughts, experiments and ideas`
  - `from the frontier of artificial intelligence.`
- CTAs:
  - Primary: `Explore Experiments`
  - Secondary: `Learn More` with circular arrow icon.

Important constraints:

- Do not add orange blur masks or extra blobs over the hero image.
- Do not add dark faded overlays at the bottom unless specifically requested.
- The visible pale area below the CTA comes from the actual hero background/wash; avoid trying to hide it with heavy gradients.
- Keep the vertical rail on the left with animated line and dot.
- Keep the technical grid/orbit details subtle.

## Section 02: Latest Experiments

Intent:

- Deep dark section.
- Left intro column:
  - `Latest`
  - `Experiments`
  - `A collection of recent AI projects with real outcomes.`
  - `View All`
- Right side has three cards.

Card data:

- `/blog-new/latest-smoke.png`
- `/blog-new/latest-cubes.png`
- `/blog-new/latest-waves.png`

Card design:

- Dark translucent cards with thin border.
- Image area must take more vertical space than the body, close to the original reference.
- Body is compact.
- No top-right slider arrows. They were intentionally removed.
- Hover: card lifts slightly, image zooms, arrow moves right.

Do not make cards too tall. Keep the image ratio generous but the overall card compact.

## Section 03: About AI Experiments

Asset:

- `/blog-new/about-profile.png`

Intent:

- Light warm technical grid background.
- Left copy:
  - `About`
  - `AI Experiments`
  - `We run experiments to understand how AI systems think, learn and evolve. Starting from the proxies, and up the meta stack.`
  - `Read More`
- Right visual is the profile/pixel AI image.
- Keep “Explore.” eyebrow and line above the visual.

Do not replace this with a generic two-card layout. It should remain editorial and image-led.

## Section 04: Featured Series

Assets:

- `/blog-new/series-reasoning.png`
- `/blog-new/series-synthetic.png`
- `/blog-new/series-creative.png`

Intent:

- Warm off-white section.
- Left intro:
  - `Featured`
  - `Series`
  - `Deep dives into themes we're actively exploring.`
  - `Browse Series`
- Right side square cards.

Rules:

- Cards must be square: `aspect-ratio: 1 / 1`.
- Do not reintroduce carousel arrow controls.
- Cards should be compact, clean, and image-led.
- Keep pagination dots below cards.

## Section 05: Stay In The Loop

Asset:

- `/vfyypoivgqkiznurc5d0.webp`

Intent:

- Full-bleed scenic subscribe CTA.
- Left rail marked `05`.
- Text:
  - `Stay in the Loop`
  - `Get the latest experiments, ideas and insights delivered to your inbox.`
- Form:
  - Placeholder: `Enter your email`
  - Button: `Subscribe` with orange arrow.

Current sizing direction:

- Form should be slim, not huge.
- Desktop target is around `560px` wide and `64px` tall.
- Keep button segment dark charcoal, not orange.
- Keep the form subtle and readable over the image.
- Button currently uses `type="button"` to avoid accidental page reload.

## Rails And Scroll Motion

Every section should have a left rail:

- Issue number.
- Thin vertical line.
- Filled line segment.
- Dot.

Existing rail class families:

- Hero: `progressRail`, `issue`, `railTrack`, `railFill`, `railNode`
- Section 02: `experimentsRail`, `experimentsIssue`, `experimentsLine`, `experimentsFill`, `experimentsDot`
- Section 03: `aboutRail`, `aboutIssue`, `aboutLine`, `aboutFill`, `aboutDot`
- Section 04: `seriesRail`, `seriesIssue`, `seriesLine`, `seriesFill`, `seriesDot`
- Section 05: `loopRail`, `loopIssue`, `loopLine`, `loopFill`, `loopDot`

Use CSS `animation-timeline: view()` for scroll-linked rail fill/dot where supported. Provide basic intro keyframes as fallback.

## Animation System

Motion is CSS-only. Do not add Framer Motion or GSAP unless explicitly requested.

Current motion style:

- Hero load reveal via `heroElementReveal`.
- Hero image settles via `heroImageSettle`.
- Text/card/visual scroll reveals via:
  - `sectionTextReveal`
  - `cardScrollReveal`
  - `visualScrollReveal`
  - `sectionFallbackReveal`
- Use only performant properties:
  - `opacity`
  - `translate`
  - `scale`
  - `filter`
  - `transform`

Reduced motion:

- Keep the scoped `prefers-reduced-motion` block under `.page`.
- Do not use global `*` selectors directly in CSS Modules. Next CSS Modules require pure selectors.

## Responsive Rules

Breakpoints are already handled in the CSS:

- `@media (max-width: 1180px)`
- `@media (max-width: 900px)`
- `@media (max-width: 620px)`

Do not add arbitrary new breakpoints unless necessary.

Mobile rules:

- Nav links hidden.
- Subscribe header CTA hidden on small mobile.
- Sections become single-column.
- Cards become horizontal scroll where appropriate.
- Section rails remain visible and aligned left.
- Section 05 form stacks vertically on small mobile.

## Icons

Use `lucide-react` only for arrows currently. Import:

```js
import { ArrowRight } from 'lucide-react';
```

Do not re-add `SunMedium` unless the theme button is explicitly requested.

## Design Don’ts

Avoid these regressions:

- Do not add the logo icon back into the header.
- Do not add the light/dark button back.
- Do not add section 02 or 04 carousel arrow buttons.
- Do not add orange blur spots to the hero.
- Do not add heavy dark gradient overlays over the hero bottom.
- Do not make buttons bulky; keep CTA heights restrained.
- Do not make section 02 cards tall with too much text area.
- Do not make section 04 cards tall; they should remain square.
- Do not replace image-led sections with generic cards.
- Do not add decorative orbs/blobs.
- Do not use purple/blue AI gradients.
- Do not introduce new dependencies for simple motion.

## Implementation Notes For Future Agents

When adding a new section:

1. Use a full-width `<section>` in `page.js`.
2. Add a left rail consistent with existing sections.
3. Use the same font and orange accent.
4. Add CSS in `page.module.css`, scoped to the new section.
5. Add rail intro keyframes and scroll keyframes.
6. Add the section elements to the reveal selector lists inside:
   - `@supports (animation-timeline: view())`
   - `@supports not (animation-timeline: view())`
7. Add responsive rules for `1180px`, `900px`, and `620px`.
8. Run a route check:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:3000/blog-new | Select-Object -ExpandProperty StatusCode
```

Expected result:

```txt
200
```

## Current Page Structure

```txt
01 Hero
02 Latest Experiments
03 About AI Experiments
04 Featured Series
05 Stay in the Loop
```

Keep the page feeling like one continuous editorial story rather than separate unrelated blocks.
