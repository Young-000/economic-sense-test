# ResultPage 리팩토링

## JTBD
게임을 완료한 사용자가 결과 페이지에서 **핵심 결과(티어/점수)를 즉시 파악**하고, **관심 있는 상세 정보만 선택적으로 탐색**할 수 있어야 한다. 현재 902줄 단일 컴포넌트에 16개 상태 변수가 혼재되어, 유지보수와 테스트가 극도로 어렵고 정보 위계가 불명확하다.

## Problem
- **Who:** 게임을 완료한 모든 사용자 (100%)
- **Pain:** 높음 (모든 결과 조회 세션에 영향)
  - 902줄 단일 컴포넌트: 150줄 가이드라인의 6배
  - 16개 useState: 랭킹, 공유, 업적, 도전 상태가 하나의 컴포넌트에 혼재
  - 12개 이벤트 핸들러: 공유 관련만 6개 (텍스트/카카오/트위터/인스타/이미지생성/다운로드)
  - 정보 위계 부재: 17개 UI 섹션이 선형으로 나열되어 핵심 결과가 묻힘
- **Current workaround:** 없음. 현재 코드를 직접 수정하는 방식으로 유지보수
- **Success metric:**
  - ResultPage.tsx 본문 150줄 이하 (현재 902줄)
  - 각 서브 컴포넌트 150줄 이하
  - 기존 테스트 38개 전부 통과 (회귀 없음)
  - 컴포넌트당 상태 변수 5개 이하

## Solution

### Overview
ResultPage를 **컨테이너 + 9개 서브 컴포넌트** 구조로 분리한다. ResultPage는 데이터 파싱/라우팅만 담당하고, 각 서브 컴포넌트가 자체 상태와 이벤트 핸들러를 소유한다. 정보 위계는 "핵심 결과(Hero) > 소셜/공유(CTA) > 상세 분석(Deep Dive)" 3단계로 재구성한다.

기능 변경 없이 순수 리팩토링만 수행한다. UI/레이아웃 순서는 현행 유지.

### 컴포넌트 분해 설계

#### 1. ResultPage (컨테이너) — ~120줄
- **역할:** sessionStorage 파싱, 데이터 연산, 에러 처리, 서브 컴포넌트 조합
- **상태:** 없음 (파생 데이터는 useMemo)
- **커스텀 훅:** `useResultData()` — sessionStorage 파싱 + finalResult 계산 + 에러 상태

```typescript
// useResultData 반환 타입
interface UseResultDataReturn {
  finalResult: FinalResult | null;
  gameResults: RoundResult[];
  assetHistory: AssetDataPoint[];
  bestPerformance: BestPerformance | null;
  initialBalance: number;
  gameMode: GameMode;
  error: boolean;
}
```

#### 2. ResultHero — ~60줄
- **역할:** 티어 배지 + 신기록 배지 표시
- **Props:**

```typescript
interface ResultHeroProps {
  tier: TierInfo;
  isNewRecord: boolean;
}
```

- **상태:** 없음 (순수 표시 컴포넌트)

#### 3. InvestorTypeCard — ~30줄
- **역할:** 투자자 유형 이모지 + 이름 + 태그
- **Props:**

```typescript
interface InvestorTypeCardProps {
  profile: InvestorProfile;
}
```

- **상태:** 없음

#### 4. AssetSummaryCard — ~40줄
- **역할:** 최종 자산 + 수익률 + 시작 잔액
- **Props:**

```typescript
interface AssetSummaryCardProps {
  finalBalance: number;
  initialBalance: number;
  totalReturn: number;
}
```

- **상태:** 없음

#### 5. ChallengeBanner — ~70줄
- **역할:** 친구 도전 비교 결과 (조건부 렌더링)
- **Props:**

```typescript
interface ChallengeBannerProps {
  totalReturn: number;
  myProfile: InvestorProfile;
}
```

- **상태:** `challenge: ChallengeData | null` (내부에서 getSavedChallenge 호출)

#### 6. ViralCTASection — ~80줄
- **역할:** 상위 N% 배지, 도전장 링크 복사, 이미지 공유 버튼
- **Props:**

```typescript
interface ViralCTASectionProps {
  finalResult: FinalResult;
  nickname: string;
  onShareImage: () => void;
  isGeneratingImage: boolean;
  challengeActive: boolean;
  challengeReturn?: number;
}
```

