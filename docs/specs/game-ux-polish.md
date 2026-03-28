# GamePage UX 폴리시

## JTBD
퀴즈를 풀고 있는 사용자가 **선택지 간 리스크/리워드를 직관적으로 비교**하고, **게임 진행 상황을 명확히 인지**하며, **부드러운 전환으로 몰입감을 유지**할 수 있어야 한다.

## Problem
- **Who:** 게임 플레이 중인 사용자 (전체 사용자의 ~80% — 게임 시작률 기준 추정)
- **Pain:** 중간 (기능은 동작하지만 비교/인지 UX에 마찰 존재)
  - 확률 바(`probability-bar`)가 높이 8px로 너무 작아 한눈에 비교 어려움
  - 두 선택지를 세로로 스크롤하며 비교해야 함 — 동시 비교 불가
  - 잔액 변동 시 시각적 피드백 없음 (숫자만 갱신)
  - 라운드 전환 시 질문 등장 애니메이션이 단조로움 (slideUp만 반복)
  - 결과 오버레이의 "다음" 버튼이 수익/손실 여부와 무관하게 동일한 초록색
- **Current workaround:** 없음. 사용자가 선택지를 번갈아 보며 암기한 뒤 선택
- **Success metric:**
  - 선택지 확률 바 높이 2배 이상 증가 (8px -> 16px+)
  - 잔액 변동 시 색상 + 크기 transition 적용
  - 기존 테스트 전부 통과

## Solution

### Overview
GamePage의 **기능은 건드리지 않고**, CSS 및 미세한 JSX 조정으로 UX 마찰을 해소한다. 핵심은 (1) 확률 바 가시성 향상, (2) 잔액 변동 피드백, (3) 결과 오버레이 컬러 분기, (4) 마지막 라운드 강조이다.

### 구체적 변경 사항

#### 1. 확률 바 가시성 개선
**현재:** `probability-bar-container` 높이 8px, 가늘어서 비교 어려움
**변경:**
- 높이: 8px -> 20px
- 내부 바에 확률 텍스트 인라인 표시 (50% 이상일 때)
- 확률 바 끝에 값 레이블 표시 위치 개선
- `probability-text`를 바 안쪽 또는 바로 옆에 배치하여 시선 이동 최소화

```css
/* Before */
.probability-bar-container {
  height: 8px;
}

/* After */
.probability-bar-container {
  height: 20px;
  position: relative;
}
```

#### 2. 잔액 변동 피드백
**현재:** 잔액 숫자만 변경됨 (transition: all 0.3s ease 있지만 시각적으로 눈에 띄지 않음)
**변경:**
- 수익 시: 잔액 텍스트 색상이 잠시 초록색으로 전환 + 크기 미세 증가
- 손실 시: 잔액 텍스트 색상이 잠시 빨간색으로 전환 + 흔들림 효과
- 300ms 후 원래 색상으로 복귀
- 구현: CSS class 토글 (`balance-increase`, `balance-decrease`) + setTimeout 제거

```typescript
// GamePage에 잔액 변화 감지 로직 추가
const prevBalance = useRef(gameState.balance);
const balanceChangeType = useMemo(() => {
  if (gameState.balance > prevBalance.current) return 'increase';
  if (gameState.balance < prevBalance.current) return 'decrease';
  return null;
}, [gameState.balance]);
```

```css
.balance-amount.increase {
  color: var(--positive);
  transform: scale(1.1);
}

.balance-amount.decrease {
  color: var(--negative);
  animation: shake 0.3s ease;
}
```

#### 3. 결과 오버레이 컬러 분기
**현재:** 수익/손실 무관하게 "다음" 버튼은 항상 `var(--primary)` (초록색)
**변경:**
- 큰 수익(+10만원 이상): 버튼 배경 초록 + 텍스트 "좋아요! 다음 →"
- 큰 손실(-10만원 이하): 버튼 배경 차분한 회색 계열 + 텍스트 "다음 →"
- 마지막 라운드: "결과 보기 →" 텍스트에 강조 스타일 (그라디언트 또는 펄스)
- 결과 팝업 배경에 미세한 색상 힌트 추가 (수익: 초록 글로우, 손실: 빨간 글로우)

