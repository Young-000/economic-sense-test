# Spec: 모드 변경 피드백 개선

**Issue:** PD Issue #1 — 모드 선택 시 로컬 확인 메시지
**Date:** 2026-03-29

## Problem

모드 버튼(일반/극한) 탭 시 보더 색상만 바뀌고 햅틱·청각·시각적 확인 피드백이 없어, 사용자가 선택이 반영됐는지 인지하기 어렵다.

## Acceptance Criteria

- [ ] 모드 버튼 탭 즉시 토스트/인라인 확인 메시지가 표시된다 (예: "극한 모드 선택됨")
- [ ] 확인 메시지는 1.2초 후 자동 소멸하며 레이아웃을 밀지 않는다
- [ ] 모드 전환 시 버튼 영역에 scale(1.03) 펄스 애니메이션이 재생된다 (80ms)
- [ ] 극한 모드 선택 시 메시지 색상이 경고 톤(빨강 계열)으로 표시된다
- [ ] 일반 모드로 복귀 시 메시지 색상이 기본 톤(파랑 계열)으로 표시된다
- [ ] 확인 메시지는 `aria-live="polite"`로 스크린 리더에 읽힌다
- [ ] 같은 모드를 재탭해도 피드백이 트리거되지 않는다 (동일 모드 중복 탭 무시)

## Technical Approach

**수정 대상:** `IntroPage.tsx` — `handleModeChange` + 모드 선택 JSX 블록

1. `modeFeedback: { message: string; mode: GameMode } | null` 상태 추가
2. `handleModeChange` 내에서 선택된 모드가 현재와 다를 때만 상태 세팅 + `setTimeout` 1200ms 후 `null` 초기화
3. 모드 버튼 래퍼에 `mode-btn--pulse` CSS 클래스를 조건부 적용 (CSS `@keyframes` scale 펄스)
4. 모드 선택기 하단에 인라인 피드백 영역 추가:
   ```tsx
   {modeFeedback && (
     <p className={`mode-feedback mode-feedback--${modeFeedback.mode}`} aria-live="polite">
       {modeFeedback.message}
     </p>
   )}
   ```
5. `global.css`에 `.mode-feedback`, `.mode-btn--pulse` 스타일 추가
