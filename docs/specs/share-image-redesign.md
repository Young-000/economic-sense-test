# Share Image Redesign

## JTBD
When I finish the economic sense test and want to share my result on SNS (KakaoTalk, Instagram Stories, Twitter/X), I want the share image to look polished and visually striking, so I can show off my result and motivate my friends to try the test themselves.

## Problem
- **Who:** Players who complete the test and tap "Share as Image" (estimated 15-25% of completions based on typical quiz-game share rates)
- **Pain:** Medium frequency, medium severity. The current share image is functional but visually plain -- it resembles a data dashboard more than a shareable social card. Users who see it on a timeline may scroll past it without stopping.
- **Current workaround:** Users screenshot the Result page directly (which includes unrelated UI chrome) or skip sharing altogether.
- **Success metric:** Increase share-image-to-completion ratio (track via event logging in a future cycle). Qualitatively: the generated PNG should pass the "thumb-stop test" -- would you stop scrolling if you saw this on Instagram Stories?

## Solution

### Overview
Redesign the `ShareImageCard` component (the off-screen DOM element captured by html2canvas) to produce a more visually impactful, social-media-optimized image. The current card has the right data (tier, investor type, balance, stats) but lacks visual hierarchy, breathing room, and a cohesive color story. The redesign focuses on layout, typography weight, color emphasis, and removing low-signal noise -- without changing the capture pipeline (`useShareImage` + `elementToBlob` via html2canvas).

### Design Principles
1. **Thumb-stop visual** -- the top 30% of the image must grab attention (big emoji + tier grade + viral reaction)
2. **One clear number** -- the return percentage should be the single most prominent data point
3. **Less is more** -- remove the three stat bars (risk/rationality/luck) from the share image; they add clutter without being meaningful to outside viewers
4. **Brand recall** -- consistent app branding at the bottom for traffic back to the app

### User Flow
1. User taps "Share as Image" on ResultPage
2. System generates image via `useShareImage` hook (unchanged)
3. ShareModal opens with the redesigned image preview
4. User downloads or shares via Web Share API / platform buttons (unchanged)

### Proposed Layout (top to bottom)
```
+--------------------------------------+
| [gradient banner: viral reaction]    |  <- result-dependent gradient
| [app logo: 돈 감각 테스트]            |
+--------------------------------------+
|                                      |
|           [TIER GRADE CIRCLE]        |  <- 120px, prominent border glow
|           S+ / 투자의 신              |
|                                      |
|        [emoji 64px] [type name]      |  <- investor type
|           #한줄태그                   |
|                                      |
+--------------------------------------+
|                                      |
|     최종 자산: 1,234만원              |
|         +42.5%  (huge, colored)      |
|     (시작: 1,000만원)                |
|                                      |
+--------------------------------------+
| economic-sense-test.vercel.app       |
| "나도 테스트하기!"                     |  <- CTA
+--------------------------------------+
```

### Scope (MoSCoW)

**Must:**
- Redesign `ShareImageCard.tsx` layout: remove stat bars, enlarge tier + return percentage
- Update share-image CSS styles in `global.css` for the new layout
- Maintain 400px fixed width (html2canvas requirement)
- Keep `scale: 2` for retina-quality output
- Ensure html2canvas renders the redesigned card correctly (no missing styles, no broken gradients)
- Tier badge becomes the hero element with a circular glow effect
- Return percentage is the single largest number on the card
- Viral reaction badge stays at top with result-dependent gradient

**Should:**
- Add subtle background pattern or noise texture (CSS-only, no external assets -- html2canvas compatibility)
- Improve color contrast between sections (use darker card backgrounds within the overall dark theme)
- Adjust footer CTA to be more visually distinct (pill button style instead of plain text)

**Could:**
- Add a subtle watermark/branding element
- Animate the share modal preview (CSS only, not in the captured image)

**Won't (this cycle):**
- Change the html2canvas capture pipeline or switch to a different library (e.g., dom-to-image)
- Add dynamic user avatar or profile picture
- Change the ShareModal UI/UX (separate ticket)
- Add GA4 event tracking for share actions (separate ticket -- DA backlog)
- Change viral text templates in `viralTemplates.ts`

## Acceptance Criteria