- **상태:** `percentile: number | null` (내부에서 getPlayersAboveReturn 호출)

#### 7. RankingSection — ~100줄
- **역할:** 닉네임 입력 + 랭킹 등록 + TOP 10 토글
- **Props:**

```typescript
interface RankingSectionProps {
  finalBalance: number;
  totalReturn: number;
  investorType: InvestorType;
  riskScore: number;
  rationalityScore: number;
  luckScore: number;
  gameResults: RoundResult[];
  initialBalance: number;
  nickname: string;
  onNicknameChange: (name: string) => void;
}
```

- **상태:** `submitted`, `isSubmitting`, `myRank`, `topRankings`, `showRankings`
- **참고:** nickname은 ViralCTASection에서도 사용하므로 부모(ResultPage)에서 관리하고 props로 전달

#### 8. InvestmentAnalysis — ~100줄
- **역할:** 자산 변화 그래프 + 투자자 유형 상세 + 투자 성향 바
- **Props:**

```typescript
interface InvestmentAnalysisProps {
  gameResults: RoundResult[];
  finalBalance: number;
  bestPerformance: AssetDataPoint[] | undefined;
  initialBalance: number;
  investorType: InvestorType;
  profile: InvestorProfile;
  riskScore: number;
  rationalityScore: number;
  luckScore: number;
}
```

- **상태:** 없음 (AssetProgressChart 내부 상태만 있음)

#### 9. AchievementSection — ~50줄
- **역할:** 업적 토글 + 목록 표시
- **Props:**

```typescript
interface AchievementSectionProps {
  finalResult: FinalResult;
  gameResults: RoundResult[];
  initialBalance: number;
  gameMode: GameMode;
}
```

- **상태:** `newAchievements`, `showAchievementPopup`, `showAchievementList`, `achievementStatus`
- **참고:** isNewRecord 판정 로직은 ResultPage 레벨의 useResultData에서 처리

#### 10. ShareModal — ~80줄
- **역할:** 이미지 미리보기 + 플랫폼별 공유 + 다운로드
- **Props:**

```typescript
interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: InvestorProfile;
  finalResult: FinalResult;
}
```

- **상태:** `shareImageUrl`, `shareImageBlob` (내부에서 관리)
- **이벤트 핸들러:** 6개 공유 핸들러 모두 이 컴포넌트 내부로 이동
  - handleShareImageAction, handleDownloadImage
  - handleShareKakao, handleShareTwitter, handleShareInstagram

### 상태 변수 재배치 (Before -> After)

| 현재 위치 (ResultPage) | 이동 대상 | 이유 |
|------------------------|-----------|------|
| nickname, submitted, isSubmitting, myRank, topRankings, showRankings | **RankingSection** (nickname만 ResultPage에서 lift) | 랭킹 전용 상태 |
| isNewRecord | **ResultPage** (useResultData 훅 내부) | Hero에서 사용 + Confetti 조건에 필요 |
| newAchievements, showAchievementPopup, showAchievementList, achievementStatus | **AchievementSection** | 업적 전용 상태 |
| isGeneratingImage | **ResultPage** (공유 플로우 조율) | ViralCTA에서 트리거, ShareModal에서 소비 |
| showShareModal, shareImageUrl, shareImageBlob | **ShareModal** (내부 관리) | 모달 자체가 상태를 소유 |
| percentile | **ViralCTASection** | 상위 N% 전용 |
| challenge | **ChallengeBanner** | 도전 데이터 전용 |

### 커스텀 훅: useResultData

```typescript
interface UseResultDataReturn {
  finalResult: FinalResult | null;
  gameResults: RoundResult[];
  assetHistory: AssetDataPoint[];
  bestPerformance: BestPerformance | null;
  initialBalance: number;
  gameMode: GameMode;
  isNewRecord: boolean;
}

function useResultData(): UseResultDataReturn {
  // sessionStorage 파싱 (기존 useMemo 로직)
  // updateBestPerformance 호출 + isNewRecord 판정
  // 에러 시 모든 필드 null/기본값 반환
}
```

