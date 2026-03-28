# Feature: intro-redesign
> Cycle 1 | Feature 2 | IntroPage 디자인 리뉴얼

---

## JTBD

When 처음 돈 감각 테스트 페이지를 열었을 때, I want to 3초 안에 "이게 뭔지" 이해하고 바로 시작하고 싶다, so I can 복잡한 설명 없이 빠르게 게임을 즐길 수 있다.

---

## Problem

- **Who:** 링크를 클릭해 처음 방문한 사용자 (SNS/카카오톡 공유 유입)
- **Pain:** 현재 IntroPage에서 CTA(시작 버튼)에 도달하기까지 7개 섹션을 지나야 함. 모바일(375px)에서 시작 버튼이 스크롤 없이 보이지 않을 가능성 높음. 정보 과부하로 "뭘 눌러야 하지?" 혼란 발생. (빈도: 모든 첫 방문자)
- **Current workaround:** 없음. 이해 못 하면 이탈.
- **Success metric:** IntroPage -> GamePage 전환율 개선 (현재 측정 불가이므로, UX 품질 기준으로 판단)

### 현재 IntroPage의 구체적 문제

1. **정보 위계 부재**: 시즌 배너, 소셜 증거, 배지, 제목, 모드 선택, CTA, 특징, 면책 — 모두 비슷한 시각적 무게
2. **CTA 매몰**: 시작 버튼이 화면 중간에 위치. 모바일에서 fold 아래로 밀릴 수 있음
3. **가짜 소셜 증거**: `SOCIAL_PROOF_MESSAGES` 배열이 하드코딩된 거짓 실시간 데이터 (`방금 누군가 "금손 전략가" 획득!`, `지금 3명이 테스트 중...`). 사용자 신뢰를 떨어뜨림
4. **시즌 배너 강제 노출**: 일반 시즌(봄/여름/가을/겨울)에도 항상 표시되어 화면 공간 낭비
5. **모드 선택의 인지 부하**: 첫 방문자에게 "일반" vs "극한" 선택을 강제하면 결정 마비(decision paralysis) 발생 가능

---

## Solution

### Overview

IntroPage를 **"3초 안에 시작"** 원칙으로 재설계한다. 핵심 메시지(무슨 게임인지)와 CTA(시작 버튼)를 최상단에 배치하고, 부가 정보는 CTA 아래로 내려 관심 있는 사용자만 볼 수 있게 한다.

### 디자인 원칙

1. **CTA First**: 시작 버튼이 모바일 375px에서 스크롤 없이 보여야 함
2. **Progressive Disclosure**: 핵심 정보 -> 부가 정보 순서로 배치
3. **Honest Social Proof**: 하드코딩된 가짜 데이터 제거, 실제 데이터만 표시
4. **One Primary Action**: 시작 버튼 하나에 집중 (모드 선택은 보조적)

### User Flow

```
사용자가 링크 클릭 (SNS/카카오톡)
    ↓
IntroPage 로딩 (< 2초)
    ↓
[Fold 위: 즉시 보이는 영역]
  - 히어로: 제목 + 한 줄 설명 + CTA 버튼
    ↓
사용자 클릭 → GamePage 이동 (기본: 일반 모드)
    ↓
[또는 스크롤 → Fold 아래]
  - 모드 선택 (일반/극한)
  - 게임 특징 3개
  - 참여자 수 (실제 데이터)
  - 친구 도전 배너 (조건부)
```

### 신규 레이아웃 설계

**Fold 위 (모바일 375px, 스크롤 없이 보이는 영역):**

```
┌─────────────────────────┐
│                         │
│  [친구 도전 배너]        │  ← 조건부: challenge URL로 진입했을 때만
│                         │
│        💸               │  ← 대형 이모지 (hero)
│   돈 감각 테스트         │  ← 제목 (32px, 그라디언트)
│                         │
│  1,000만원 받았다.       │  ← 부제목
│  10번 선택 후 얼마 남을까? │
│                         │
│  [  돈 불려보기  ]       │  ← Primary CTA (가장 큰 버튼)
│                         │
│  당신은 금손? 흙손? 🤔   │  ← 훅 문구
│                         │
└─────────────────────────┘
```

**Fold 아래 (스크롤 후):**

