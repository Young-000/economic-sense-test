# Dev Report: intro-redesign

**Date:** 2026-02-17
**Branch:** feature/intro-redesign
**Worktree:** `.worktrees/intro-redesign/`
**Commit:** `feat(intro): redesign IntroPage for CTA-first layout`

---

## Summary

Redesigned IntroPage to follow a "CTA-first" layout principle. The primary CTA button ("돈 불려보기") is now positioned above the fold on mobile 375px viewports, removing 4 elements that previously sat between the top of the page and the start button. Fake social proof data (hardcoded rolling messages, today's #1 player display) has been completely removed. The season banner now only renders during special events.

---

## Files Modified

| File | Change Type | Lines Added/Removed |
|------|------------|---------------------|
| `src/presentation/pages/IntroPage.tsx` | Modified | Significant restructure |
| `src/presentation/pages/__tests__/IntroPage.test.tsx` | Modified | Updated mocks, added new assertions |
| `src/styles/global.css` | Modified | Removed ~80 lines of unused CSS |

---

## Elements Removed

| Element | Code/CSS | Reason |
|---------|----------|--------|
| `SOCIAL_PROOF_MESSAGES` constant | 6 hardcoded fake messages array | Fake data undermines user trust |
| `socialMessage` state variable | `useState('')` + rolling `useEffect` (4s interval) | Powered fake social proof |
| `todayTop` state variable | `useState<{nickname, totalReturn} \| null>` | Unnecessary API call for removed UI |
| `getTodayTopPlayer()` import/call | `Promise.all([..., getTodayTopPlayer()])` | No longer needed |
| Social proof banner | `.social-proof-banner` div with stats + live dot | Fake social proof UI |
| "MZ 필수 테스트" badge | `.intro-badge` div | Self-promotional badge with no user value |
| Live dot animation | `.live-dot` span + `@keyframes live-pulse` | Fake "LIVE" indicator |
| Live message | `.live-message` span + `@keyframes fade-in` | Rolling fake messages |
| Today top display | `.today-top` span | "오늘 1위" removed |

### CSS Classes Removed
- `.social-proof-banner`
- `.social-proof-stats`
- `.player-count`, `.player-count strong`
- `.today-top`
- `.social-proof-live`
- `.live-dot`
- `@keyframes live-pulse`
- `.live-message`
- `@keyframes fade-in`
- `.intro-badge`
- `@keyframes pulse` (the one at line ~191 for intro-badge; note: a separate `@keyframes pulse` exists later for other elements)

---

## Elements Added

| Element | Description |
|---------|-------------|
| `.intro-participant-count` | Simple one-line participant count ("N명이 참여했어요"), only shown when `totalPlayers > 0` |

---

## Elements Modified

| Element | Before | After |
|---------|--------|-------|
| Season banner | Always rendered (all seasons) | Only renders when `seasonInfo.isSpecialEvent === true` |
| CTA button position | After 7 elements (badge, title, subtitle, mode selector, etc.) | After 2-3 elements (title + subtitle), fold-위 guaranteed |
| Mode selector position | Above CTA (forced choice before start) | Below CTA (optional, default: normal mode) |
| Hook text position | Below CTA | Immediately below CTA (before fold break) |
| `.intro-content` | `justify-content: center` (vertically centered) | `padding-top: 24px` (top-aligned for predictable fold position) |
| `.intro-title` | `margin-bottom: 12px` | `margin-bottom: 8px` (tighter) |
| `.intro-subtitle` | `margin-bottom: 20px` | `margin-bottom: 16px` (tighter) |
| `.intro-hook` | `margin-top: 16px; margin-bottom: 16px` | `margin-top: 12px; margin-bottom: 20px` |
| Social proof data loading | `Promise.all([getTotalPlayers(), getTodayTopPlayer()])` | `getTotalPlayers()` only (one fewer API call) |
| `formatPlayerCount` | Returns `'1,234'` when count is 0 (fake fallback) | Returns `''` when count is 0 (honest -- hides section) |
| Challenge prompt text | `이 기록을 이길 수 있을까요? 🔥` | `이 기록을 이길 수 있을까요?` (removed emoji for consistency) |

---

## Layout: Before vs After

### Before (top to bottom)
1. Season banner (always)
2. Challenge banner (conditional)
3. Social proof banner (fake stats + live dot + rolling messages)
4. "MZ 필수 테스트" badge
5. Title
6. Subtitle
7. Mode selector
8. **CTA button** <-- 7 elements above
9. Hook text
10. Features (3 items)
11. Disclaimer
12. AdSense

### After (top to bottom)
1. Challenge banner (conditional -- challenge URL only)
2. Season banner (conditional -- special events only)
3. Title
4. Subtitle
5. **CTA button** <-- 2-4 elements above (most of the time 2)
6. Hook text
7. Mode selector
8. Features (3 items)
9. Participant count (real data, one line)
10. Disclaimer
11. AdSense

**Key improvement:** CTA elements above reduced from 7 to 2-4.

---

## Build / Test Results

| Check | Result |
|-------|--------|
| `npm run typecheck` | PASS (0 errors) |
| `npm run build` | PASS (511ms, gzip totals unchanged) |
| `npx vitest run` | PASS (26 test files, 629 tests, 0 failures) |

### Bundle Size
- CSS: 42.26 KB (gzip 7.86 KB) -- reduced slightly due to removed CSS
- JS index: 51.87 KB (gzip 17.44 KB) -- reduced slightly due to removed constants/logic

---

## Test Changes

### Removed Tests
- `should render MZ badge` -- replaced with negative assertion

### Added Tests
- `should not render MZ badge (removed)` -- verifies badge removal
- `should not render fake social proof messages` -- verifies SOCIAL_PROOF_MESSAGES removal
- `should not render today top player` -- verifies todayTop removal
- `should not render season banner during normal season` -- verifies conditional season banner

### Modified Tests
- Mock for `@data/rankingService` no longer includes `getTodayTopPlayer`

---

## Decisions / Deviations from Spec

1. **Open Question #1 (participant count when 0):** Per spec suggestion, when `totalPlayers === 0`, the participant count section is hidden entirely rather than showing a fake number. The old code used `'1,234'` as a fake fallback -- this was removed as dishonest.

2. **Challenge prompt emoji:** Removed the fire emoji from the challenge prompt text for visual consistency with the simplified design. The challenge banner itself already has enough visual weight.

3. **`getTodayTopPlayer` function kept in `rankingService.ts`:** The function definition was NOT removed from the service file, only the import/call from IntroPage. Other pages (e.g., ResultPage) may use it in the future.

4. **Scroll hint animation (Could scope):** Not implemented in this commit. The spec listed it as "Could" scope.

5. **CTA micro-interaction (Could scope):** Not implemented. Existing hover/active styles are retained.

---

## Known Issues / QA Focus Areas

1. **Fold position on 375px:** The CTA should be visible without scrolling on a 375px-wide mobile viewport. QA should verify this on real devices (iPhone SE, iPhone 12 mini) since browser chrome height varies. The `padding-top: 24px` on `.intro-content` was chosen to allow enough space.

2. **Challenge banner + season banner stacking:** If both a challenge URL AND a special event are active simultaneously, both banners render above the hero. This may push the CTA closer to the fold edge on very small screens. QA should test this edge case.

3. **Season banner conditional rendering:** The test runs in a date context where `isSpecialEvent` is `false` (February 17 is within `new_year` range: Jan 20 - Feb 5, so it is actually NOT a special event on Feb 17). If tests are run during a special event period (e.g., Feb 13-14 for Valentine's), the season banner test may need adjustment.

4. **Participant count loading:** The participant count is fetched asynchronously. There is a brief moment after page load where the count is 0 and the section is hidden. Once data loads, it appears. This is intentional -- no skeleton/loading state for this small element.

5. **Mode change UX:** When the user scrolls down and selects "extreme mode", the CTA button (which is above) updates its text and style via React state. The user does not see this change unless they scroll back up. This is by design per spec ("CTA 텍스트/스타일이 바뀌는데, fold 위에 있는 CTA에 변경이 반영되어야 함").

---

*Generated by Developer Agent | 2026-02-17*