- [ ] AC1: Given the share image is generated, When viewed at 1x resolution (400x~600px), Then the tier grade letter (e.g., "S+") is the visually largest text element on the card (minimum 48px rendered font size)
- [ ] AC2: Given the share image is generated, When the user's return is positive, Then the return percentage text is colored green (`#10B981`) and displayed at minimum 32px rendered font size
- [ ] AC3: Given the share image is generated, When the user's return is negative, Then the return percentage text is colored red (`#ff4757`) and displayed at minimum 32px rendered font size
- [ ] AC4: Given the redesigned ShareImageCard, When rendered off-screen and captured by html2canvas, Then the resulting PNG image has no visual artifacts (no missing gradients, no clipped text, no white gaps)
- [ ] AC5: Given the redesigned card, When compared to the previous design, Then the stat bars (risk/rationality/luck) are no longer present in the share image
- [ ] AC6: Given the share image, Then the app URL (`economic-sense-test.vercel.app`) and CTA text are visible at the bottom of the image
- [ ] AC7: Given the share image, Then the investor type emoji, name, and tag are displayed in a dedicated section below the tier badge
- [ ] AC8: Given any of the 8 investor types, When the share image is generated, Then the result-dependent gradient (from `getResultGradient`) is applied to the top banner
- [ ] AC9: Given the share image redesign, When `npm run build` is executed, Then the build succeeds with no TypeScript errors
- [ ] AC10: Given the share image redesign, When `npm run test` is executed, Then all existing tests pass (no regressions)

## Task Breakdown

1. **Remove stat bars from ShareImageCard** -- S -- Deps: none
   - Delete the `.share-card-stats` section (risk/rationality/luck bars) from `ShareImageCard.tsx`
   - Remove corresponding props if no longer needed, or keep them for future use
   - Remove related CSS in `global.css`

2. **Redesign ShareImageCard layout** -- M -- Deps: [1]
   - Restructure JSX: viral badge (top) -> logo -> tier circle (hero) -> investor type -> balance/return -> footer
   - Enlarge tier grade display: 120px circle with glow border matching `tier.color`
   - Enlarge return percentage: 32px+ font, colored by sign
   - Simplify footer: URL + CTA pill

3. **Update share-image CSS** -- M -- Deps: [2]
   - Rewrite `.share-image-card` and child class styles in `global.css`
   - Ensure all styles use CSS properties (no Tailwind) for html2canvas compatibility
   - Add tier glow effect with `box-shadow` and `border` (CSS variables for tier color)
   - Test gradient rendering with html2canvas

4. **Verify html2canvas rendering** -- S -- Deps: [3]
   - Manually test image generation for each return-rate bracket (>100%, >50%, >0%, >-30%, <-30%)
   - Verify no visual artifacts
   - Verify PNG file size is reasonable (< 500KB)

5. **Run full test suite and build** -- S -- Deps: [4]
   - `npm run test` -- all pass
   - `npm run build` -- no errors
   - `npm run lint && npm run typecheck` -- clean

## Technical Notes

### Files to Modify
- `src/presentation/components/ShareImageCard.tsx` -- main layout changes
- `src/styles/global.css` -- share-image CSS section (~lines 2634-2921)

### Files NOT to Modify
- `src/presentation/hooks/useShareImage.ts` -- capture pipeline unchanged
- `src/presentation/components/result/ShareModal.tsx` -- modal UI unchanged
- `src/lib/shareUtils.ts` -- utility functions unchanged
- `src/data/viralTemplates.ts` -- share text unchanged

### html2canvas Constraints
- All styles must be inline or in loaded stylesheets (CSS variables work)
- No `backdrop-filter` (not supported)
- Gradients via `linear-gradient` and `radial-gradient` are supported
- `box-shadow` is supported
- External fonts may not render; stick to system font stack
- The card is rendered off-screen at `left: -9999px` (`.share-image-wrapper`)

### Props Available (from ShareImageCardProps)
- `profile`: `{ name, emoji, tag, description, ... }`
- `tier`: `{ grade, name, description, color, bgColor, minReturn }`
- `finalBalance`, `initialBalance`, `totalReturn`
- `riskScore`, `rationalityScore`, `luckScore` (can keep in props even if not displayed)

## Open Questions
- None. The scope is deliberately limited to the visual redesign of the off-screen card only.

## Out of Scope
- **ShareModal redesign** -- the modal that previews the image and offers share/download buttons is not changed in this cycle
- **Share text templates** -- `viralTemplates.ts` text content is not changed
- **Analytics** -- event tracking for share actions will be a separate backlog item
- **Alternative capture libraries** -- staying with html2canvas for this cycle
- **Video/animated share format** -- static PNG only

## RICE Score

| Factor | Value | Rationale |
|--------|-------|-----------|
| Reach | 500 | ~500 users/quarter complete the test; ~25% attempt to share |
| Impact | 2 (high) | A better share image directly increases viral coefficient -- each share reaches 50-200 people on SNS |
| Confidence | 80% | The redesign is purely visual; html2canvas compatibility is the main risk |
| Effort | 1 cycle | One developer cycle (layout + CSS + verification) |

**RICE = (500 x 2 x 0.8) / 1 = 800**