```
┌─────────────────────────┐
│                         │
│  [일반 모드] [극한 모드]  │  ← 모드 전환 (선택 시 CTA 텍스트 변경)
│                         │
│  🎲 진짜 확률로 결과 결정 │  ← 특징 리스트 (간소화)
│  🧠 투자 성향 분석       │
│  🔥 친구랑 수익률 배틀   │
│                         │
│  🔥 N명이 참여했어요     │  ← 실제 총 참여자 수 (소셜 증거)
│                         │
│  * 실제 돈이 아닙니다.   │  ← 면책
│                         │
│  [광고 배너]             │  ← AdSense
│                         │
└─────────────────────────┘
```

### 제거되는 요소

| 요소 | 이유 |
|------|------|
| 시즌/이벤트 배너 | 일반 시즌에는 정보 가치 없음. 특별 이벤트 때만 조건부 표시 |
| 소셜 증거 실시간 메시지 | 하드코딩된 가짜 데이터. 신뢰도 저하 |
| 오늘 1위 표시 | 첫 방문자에게 불필요한 정보 |
| "MZ 필수 테스트" 배지 | 자기 자랑형 배지는 사용자에게 가치 없음 |
| SOCIAL_PROOF_MESSAGES 상수 | 가짜 실시간 알림 데이터 |
| live-dot 애니메이션 | 가짜 "LIVE" 인디케이터 |

### 유지되는 요소

| 요소 | 위치 변경 |
|------|----------|
| 제목 + 부제목 | 최상단으로 이동 (현재보다 위) |
| 시작 버튼 (CTA) | 제목 바로 아래로 이동 (fold 위 보장) |
| 훅 문구 ("금손? 흙손?") | CTA 바로 아래 |
| 모드 선택 | fold 아래로 이동 (기본값: 일반 모드) |
| 특징 리스트 | fold 아래로 이동 |
| 총 참여자 수 | 유지 (실제 DB 데이터, 소셜 증거) |
| 친구 도전 배너 | 조건부 유지 (challenge URL 진입 시) |
| 면책 고지 | 하단 유지 |
| AdSense 배너 | 최하단 유지 |

### 변경되는 요소

| 요소 | 현재 | 변경 후 |
|------|------|--------|
| 시즌 배너 | 항상 표시 | 특별 이벤트(`isSpecialEvent === true`)일 때만 표시 |
| 소셜 증거 | 가짜 실시간 + 참여자 + 1위 | 참여자 수만 (한 줄, fold 아래) |
| CTA 위치 | 화면 중간 | fold 위 상단 |
| 모드 선택 위치 | CTA 위 (시작 전 강제 선택) | CTA 아래 (시작 후 옵션) |

### 모드 선택 UX 변경

현재: 모드 선택 -> 시작 버튼 (순차적)
변경: 시작 버튼 (기본: 일반 모드) + 모드 선택은 아래에서 변경 가능

모드를 변경하면:
- CTA 버튼 텍스트가 변경됨 (`돈 불려보기` -> `극한 도전!`)
- 부제목의 금액이 변경됨 (`1,000만원` -> `5,000만원`)
- CTA 버튼 스타일이 변경됨 (green -> red pulse)

이렇게 하면 첫 방문자는 모드 선택 고민 없이 바로 시작하고, 재방문자나 관심 있는 사용자만 극한 모드를 탐색한다.

---

## Scope (MoSCoW)

**Must:**
- [ ] CTA 버튼이 모바일 375px에서 스크롤 없이 보여야 함
- [ ] 히어로 영역: 제목 + 부제목 + CTA를 fold 위에 배치
- [ ] 하드코딩된 `SOCIAL_PROOF_MESSAGES` 제거
- [ ] 가짜 실시간 소셜 증거 (live-dot, live-message) 제거
- [ ] 모드 선택을 CTA 아래로 이동
- [ ] 기존 기능 유지 (모드 선택, 친구 도전, 참여자 수)
- [ ] 모바일 반응형 (375px, 768px, 1920px)
- [ ] 빌드/타입체크 통과

**Should:**
- [ ] 시즌 배너를 특별 이벤트 시에만 조건부 표시
- [ ] "MZ 필수 테스트" 배지 제거
- [ ] "오늘 1위" 표시 제거 (fold 아래에서도 불필요)
- [ ] `getTodayTopPlayer()` 호출 제거 (불필요한 API 호출 감소)
- [ ] 관련 CSS 정리 (제거된 요소의 스타일 삭제)

**Could:**
- [ ] 스크롤 힌트 애니메이션 (fold 아래에 더 많은 정보가 있음을 암시)
- [ ] CTA 버튼에 간단한 마이크로 인터랙션 (hover/active 피드백 개선)
- [ ] 참여자 수 표시를 CTA 근처에 작게 배치 ("N명이 도전했어요")