### User Flow
1. 사용자가 `/result` 진입
2. `useResultData`가 sessionStorage 파싱 → 에러 시 에러 화면
3. ResultPage가 데이터를 서브 컴포넌트에 props로 분배
4. 각 서브 컴포넌트가 자체 상태를 독립적으로 관리
5. 공유 플로우: ViralCTA -> ShareModal 열기 -> 플랫폼 선택 -> 공유/다운로드

### Scope (MoSCoW)

**Must:**
- ResultPage를 9개 서브 컴포넌트로 분리
- `useResultData` 커스텀 훅 추출
- 16개 상태 변수를 각 컴포넌트로 재배치
- 12개 이벤트 핸들러를 해당 컴포넌트로 이동
- 닉네임 유효성 검사 로직(`validateNickname`)을 유틸리티로 추출
- 기존 기능 100% 유지 (UI/동작 변경 없음)
- 기존 테스트 전부 통과

**Should:**
- 각 서브 컴포넌트에 대한 단위 테스트 추가 (최소 ResultHero, RankingSection, ShareModal)
- Props 인터페이스를 별도 types.ts에 정리
- `investorDetails` inline 렌더링을 InvestmentAnalysis로 깔끔하게 캡슐화

**Could:**
- PD Issue #1 반영: 모드 피드백을 ResultPage 내에서 자연스럽게 표시 (모드별 차별화된 Hero 스타일) — 단, 리팩토링 범위를 넘어서면 제외
- luckLabel 계산 로직을 도메인 유틸리티로 추출
- returnClassName 계산 로직을 도메인 유틸리티로 추출

**Won't (this cycle):**
- CSS 리팩토링 (global.css 3,198줄 분리는 별도 Cycle)
- Tailwind 마이그레이션
- 정보 위계 레이아웃 변경 (순서 재배치)
- 새 기능 추가

## Acceptance Criteria

### 컴포넌트 분리
- [ ] Given ResultPage.tsx, When 리팩토링 완료, Then ResultPage 본문이 150줄 이하
- [ ] Given 9개 서브 컴포넌트, When 각각 확인, Then 모두 150줄 이하
- [ ] Given ResultPage, When 상태 변수 카운트, Then ResultPage 본문에 useState 3개 이하 (nickname, isGeneratingImage, shareModalOpen)

### 기능 보존
- [ ] Given 유효한 게임 결과, When ResultPage 렌더, Then 티어 배지/투자자 유형/최종 자산/수익률이 모두 표시
- [ ] Given 닉네임 입력 후 등록 버튼 클릭, When 랭킹 등록, Then 순위가 표시되고 TOP 10에 반영
- [ ] Given 이미지 공유 버튼 클릭, When 이미지 생성 완료, Then 공유 모달에 미리보기 + 플랫폼별 공유 버튼 표시
- [ ] Given 텍스트 공유 버튼 클릭, When navigator.share 미지원, Then 클립보드에 복사 + alert 표시
- [ ] Given 친구 도전 URL로 진입, When 결과 표시, Then VS 비교 카드가 정상 렌더링
- [ ] Given 신기록 달성, When 결과 페이지 진입, Then 컨페티 + 신기록 배지 표시
- [ ] Given 업적 해금, When 결과 페이지 진입, Then 업적 팝업 자동 표시

### 테스트
- [ ] Given 기존 ResultPage.test.tsx, When `npm run test`, Then 38개 테스트 전부 PASS
- [ ] Given 리팩토링된 코드, When `npm run typecheck`, Then 타입 에러 0개
- [ ] Given 리팩토링된 코드, When `npm run build`, Then 빌드 성공

### 커스텀 훅
- [ ] Given useResultData 훅, When sessionStorage에 유효한 데이터, Then finalResult 반환
- [ ] Given useResultData 훅, When sessionStorage 비어있음, Then finalResult null 반환 + 에러 화면

## Task Breakdown

1. **`useResultData` 커스텀 훅 추출** — M — Deps: none
   - sessionStorage 파싱 useMemo 로직 이동
   - updateBestPerformance + isNewRecord 판정
   - 에러 처리 로직 포함
   - 파일: `src/presentation/hooks/useResultData.ts`

2. **ResultHero 컴포넌트 추출** — S — Deps: none
   - 티어 배지 히어로 + 신기록 배지 분리
   - 파일: `src/presentation/components/result/ResultHero.tsx`

