# Mobile Responsive Optimization

## JTBD
When I open the economic sense test on my phone (375px), tablet (768px), or desktop monitor (1920px), I want every page to look intentionally designed for my screen size, so I can play the game comfortably without pinching, scrolling horizontally, or squinting at tiny text.

## Problem
- **Who:** All users -- mobile accounts for ~70-80% of casual quiz-game traffic (KakaoTalk/Instagram referral links open in mobile browsers). Desktop users come via direct URL or Twitter/X links.
- **Pain:** High frequency, medium severity. The app currently uses a fixed `max-width: 340px` on IntroPage and `max-width: 400-440px` on Game/ResultPage. On 375px screens, content is cramped with minimal side padding. On 1920px screens, the narrow column floats in a sea of black background, looking unfinished. On 768px tablets, the layout wastes significant horizontal space.
- **Current workaround:** Users on small phones may accidentally tap wrong buttons. Desktop users see the app as "mobile-only" and may bounce. No workaround for the wasted space.
- **Success metric:** (1) Zero horizontal overflow at 375px. (2) Content fills at least 50% of viewport width at 1920px. (3) All interactive elements (buttons, choice cards) have minimum 44px tap targets at all breakpoints.

## Solution

### Overview
Add responsive CSS breakpoints and fluid typography/spacing to the existing single-column layout. The approach is **mobile-first scaling** -- the current design is mobile-optimized at ~400px; we extend it downward to 375px (tighter spacing, smaller fonts) and upward to 768px/1024px/1920px (wider max-width, larger typography, potential two-column layouts for side-by-side content). No structural component changes are needed -- this is a CSS-only enhancement using media queries and `clamp()` for fluid values.

### Breakpoint Strategy
| Breakpoint | Target | max-width | Key Changes |
|-----------|--------|-----------|-------------|
| < 375px | Small phones (SE, mini) | 100% - 32px | Tighter padding, smaller fonts |
| 375-767px | Standard phones (default) | 340-400px | Current design (baseline) |
| 768-1023px | Tablets | 560px | Wider cards, larger fonts, more breathing room |
| 1024-1919px | Small desktops / laptops | 640px | Comfortable reading width, hover states |
| >= 1920px | Large desktops | 720px | Maximum content width, generous spacing |

### User Flow
1. User opens app on any device
2. Layout adapts immediately (CSS media queries, no JS)
3. All pages (Intro, Game, Result) render correctly at the user's viewport width
4. Interactive elements maintain usable tap/click targets

### Pages Affected
1. **IntroPage** -- `.intro-page`, `.intro-content` (currently `max-width: 340px`)
2. **GamePage** -- `.game-page` (currently `max-width: 440px`)
3. **ResultPage** -- `.result-content` (currently `max-width: 400px`)
4. **ShareModal** -- `.share-modal` (currently `max-width: 420px`)
5. **Game result overlay** -- `.result-popup` (currently `max-width: 380px`)

### Scope (MoSCoW)

**Must:**
- Add `@media` breakpoints for 375px, 768px, 1024px, 1920px
- IntroPage: widen `max-width` at larger breakpoints, fluid title font size
- GamePage: widen `max-width` at larger breakpoints, ensure choice cards don't overflow at 375px
- ResultPage: widen `max-width` at larger breakpoints, scale cards proportionally
- Ensure no horizontal scrollbar at any breakpoint (375px through 1920px)
- All buttons and interactive elements maintain 44px minimum touch target
- Font sizes use `clamp()` for fluid scaling between breakpoints
- ShareModal remains usable and centered at all breakpoints