```css
.result-popup.positive-result {
  border: 1px solid rgba(16, 185, 129, 0.2);
  box-shadow: 0 0 40px rgba(16, 185, 129, 0.1);
}

.result-popup.negative-result {
  border: 1px solid rgba(239, 68, 68, 0.2);
  box-shadow: 0 0 40px rgba(239, 68, 68, 0.1);
}
```

#### 4. 마지막 라운드 강조
**현재:** 마지막 라운드에 시각적 차별화 없음
**변경:**
- 라운드 배지에 "Final Round!" 텍스트 또는 반짝임 효과
- 프로그레스 바가 거의 다 찬 상태에서 미세 펄스 애니메이션

```typescript
const isFinalRound = gameState.currentRound + 1 === gameConfig.TOTAL_ROUNDS;
```

```css
.round-badge.final-round {
  border: 1px solid var(--primary);
  animation: pulse-subtle 1.5s ease-in-out infinite;
}
```

#### 5. 라운드 진행 도트 개선
**현재:** 8px 도트로 수익/손실만 표시, 현재 라운드 도트에 `scale(1.3)` 적용
**변경:**
- 현재 라운드 도트에 펄스 애니메이션 추가 (더 명확한 "여기 있음" 신호)
- 도트 간 구분선 제거하고 미세 그라데이션으로 연결감 부여는 과도 -> 스킵

```css
.round-dot.current {
  transform: scale(1.5);
  animation: dot-pulse 1.2s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%, 100% { opacity: 1; transform: scale(1.5); }
  50% { opacity: 0.6; transform: scale(1.2); }
}
```

### User Flow
1. 사용자가 질문 카드를 읽음
2. **개선:** 확률 바가 더 크게 보여 리스크/리워드 직관적 비교
3. 선택지 A 또는 B 탭
4. 결과 오버레이 표시 — **개선:** 수익/손실에 따른 컬러 피드백
5. "다음" 버튼 탭
6. **개선:** 잔액이 색상 변화와 함께 갱신
7. 다음 질문 표시 — **개선:** 마지막 라운드에서 강조 표시
8. 최종 라운드 완료 → 결과 페이지로 이동

### Scope (MoSCoW)

**Must:**
- 확률 바 높이 증가 (8px -> 20px) + 가독성 개선
- 잔액 변동 시 색상 피드백 (수익: 초록, 손실: 빨강, 300ms transition)
- 결과 오버레이에 수익/손실 컬러 분기 (팝업 배경 글로우)
- 기존 기능/테스트 100% 유지

**Should:**
- 마지막 라운드 시각적 강조 (라운드 배지 + 결과 보기 버튼)
- 현재 라운드 도트 펄스 애니메이션 개선
- "다음" 버튼 텍스트 조건 분기 (큰 수익 시 리액션 포함)

**Could:**
- 선택지 카드에 hover 시 확률 바 하이라이트 효과
- 결과 팝업에서 잔액 변화를 숫자 카운트업 애니메이션으로 표시
- 선택 시 카드 "선택됨" 애니메이션 (0.2초 scale bounce)

**Won't (this cycle):**
- 선택지 레이아웃 변경 (세로 → 가로 병렬 비교)
- GamePage 컴포넌트 분리/리팩토링
- 새로운 게임 메카닉 추가
- CSS를 Tailwind로 마이그레이션

## Acceptance Criteria

### 확률 바
- [ ] Given 선택지 카드, When 확률 바 렌더, Then 높이가 20px 이상이고 확률 텍스트가 바 근처에 위치
- [ ] Given 확률 70%와 30% 결과, When 두 바가 나란히 표시, Then 크기 차이가 한눈에 식별 가능

### 잔액 피드백
- [ ] Given 수익이 발생한 라운드 이후, When 다음 라운드 시작, Then 잔액 텍스트가 잠시 초록색으로 변경 후 복귀
- [ ] Given 손실이 발생한 라운드 이후, When 다음 라운드 시작, Then 잔액 텍스트가 잠시 빨간색으로 변경 후 복귀
- [ ] Given 잔액 변동 없음 (0원 결과), When 다음 라운드, Then 잔액 색상 변경 없음

### 결과 오버레이
- [ ] Given 수익 결과, When 결과 팝업 표시, Then 팝업에 초록 계열 글로우/보더 적용
- [ ] Given 손실 결과, When 결과 팝업 표시, Then 팝업에 빨간 계열 글로우/보더 적용