**Won't (this cycle):**
- [ ] Tailwind CSS 도입 (기존 CSS 패턴 유지)
- [ ] 새로운 일러스트/이미지 에셋 추가
- [ ] A/B 테스트 인프라 구축
- [ ] Google Analytics 이벤트 트래킹 추가
- [ ] 친구 도전 배너 디자인 변경 (기존 유지)
- [ ] AdSense 배너 위치 변경

---

## Acceptance Criteria

- [ ] **AC1:** Given 모바일 뷰포트(375px)에서, When IntroPage를 로드하면, Then 시작 버튼("돈 불려보기")이 스크롤 없이 화면에 보인다.

- [ ] **AC2:** Given IntroPage를 로드했을 때, When 소스 코드를 확인하면, Then `SOCIAL_PROOF_MESSAGES` 배열과 관련 로직(4초 간격 롤링)이 제거되어 있다.

- [ ] **AC3:** Given 모드를 변경하지 않은 상태에서, When "돈 불려보기" 버튼을 클릭하면, Then `/game?mode=normal`로 이동한다. (기본값: 일반 모드)

- [ ] **AC4:** Given 스크롤하여 모드 선택 영역이 보이는 상태에서, When "극한 모드"를 선택하면, Then CTA 버튼 텍스트가 "극한 도전!"으로 변경되고, 부제목의 금액이 "5,000만원"으로 변경된다.

- [ ] **AC5:** Given challenge URL 파라미터가 있는 상태에서, When IntroPage를 로드하면, Then 친구 도전 배너가 히어로 영역 위에 표시된다.

- [ ] **AC6:** Given challenge URL 파라미터가 없는 상태에서, When IntroPage를 로드하면, Then 친구 도전 배너가 표시되지 않는다.

- [ ] **AC7:** Given 특별 이벤트 기간이 아닌 때, When IntroPage를 로드하면, Then 시즌 배너가 표시되지 않는다.

- [ ] **AC8:** Given 정리가 완료되었을 때, When `npm run build && npm run typecheck`를 실행하면, Then 에러 없이 성공한다.

- [ ] **AC9:** Given 데스크톱(1920px)에서, When IntroPage를 로드하면, Then 콘텐츠가 중앙 정렬되어 있고 과도하게 넓게 펼쳐지지 않는다. (max-width 유지)

- [ ] **AC10:** Given 총 참여자 수가 DB에서 로드되었을 때, When IntroPage를 확인하면, Then fold 아래에 실제 참여자 수가 표시된다. (가짜 데이터 아님)

---

## Task Breakdown

1. **IntroPage 레이아웃 재구조화** — Complexity: M — Deps: none
   - JSX 요소 순서 재배치
   - 히어로 영역 (제목 + 부제 + CTA) 최상단 배치
   - 모드 선택을 CTA 아래로 이동

2. **소셜 증거 정리** — Complexity: S — Deps: none
   - `SOCIAL_PROOF_MESSAGES` 상수 제거
   - 소셜 증거 롤링 `useEffect` 제거
   - `socialMessage` 상태 변수 제거
   - `getTodayTopPlayer` 호출 제거 및 관련 상태(`todayTop`) 제거
   - 총 참여자 수만 유지 (fold 아래 간소화)

3. **시즌 배너 조건부 표시** — Complexity: S — Deps: none
   - `seasonInfo.isSpecialEvent`가 true일 때만 배너 렌더링
   - 일반 시즌에서는 배너 미표시

4. **CTA 영역 fold 위 보장** — Complexity: S — Deps: [1]
   - 모바일 375px에서 CTA가 스크롤 없이 보이도록 padding/margin 조정
   - 히어로 영역의 불필요한 요소 제거로 공간 확보
   - "MZ 필수 테스트" 배지 제거

5. **CSS 정리** — Complexity: M — Deps: [1, 2, 3]
   - 제거된 요소의 CSS 삭제 (`.social-proof-banner`, `.social-proof-live`, `.live-dot`, `.live-message`, `.intro-badge`, `.today-top` 등)
   - 새로운 레이아웃에 맞는 spacing 조정
   - fold 위 영역 CSS 최적화

6. **빌드/타입 검증** — Complexity: S — Deps: [1, 2, 3, 4, 5]
   - `npm run typecheck && npm run lint && npm run build`
   - 기존 E2E/단위 테스트 통과 확인