3. **InvestorTypeCard + AssetSummaryCard 추출** — S — Deps: none
   - 순수 표시 컴포넌트 2개 분리
   - 파일: `src/presentation/components/result/InvestorTypeCard.tsx`, `AssetSummaryCard.tsx`

4. **ChallengeBanner 추출** — S — Deps: none
   - challenge 상태 + compareResults + clearSavedChallenge 로직 내부화
   - 파일: `src/presentation/components/result/ChallengeBanner.tsx`

5. **ViralCTASection 추출** — M — Deps: none
   - percentile 상태 + 도전장 복사 로직 내부화
   - 파일: `src/presentation/components/result/ViralCTASection.tsx`

6. **RankingSection 추출** — M — Deps: none
   - 닉네임 입력 + 제출 + TOP 10 토글 + validateNickname 포함
   - 5개 상태 변수 이동
   - 파일: `src/presentation/components/result/RankingSection.tsx`

7. **InvestmentAnalysis 추출** — M — Deps: none
   - AssetProgressChart + 투자자 상세 + 성향 분석 바 통합
   - investorDetails inline IIFE 제거, 깔끔한 구조로 변환
   - 파일: `src/presentation/components/result/InvestmentAnalysis.tsx`

8. **AchievementSection 추출** — S — Deps: none
   - 업적 체크 + 팝업 + 토글 상태 4개 내부화
   - 파일: `src/presentation/components/result/AchievementSection.tsx`

9. **ShareModal 추출** — M — Deps: none
   - 이미지 생성/공유/다운로드 + 플랫폼별 공유 핸들러 6개 이동
   - elementToBlob 호출 + shareImageRef 내부화
   - 파일: `src/presentation/components/result/ShareModal.tsx`

10. **ResultPage 재조합 + 통합 테스트** — M — Deps: [1-9]
    - ResultPage에서 서브 컴포넌트 조합
    - barrel export (index.ts)
    - 기존 테스트 실행 + 회귀 확인
    - `npm run typecheck && npm run lint && npm run build && npm run test`

11. **서브 컴포넌트 단위 테스트 추가 (Should)** — M — Deps: [10]
    - ResultHero: 티어별 렌더링, 신기록 배지 조건부
    - RankingSection: 닉네임 유효성, 제출 플로우, 토글
    - ShareModal: 모달 열기/닫기, 플랫폼별 공유

## 파일 구조 (최종)

```
src/presentation/
  hooks/
    useResultData.ts          (NEW)
    useGame.ts                (기존)
  components/
    result/                   (NEW 디렉토리)
      index.ts                (barrel export)
      ResultHero.tsx
      InvestorTypeCard.tsx
      AssetSummaryCard.tsx
      ChallengeBanner.tsx
      ViralCTASection.tsx
      RankingSection.tsx
      InvestmentAnalysis.tsx
      AchievementSection.tsx
      ShareModal.tsx
    ShareImageCard.tsx        (기존 유지)
    AssetProgressChart.tsx    (기존 유지)
    ...
  pages/
    ResultPage.tsx            (150줄 이하로 축소)
    __tests__/
      ResultPage.test.tsx     (기존 유지, 회귀 확인)
```

## Open Questions
- **nickname 상태 위치:** RankingSection 내부 vs ResultPage에서 lift-up. ViralCTASection의 도전장 복사에서 nickname을 사용하므로 lift-up이 필요하다. 다만 이 의존성이 약하면(nickname optional) 내부화도 가능.
  - **결정: ResultPage에서 관리하고 양쪽에 props 전달.** 닉네임 미입력 시 도전장에서 이름 생략되는 것이 현재 동작이므로 optional로 처리.

## Out of Scope
- **CSS 분리:** global.css의 result 관련 스타일을 컴포넌트별 CSS 파일로 분리하는 것은 Tailwind 마이그레이션과 함께 진행 (Cycle 4+)
- **정보 위계 변경:** 섹션 순서 재배치, 접기/펼치기 UI 추가 등은 별도 UX 개선 Feature
- **새 기능 추가:** 그 어떤 새 기능도 이 리팩토링 범위에 포함하지 않음
- **ShareImageCard 리팩토링:** 오프스크린 렌더링 카드는 현행 유지
- **Confetti/NewAchievementsPopup:** 이미 별도 컴포넌트이므로 변경 없음

---

*작성: PM Agent | Cycle 2 | 2026-02-17*