### 마지막 라운드 (Should)
- [ ] Given 10라운드 중 10번째, When 질문 표시, Then 라운드 배지에 강조 스타일 적용
- [ ] Given 10라운드 결과 확인, When "결과 보기" 버튼 표시, Then 버튼에 차별화된 스타일 적용

### 회귀 방지
- [ ] Given 변경된 GamePage, When `npm run test`, Then 모든 기존 테스트 PASS
- [ ] Given 변경된 CSS, When `npm run build`, Then 빌드 성공
- [ ] Given 변경된 코드, When `npm run typecheck`, Then 타입 에러 0개

## Task Breakdown

1. **확률 바 CSS 개선** — S — Deps: none
   - `.probability-bar-container` 높이 8px -> 20px
   - `.probability-bar`에 border-radius 조정
   - `.probability-text` 위치/크기 조정 (바 끝 또는 인라인)
   - 파일: `src/styles/global.css` (확률 바 관련 섹션)

2. **잔액 변동 피드백** — M — Deps: none
   - GamePage에 `prevBalance` ref + 변동 감지 로직 추가
   - `balance-increase` / `balance-decrease` CSS 클래스 추가
   - 300ms 후 클래스 제거하는 useEffect 또는 CSS animation으로 자동 복귀
   - 파일: `src/presentation/pages/GamePage.tsx`, `src/styles/global.css`

3. **결과 오버레이 컬러 분기** — S — Deps: none
   - `.result-popup`에 `positive-result` / `negative-result` 조건부 클래스
   - 수익/손실에 따른 box-shadow + border 색상
   - 파일: `src/presentation/pages/GamePage.tsx` (JSX className 조건), `src/styles/global.css`

4. **마지막 라운드 강조** — S — Deps: none
   - `isFinalRound` 변수 도출
   - `.round-badge.final-round` 스타일 추가
   - "결과 보기" 버튼 차별화 스타일 (그라디언트 배경 또는 펄스)
   - 파일: `src/presentation/pages/GamePage.tsx`, `src/styles/global.css`

5. **라운드 도트 애니메이션 개선** — S — Deps: none
   - `.round-dot.current`에 펄스 keyframe 추가
   - 기존 `scale(1.3)` -> `scale(1.5)` + 펄스
   - 파일: `src/styles/global.css`

6. **통합 테스트 + 빌드 검증** — S — Deps: [1-5]
   - `npm run typecheck && npm run lint && npm run build && npm run test`
   - 모바일(375px) 시각 확인: 확률 바, 잔액 표시, 결과 오버레이
   - 파일: 없음 (검증만)

## 변경 범위 요약

| 파일 | 변경 내용 | 크기 |
|------|-----------|------|
| `src/styles/global.css` | 확률 바 높이, 잔액 피드백 클래스, 결과 오버레이 컬러, 마지막 라운드, 도트 펄스 | ~60줄 추가/수정 |
| `src/presentation/pages/GamePage.tsx` | 잔액 변동 감지 로직, 조건부 className 3~4개 | ~20줄 추가 |

**총 예상 변경량:** CSS ~60줄 + TSX ~20줄 = ~80줄. GamePage가 275줄에서 ~295줄로 소폭 증가하지만 150줄 기준 내에서 관리 가능 범위.

## Open Questions
- **확률 바 내부 텍스트:** 바 높이 20px에 텍스트를 인라인으로 넣으면 가독성이 떨어질 수 있다. 바 높이를 더 키우거나(24px) 텍스트는 바 옆에 유지할지는 구현 시 시각적으로 판단.
- **잔액 피드백 지속 시간:** 300ms vs 500ms — 너무 짧으면 인지 못하고, 너무 길면 방해. 구현 후 실제 테스트로 결정.

## Out of Scope
- **선택지 레이아웃 변경:** 현재 세로 스택(A → VS → B)을 가로 병렬로 바꾸는 것은 모바일 화면 폭 제약으로 리스크가 큼. 별도 Feature로 검토.
- **GamePage 리팩토링:** 275줄로 가이드라인 내. 분리 불필요.
- **useGame 훅 변경:** 게임 로직은 변경하지 않음. 순수 UX/CSS 개선만.
- **사운드/햅틱 피드백:** 브라우저 호환성 이슈로 이번 스코프에서 제외.
- **결과 카운트업 애니메이션:** Could 항목이나, 구현 복잡도 대비 효과가 불확실하므로 시간 남으면 시도.

---

*작성: PM Agent | Cycle 2 | 2026-02-17*