7. **뷰포트별 시각 검증** — Complexity: S — Deps: [6]
   - 375px (모바일), 768px (태블릿), 1920px (데스크톱) 확인
   - CTA fold 위 노출 확인

---

## Technical Approach

### 컴포넌트 변경 범위

**수정 파일:**
- `src/presentation/pages/IntroPage.tsx` — JSX 구조 재배치, 소셜 증거 정리
- `src/styles/global.css` — Intro 섹션 CSS 수정/삭제

**미수정 파일:**
- `src/lib/seasonUtils.ts` — 기존 로직 유지 (시즌 판단은 그대로)
- `src/data/rankingService.ts` — `getTotalPlayers()` 유지, `getTodayTopPlayer()` 호출만 IntroPage에서 제거
- `src/lib/challengeUtils.ts` — 변경 없음

### CSS 전략

- 기존 CSS 변수 시스템 유지 (`--primary`, `--bg`, `--card` 등)
- Tailwind 미도입 (이번 Cycle은 기존 CSS 패턴 유지)
- 제거되는 클래스만 삭제, 새 클래스 최소한 추가
- 반응형은 기존 `max-width: 340px` 패턴 유지

### 상태 관리 변경

**제거되는 상태:**
- `socialMessage` (소셜 증거 롤링 메시지)
- `todayTop` (오늘 1위 데이터)

**유지되는 상태:**
- `selectedMode` (모드 선택)
- `totalPlayers` (총 참여자 수)
- `challenge` (친구 도전 데이터)

**제거되는 useEffect:**
- 소셜 증거 메시지 롤링 interval (4초)

**유지되는 useEffect:**
- 소셜 증거 데이터 로드 (단, `getTodayTopPlayer` 호출만 제거)

---

## Open Questions

1. **참여자 수 0명일 때**: DB에 데이터가 없으면 어떻게 표시? 현재 로직은 0이면 '1,234'로 하드코딩. 이 부분도 정리할지?
   - **제안**: 0이면 참여자 수 자체를 숨기는 게 정직함. 또는 최소값 표시를 유지하되 주석으로 명확히.

2. **극한 모드 선택 시 CTA 변경의 시각적 피드백**: 모드를 변경하면 CTA 텍스트/스타일이 바뀌는데, fold 위에 있는 CTA에 변경이 반영되어야 함. 스크롤 위치와 관계없이 CTA가 업데이트 되는 건 이미 React 상태로 처리되니 문제 없을 것.

---

## Out of Scope

- **Tailwind CSS 도입**: 이번 리디자인은 기존 CSS 패턴으로 진행. Tailwind는 전체 마이그레이션 Feature에서 별도 진행.
- **새로운 이미지/일러스트 에셋**: 이모지만 사용. 커스텀 에셋 제작은 하지 않음.
- **A/B 테스트 인프라**: 기존 `useABTest` 훅이 있지만, 이번에는 하나의 디자인으로 확정.
- **GamePage/ResultPage 변경**: 이 Feature는 IntroPage만 다룸.
- **Analytics 이벤트 트래킹**: GA4 미설정 상태이므로 별도 Feature에서.
- **AdSense 배너 위치/디자인 변경**: 현재 위치 유지.
- **새로운 애니메이션 추가**: 기존 애니메이션 유지 또는 간소화만.

---

## 참고: 현재 IntroPage 요소 순서 vs 변경 후

### 현재 (위 → 아래)
1. 시즌 배너 (항상)
2. 친구 도전 배너 (조건부)
3. 소셜 증거 (참여자 + 1위 + 실시간)
4. "MZ 필수 테스트" 배지
5. 제목
6. 부제목
7. 모드 선택
8. **CTA 버튼** ← 여기에 도달하기까지 7개 요소
9. 훅 문구
10. 특징 3개
11. 면책
12. AdSense

### 변경 후 (위 → 아래)
1. 친구 도전 배너 (조건부) ← challenge URL 진입 시만
2. 시즌 배너 (특별 이벤트 시만) ← 대부분의 기간에는 미표시
3. 제목
4. 부제목
5. **CTA 버튼** ← 3~4번째 요소, fold 위 보장
6. 훅 문구
7. 모드 선택
8. 특징 3개
9. 참여자 수 (실제 데이터, 한 줄)
10. 면책
11. AdSense

**핵심 변화: CTA까지 도달하는 요소 수 7개 -> 3~4개로 감소**

---

*작성: PM Agent | 2026-02-17*
