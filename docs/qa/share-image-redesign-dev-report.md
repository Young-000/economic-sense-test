# Share Image Redesign - Dev Report

## Date
2026-02-17

## Summary
Redesigned the `ShareImageCard` component to produce a more visually impactful, social-media-optimized share image. The card now features a clear visual hierarchy with the tier grade as the hero element, the return percentage as the most prominent number, and a clean investor type section -- all optimized for the "thumb-stop test" on SNS timelines.

## Files Modified
| File | Change Type | Description |
|------|-------------|-------------|
| `src/presentation/components/ShareImageCard.tsx` | Rewrite | Restructured layout, removed stat bars, added hero tier circle, enlarged return percentage |
| `src/styles/global.css` | Edit | Rewrote share-image CSS section (~lines 2634-2921) with new layout styles |

## Files NOT Modified (per spec)
- `src/presentation/hooks/useShareImage.ts` -- capture pipeline unchanged
- `src/presentation/components/result/ShareModal.tsx` -- modal UI unchanged
- `src/lib/shareUtils.ts` -- utility functions unchanged
- `src/data/viralTemplates.ts` -- share text templates unchanged

## Changes Detail

### ShareImageCard.tsx
- **Removed**: Stat bars section (risk/rationality/luck `share-card-stats`) and FOMO section
- **Removed**: `luckLabel` computation (no longer displayed)
- **Kept**: All props in `ShareImageCardProps` interface (riskScore, rationalityScore, luckScore still accepted but not rendered, so ResultPage does not need changes)
- **Added**: Hero tier circle (120px with glow effect via `box-shadow`)
- **Added**: Viral banner combining reaction text + app logo
- **Changed**: Return percentage now 36px font-weight 900 (was 28px)
- **Changed**: Investor type section is now a standalone centered section below tier
- **Changed**: Footer CTA is now a pill button style (green background, rounded)

### global.css (Share Image Card Section)
- **Removed**: All `.share-card-stats`, `.share-stat-*`, `.share-luck-*` styles
- **Removed**: `.share-card-viral`, `.share-viral-badge`, `.share-card-fomo` styles
- **Removed**: `.share-return-large`, `.share-card-description` styles
- **Removed**: `.share-tier-badge` (replaced by `.share-tier-hero` + `.share-tier-circle`)
- **Added**: `.share-viral-banner` -- top gradient banner
- **Added**: `.share-tier-hero` + `.share-tier-circle` -- 120px circular tier badge with glow
- **Added**: `.share-investor-type` -- dedicated investor type section
- **Added**: `.share-balance-section` -- balance area with subtle card background
- **Changed**: `.share-card-cta` now has pill button styling
- **Changed**: `.share-return-value` is 36px/900 weight (the single largest number)
- **Changed**: `.share-tier-grade` is 52px/900 weight (visually largest text)

## html2canvas Compatibility
All styles use html2canvas-compatible CSS:
- No `backdrop-filter` used
- Gradients via `linear-gradient` (supported)
- `box-shadow` for tier glow effect (supported)
- System font stack only (no external fonts)
- No CSS animations in the captured card
- 400px fixed width maintained
- CSS variables resolved at render time (html2canvas reads computed styles)

## Acceptance Criteria Status

| AC | Status | Notes |
|----|--------|-------|
| AC1: Tier grade is visually largest text (48px+) | PASS | 52px font-size, weight 900 |
| AC2: Positive return is green (#10B981), 32px+ | PASS | 36px, color set inline to `#10B981` |
| AC3: Negative return is red (#ff4757), 32px+ | PASS | 36px, color set inline to `#ff4757` |
| AC4: No visual artifacts in html2canvas output | NEEDS MANUAL TEST | All CSS is html2canvas-compatible; manual visual verification recommended |
| AC5: Stat bars removed | PASS | Entire `share-card-stats` section removed from JSX and CSS |
| AC6: App URL + CTA visible at bottom | PASS | Footer with URL text + CTA pill button |
| AC7: Investor type emoji, name, tag displayed | PASS | Dedicated `.share-investor-type` section |
| AC8: Result-dependent gradient applied to banner | PASS | `getResultGradient()` applied to `.share-viral-banner` via inline style |
| AC9: `npm run build` succeeds | PASS | Build successful, no TypeScript errors |
| AC10: `npm run test` -- all pass | PASS | 629/629 tests pass, 26/26 test files pass |

## Quality Gate Results

| Check | Result |
|-------|--------|
| `npm run typecheck` | PASS (0 errors) |
| `npm run lint` | PASS (0 errors, 4 pre-existing warnings) |
| `npm run build` | PASS (built in 511ms) |
| `npm run test` | PASS (629 tests, 26 files) |

## New Layout Structure
```
+--------------------------------------+
| [gradient banner: viral reaction]    |  <- getResultGradient()
| [app logo: 돈 감각 테스트]            |
+--------------------------------------+
|                                      |
|        [TIER GRADE CIRCLE]           |  <- 120px, border glow via box-shadow
|           SS / 금손 중의 금손          |
|                                      |
|         [emoji 48px]                 |
|         [type name 22px]             |
|          #한줄태그                    |
|                                      |
+--------------------------------------+
|        최종 자산 (13px label)         |
|        1,234만원 (28px bold)         |
|        +42.5% (36px, colored)        |
|        (시작: 1,000만원)              |
+--------------------------------------+
| URL (12px gray)    [나도 테스트하기!]  |  <- CTA pill
+--------------------------------------+
```

## Risks & Notes
- AC4 (no visual artifacts) requires manual testing with actual html2canvas capture. All CSS patterns used are known-compatible, but edge cases may exist with specific emoji rendering or very long investor type names.
- The `riskScore`, `rationalityScore`, and `luckScore` props are kept in the interface but intentionally not rendered, to avoid breaking the ResultPage component that passes them.