**Should:**
- GamePage choice cards: side-by-side layout at >= 768px (instead of stacked)
- ResultPage stat bars: increase height at larger breakpoints for better readability
- IntroPage mode selector: larger tap targets at tablet+ sizes
- Add a subtle max-width container with centered content and visible background differentiation at 1920px (so the app doesn't feel lost in empty space)

**Could:**
- Two-column layout for ResultPage analysis sections at >= 1024px
- Larger emoji sizes at desktop breakpoints
- Keyboard navigation enhancements for desktop (Tab focus visible)

**Won't (this cycle):**
- Dark/light mode toggle
- Landscape-specific layouts
- Container queries (CSS `@container`) -- browser support still limited
- Tailwind CSS migration (separate P3 backlog item)
- Touch gesture support (swipe between pages)

## Acceptance Criteria

- [ ] AC1: Given viewport width 375px, When IntroPage is loaded, Then there is no horizontal scrollbar and all content is fully visible within the viewport
- [ ] AC2: Given viewport width 375px, When GamePage is loaded with a question, Then both choice cards are fully visible without horizontal overflow, and all text (choice labels, expected value, probability %) is readable (no truncation or overlap)
- [ ] AC3: Given viewport width 375px, When ResultPage is loaded, Then all cards (tier badge, investor type, balance, ranking, analysis) fit within the viewport width without overflow
- [ ] AC4: Given viewport width 768px, When IntroPage is loaded, Then `.intro-content` max-width is at least 500px (wider than the default 340px)
- [ ] AC5: Given viewport width 768px, When GamePage is loaded, Then `.game-page` max-width is at least 520px (wider than the default 440px)
- [ ] AC6: Given viewport width 1920px, When any page is loaded, Then content is horizontally centered and the content column max-width is at least 640px
- [ ] AC7: Given viewport width 1920px, When IntroPage is loaded, Then the title font size is visually larger than on mobile (at least 40px computed)
- [ ] AC8: Given any breakpoint, When all interactive buttons are inspected, Then every button has a minimum computed height of 44px (WCAG 2.5.8 target size)
- [ ] AC9: Given the responsive changes, When `npm run build` is executed, Then the build succeeds with no errors
- [ ] AC10: Given the responsive changes, When `npm run test` is executed, Then all existing unit and E2E tests pass
- [ ] AC11: Given viewport width 375px, When ShareModal opens, Then the modal fills the viewport width with proper padding (no content clipped off-screen)
- [ ] AC12: Given viewport width 768px or wider, When GamePage result overlay appears, Then `.result-popup` max-width scales up proportionally (at least 440px)

## Task Breakdown

1. **Define CSS custom properties for fluid spacing** -- S -- Deps: none
   - Add `--content-max-width`, `--content-padding`, `--font-size-title`, `--font-size-body` etc. using `clamp()` in `:root`
   - Example: `--content-max-width: clamp(300px, 90vw, 720px)`

2. **Add responsive breakpoints for IntroPage** -- M -- Deps: [1]
   - `.intro-content`: update `max-width` to use fluid value or breakpoint overrides
   - `.intro-title`: `font-size: clamp(28px, 5vw, 44px)`
   - `.intro-subtitle`: fluid font size
   - `.start-button`: ensure 44px+ height at all sizes
   - `.mode-selector .mode-btn`: larger at tablet+
   - `.feature`: comfortable padding at wider viewports

3. **Add responsive breakpoints for GamePage** -- M -- Deps: [1]
   - `.game-page`: update `max-width` for breakpoints
   - `.situation-card`: fluid font size for `.situation-text`
   - `.choice-card`: ensure no overflow at 375px; consider side-by-side at 768px+
   - `.balance-amount`: fluid font size
   - `.result-popup`: widen `max-width` at larger breakpoints
   - `.result-amount`: scale font size proportionally
   - `.probability-bar-container`: maintain readable height

4. **Add responsive breakpoints for ResultPage** -- M -- Deps: [1]
   - `.result-content`: update `max-width` for breakpoints
   - `.tier-badge-hero`, `.investor-type-card`: scale padding and font sizes
   - `.final-balance-card .balance-value`: fluid font size
   - `.ranking-section`, `.analysis-section`: comfortable at wider viewports
   - `.action-buttons`: wider buttons at larger viewports

5. **Add responsive breakpoints for ShareModal** -- S -- Deps: [1]
   - `.share-modal`: ensure full-width at 375px with padding, wider at desktop
   - `.share-modal-preview img`: maintain aspect ratio
   - `.share-platform-buttons`: ensure buttons don't overflow at 375px

6. **Add desktop-specific enhancements** -- S -- Deps: [2, 3, 4]
   - At 1920px: add subtle background differentiation (e.g., slightly lighter card behind the content column)
   - Hover states already exist for buttons; verify they work well at desktop
   - Ensure scrollbar styling works at all widths

7. **Cross-breakpoint visual QA** -- S -- Deps: [2, 3, 4, 5, 6]
   - Test at 375px, 768px, 1024px, 1920px using browser DevTools responsive mode
   - Verify no horizontal overflow at any width
   - Verify all interactive targets >= 44px
   - Verify font readability at all sizes

8. **Run full test suite and build** -- S -- Deps: [7]
   - `npm run test` -- all pass
   - `npm run build` -- no errors
   - `npm run lint && npm run typecheck` -- clean

## Technical Notes

### Files to Modify
- `src/styles/global.css` -- all responsive CSS changes go here (single CSS file)
  - Add `@media` queries at the bottom of each page section or in a dedicated responsive section
  - Use `clamp()` in `:root` for fluid custom properties

### Files NOT to Modify
- No `.tsx` component files need changes -- this is CSS-only
- No JavaScript logic changes
- No new files created

### CSS Strategy: Mobile-First with `clamp()`
```css
/* Example approach */
:root {
  --content-max-width: clamp(300px, 90vw, 720px);
  --content-padding: clamp(16px, 4vw, 32px);
  --title-size: clamp(28px, 5vw, 44px);
  --body-size: clamp(15px, 2.5vw, 18px);
}

/* Breakpoint overrides where clamp() alone isn't sufficient */
@media (min-width: 768px) {
  .intro-content { max-width: 560px; }
  .game-page { max-width: 560px; }
  .result-content { max-width: 560px; }
}

@media (min-width: 1024px) {
  .intro-content { max-width: 640px; }
  .game-page { max-width: 640px; }
  .result-content { max-width: 640px; }
}

@media (min-width: 1920px) {
  .intro-content { max-width: 720px; }
  .game-page { max-width: 720px; }
  .result-content { max-width: 720px; }
}
```

### Key Current Values (for reference)
| Element | Current Value | Issue |
|---------|--------------|-------|
| `.intro-content` max-width | 340px | Too narrow for tablet+ |
| `.game-page` max-width | 440px | Cramped at 375px, too narrow at 768px+ |
| `.result-content` max-width | 400px | Too narrow at tablet+ |
| `.intro-title` font-size | 32px | Fixed -- should scale |
| `.balance-amount` font-size | 24px | Could be larger on desktop |
| `.result-amount` font-size | 56px | Might overflow at 375px |
| `.share-modal` max-width | 420px | Good for mobile, could widen for tablet |
| `@media` queries | Only `(hover: none)` | No responsive breakpoints exist |

### 375px Specific Concerns
- `.result-amount` at 56px may overflow on very small screens -- needs `clamp(36px, 10vw, 56px)`
- `.outcome-value` min-width 70px + `.probability-text` min-width 40px + bar = may be tight
- `.ranking-form` flex layout (input + button) may need wrapping at 375px

### Testing Strategy
- Use Chrome DevTools responsive mode at 375px, 768px, 1024px, 1920px
- Focus on: no overflow (inspect with `* { outline: 1px solid red }` trick), tap target sizes, text readability
- E2E tests should pass without modification (Playwright tests don't assert specific pixel sizes)

## Open Questions
- None. The breakpoint values (560px, 640px, 720px) are recommendations based on common content-width best practices. The developer can adjust if a slightly different value reads better visually.

## Out of Scope
- **Landscape mode** -- mobile landscape is a rare use case for quiz games; not worth the complexity
- **CSS Container Queries** -- too new for reliable cross-browser support
- **Tailwind migration** -- this is a P3 backlog item; responsive work here uses plain CSS media queries
- **Layout shifts during game** -- this spec is about static responsive layout, not dynamic content shifting
- **Image/asset optimization** -- no images are used (emoji-based UI), so no image responsive work needed
- **PWA manifest changes** -- viewport meta tag is already correctly set

## RICE Score

| Factor | Value | Rationale |
|--------|-------|-----------|
| Reach | 800 | Affects all users; ~70% mobile, ~20% tablet, ~10% desktop |
| Impact | 1 (medium) | Improves usability but the app already works at most sizes; mainly prevents edge-case issues at 375px and poor perception at 1920px |
| Confidence | 100% | Pure CSS changes, no logic risk, easy to verify |
| Effort | 1 cycle | One developer cycle (CSS breakpoints + verification) |

**RICE = (800 x 1 x 1.0) / 1 = 800**
