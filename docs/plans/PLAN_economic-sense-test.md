# Implementation Plan: 경제감각 테스트 (Economic Sense Test)

**Status**: 🔄 In Progress
**Started**: 2026-01-04
**Last Updated**: 2026-01-04
**Architecture**: Clean Architecture + TDD

---

**⚠️ CRITICAL INSTRUCTIONS**: After completing each phase:
1. ✅ Check off completed task checkboxes
2. 🧪 Run all quality gate validation commands
3. ⚠️ Verify ALL quality gate items pass
4. 📅 Update "Last Updated" date above
5. 📝 Document learnings in Notes section
6. ➡️ Only then proceed to next phase

⛔ **DO NOT skip quality gates or proceed with failing checks**

---

## 📋 Overview

### Feature Description
Apps in Toss 미니앱으로 구현하는 행동경제학 기반 경제감각 테스트. 10개 질문을 통해 사용자의 4가지 경제 심리 지표를 측정하고, 16가지 MBTI 스타일 캐릭터 유형과 함께 결과를 제공한다.

### Success Criteria
- [ ] 10개 질문이 순차적으로 표시됨
- [ ] 4개 지표(위험회피, 손실회피, 시간할인, 확률가중)가 정확히 계산됨
- [ ] 16가지 캐릭터 유형 중 하나로 분류됨
- [ ] 결과 화면에 수치 + 캐릭터 유형이 표시됨
- [ ] 결과 공유 기능 동작
- [ ] Domain 로직 테스트 커버리지 ≥90%

### User Impact
토스 사용자가 자신의 경제적 의사결정 성향을 재미있게 파악하고, 결과를 공유하며 바이럴 효과 창출.

---

## 🏗️ Clean Architecture 구조

```
src/
├── domain/                    # Layer 1: 핵심 비즈니스 로직 (의존성 없음)
│   ├── entities/
│   │   ├── Question.ts        # 질문 엔티티
│   │   ├── Answer.ts          # 답변 엔티티
│   │   ├── Result.ts          # 결과 엔티티
│   │   └── CharacterType.ts   # 캐릭터 유형 엔티티
│   ├── usecases/
│   │   ├── calculateScores.ts # 4개 지표 점수 계산
│   │   └── determineType.ts   # 16유형 결정 로직
│   └── __tests__/             # Domain 테스트
│
├── data/                      # Layer 2: 데이터 레이어
│   ├── questions.ts           # 10개 질문 데이터
│   ├── characters.ts          # 16개 캐릭터 데이터
│   └── __tests__/             # Data 테스트
│
└── presentation/              # Layer 3: UI 레이어
    ├── pages/
    │   ├── IntroPage.tsx
    │   ├── TestPage.tsx
    │   └── ResultPage.tsx
    ├── components/
    │   ├── QuestionCard.tsx
    │   ├── ProgressBar.tsx
    │   ├── ResultCard.tsx
    │   └── ShareButton.tsx
    ├── hooks/
    │   └── useTest.ts         # 테스트 상태 관리
    └── __tests__/             # UI 테스트
```

### 의존성 방향 (Clean Architecture 원칙)

```
Presentation → Data → Domain
     ↓          ↓        ↓
   (UI)     (데이터)   (순수 로직)
                         ↑
                    의존성 없음
```

---

## 🏗️ Architecture Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| Clean Architecture | 테스트 용이성, 유지보수성 | 초기 구조 복잡도 |
| Domain 레이어 순수 함수 | 100% 테스트 가능, 재사용성 | 없음 |
| TDD (Red-Green-Refactor) | 품질 보장, 리팩토링 안전성 | 초기 개발 속도 |
| TDS 사용 | 토스 UX 일관성 | 학습 곡선 |

---

## 📦 Dependencies

### Required Before Starting
- [ ] Node.js 18+ 설치
- [ ] pnpm 설치

### External Dependencies
```json
{
  "dependencies": {
    "@apps-in-toss/web-framework": "latest",
    "@toss/tds-mobile": "latest",
    "react": "^18.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0"
  }
}
```

---

## 🚀 Implementation Phases

---

### Phase 1: 프로젝트 셋업 + Domain Layer
**Goal**: Clean Architecture 기반 프로젝트 구조 및 핵심 비즈니스 로직 구현
**Estimated Time**: 2-3 hours
**Status**: ⏳ Pending
**Coverage Target**: Domain ≥90%

#### Test Strategy
- **Test Types**: Unit tests only
- **Test Location**: `src/domain/__tests__/`
- **Mocking**: 없음 (순수 함수)
- **Test Scenarios**:
  - 점수 계산 정확성
  - 16유형 분류 정확성
  - 엣지 케이스 (모두 A, 모두 B)

#### Tasks

**🔴 RED: Write Failing Tests First**

- [ ] **Test 1.1**: Entity 타입 정의 테스트
  - File: `src/domain/__tests__/entities.test.ts`
  - 테스트: Question, Answer, Result 타입 검증
  - Expected: 타입 에러 (아직 구현 안됨)

- [ ] **Test 1.2**: calculateScores 유닛 테스트
  - File: `src/domain/__tests__/calculateScores.test.ts`
  - 테스트 케이스:
    ```typescript
    // 모두 A 선택 시
    test('all A answers → high caution scores', () => {
      const answers = ['A','A','A','A','A','A','A','A','A','A'];
      const result = calculateScores(answers);
      expect(result.riskAversion).toBeGreaterThan(70);
      expect(result.lossAversion).toBeGreaterThan(70);
    });

    // 모두 B 선택 시
    test('all B answers → low caution scores', () => {
      const answers = ['B','B','B','B','B','B','B','B','B','B'];
      const result = calculateScores(answers);
      expect(result.riskAversion).toBeLessThan(30);
    });

    // 혼합 선택
    test('mixed answers → balanced scores', () => {
      const answers = ['A','B','A','B','A','B','A','B','A','B'];
      const result = calculateScores(answers);
      expect(result.riskAversion).toBeGreaterThan(30);
      expect(result.riskAversion).toBeLessThan(70);
    });
    ```

- [ ] **Test 1.3**: determineType 유닛 테스트
  - File: `src/domain/__tests__/determineType.test.ts`
  - 테스트 케이스:
    ```typescript
    test('high all scores → CSPO type', () => {
      const scores = { riskAversion: 80, lossAversion: 80, timeDiscount: 80, probWeight: 80 };
      expect(determineType(scores)).toBe('CSPO');
    });

    test('low all scores → RTFL type', () => {
      const scores = { riskAversion: 20, lossAversion: 20, timeDiscount: 20, probWeight: 20 };
      expect(determineType(scores)).toBe('RTFL');
    });

    // 16가지 조합 모두 테스트
    test.each([
      [{ r: 80, l: 80, t: 80, p: 80 }, 'CSPO'],
      [{ r: 80, l: 80, t: 80, p: 20 }, 'CSPL'],
      // ... 나머지 14가지
    ])('scores %o → type %s', (scores, expected) => {
      expect(determineType(scores)).toBe(expected);
    });
    ```

**🟢 GREEN: Implement to Pass Tests**

- [ ] **Task 1.4**: 프로젝트 초기화
  ```bash
  cd ~/Desktop/claude-workspace/projects/economic-sense-test
  pnpm init
  pnpm add react @apps-in-toss/web-framework @toss/tds-mobile
  pnpm add -D typescript vitest @testing-library/react
  ```

- [ ] **Task 1.5**: TypeScript + Vitest 설정
  - `tsconfig.json`
  - `vitest.config.ts`

- [ ] **Task 1.6**: Entity 타입 구현
  - File: `src/domain/entities/index.ts`
  ```typescript
  export type AnswerChoice = 'A' | 'B';

  export interface Question {
    id: number;
    type: 'risk' | 'loss' | 'time' | 'probability';
    optionA: { label: string; description: string };
    optionB: { label: string; description: string };
  }

  export interface Scores {
    riskAversion: number;      // 0-100
    lossAversion: number;      // 0-100
    timeDiscount: number;      // 0-100
    probabilityWeight: number; // 0-100
  }

  export interface CharacterType {
    code: string;              // e.g., 'CSPO'
    name: string;              // e.g., '조심스러운 로또러'
    description: string;
    strengths: string[];
    weaknesses: string[];
    advice: string;
  }

  export interface Result {
    scores: Scores;
    character: CharacterType;
    percentiles: Scores;       // 상위 N%
  }
  ```

- [ ] **Task 1.7**: calculateScores 구현
  - File: `src/domain/usecases/calculateScores.ts`
  ```typescript
  import { AnswerChoice, Scores } from '../entities';

  export function calculateScores(answers: AnswerChoice[]): Scores {
    // Q1-3: 위험회피 (A=회피, B=추구)
    const riskAnswers = answers.slice(0, 3);
    const riskAversion = (riskAnswers.filter(a => a === 'A').length / 3) * 100;

    // Q4-6: 손실회피 (A=게임, B=거절=민감)
    const lossAnswers = answers.slice(3, 6);
    const lossAversion = (lossAnswers.filter(a => a === 'B').length / 3) * 100;

    // Q7-8: 시간할인 (A=현재, B=미래)
    const timeAnswers = answers.slice(6, 8);
    const timeDiscount = (timeAnswers.filter(a => a === 'A').length / 2) * 100;

    // Q9-10: 확률가중 (A=낙관/로또, B=현실)
    const probAnswers = answers.slice(8, 10);
    const probabilityWeight = (probAnswers.filter(a => a === 'A').length / 2) * 100;

    return { riskAversion, lossAversion, timeDiscount, probabilityWeight };
  }
  ```

- [ ] **Task 1.8**: determineType 구현
  - File: `src/domain/usecases/determineType.ts`
  ```typescript
  import { Scores } from '../entities';

  export function determineType(scores: Scores): string {
    const threshold = 50;

    const c = scores.riskAversion >= threshold ? 'C' : 'R';
    const s = scores.lossAversion >= threshold ? 'S' : 'T';
    const p = scores.timeDiscount >= threshold ? 'P' : 'F';
    const o = scores.probabilityWeight >= threshold ? 'O' : 'L';

    return `${c}${s}${p}${o}`;
  }
  ```

**🔵 REFACTOR: Improve Code Quality**

- [ ] **Task 1.9**: 코드 리팩토링
  - 매직 넘버 상수화
  - 함수 분리 (각 지표별 계산 함수)
  - JSDoc 주석 추가

- [ ] **Task 1.10**: granite.config.ts 작성
  ```typescript
  import { defineConfig } from '@apps-in-toss/web-framework/config';

  export default defineConfig({
    appName: 'economic-sense-test',
    brand: {
      displayName: '경제감각 테스트',
      primaryColor: '#3182F6',
      icon: 'https://static.toss.im/icons/png/4x/icon-toss-logo.png',
    },
    permissions: [],
    web: {
      port: 3000,
      commands: {
        dev: 'pnpm dev',
        build: 'pnpm build',
      },
    },
  });
  ```

#### Quality Gate ✋

**TDD Compliance**:
- [ ] Tests written BEFORE implementation
- [ ] Red-Green-Refactor cycle followed
- [ ] All tests pass: `pnpm test`

**Coverage**:
- [ ] Domain layer ≥90%: `pnpm test --coverage`
  ```
  src/domain/usecases/calculateScores.ts  | 100% |
  src/domain/usecases/determineType.ts    | 100% |
  ```

**Build**:
- [ ] TypeScript 컴파일 성공: `pnpm tsc --noEmit`
- [ ] Lint 통과: `pnpm lint`

**Validation Commands**:
```bash
pnpm test                    # 모든 테스트 실행
pnpm test --coverage         # 커버리지 확인
pnpm tsc --noEmit           # 타입 체크
```

---

### Phase 2: Data Layer
**Goal**: 질문 데이터 10개 + 캐릭터 데이터 16개 구현 및 검증
**Estimated Time**: 1-2 hours
**Status**: ⏳ Pending
**Coverage Target**: Data ≥80%

#### Test Strategy
- **Test Types**: Unit tests (데이터 유효성)
- **Test Location**: `src/data/__tests__/`
- **Test Scenarios**:
  - 질문 10개 존재 확인
  - 각 질문 필수 필드 존재
  - 캐릭터 16개 존재 확인
  - 모든 유형 코드 유일성

#### Tasks

**🔴 RED: Write Failing Tests First**

- [ ] **Test 2.1**: 질문 데이터 검증 테스트
  - File: `src/data/__tests__/questions.test.ts`
  ```typescript
  import { questions } from '../questions';

  describe('questions data', () => {
    test('should have exactly 10 questions', () => {
      expect(questions).toHaveLength(10);
    });

    test('should have 3 risk questions (Q1-3)', () => {
      const riskQs = questions.filter(q => q.type === 'risk');
      expect(riskQs).toHaveLength(3);
    });

    test('should have 3 loss questions (Q4-6)', () => {
      const lossQs = questions.filter(q => q.type === 'loss');
      expect(lossQs).toHaveLength(3);
    });

    test('each question should have required fields', () => {
      questions.forEach(q => {
        expect(q).toHaveProperty('id');
        expect(q).toHaveProperty('type');
        expect(q).toHaveProperty('optionA.label');
        expect(q).toHaveProperty('optionB.label');
      });
    });
  });
  ```

- [ ] **Test 2.2**: 캐릭터 데이터 검증 테스트
  - File: `src/data/__tests__/characters.test.ts`
  ```typescript
  import { characters } from '../characters';

  describe('characters data', () => {
    test('should have exactly 16 character types', () => {
      expect(Object.keys(characters)).toHaveLength(16);
    });

    test('should have all MBTI-style codes', () => {
      const expectedCodes = [
        'CSPO', 'CSPL', 'CSFO', 'CSFL',
        'CTPO', 'CTPL', 'CTFO', 'CTFL',
        'RSPO', 'RSPL', 'RSFO', 'RSFL',
        'RTPO', 'RTPL', 'RTFO', 'RTFL',
      ];
      expectedCodes.forEach(code => {
        expect(characters[code]).toBeDefined();
      });
    });

    test('each character should have required fields', () => {
      Object.values(characters).forEach(char => {
        expect(char).toHaveProperty('name');
        expect(char).toHaveProperty('description');
        expect(char).toHaveProperty('strengths');
        expect(char).toHaveProperty('advice');
      });
    });
  });
  ```

**🟢 GREEN: Implement**

- [ ] **Task 2.3**: 질문 데이터 구현
  - File: `src/data/questions.ts`
  - 10개 질문 (위험3 + 손실3 + 시간2 + 확률2)

- [ ] **Task 2.4**: 캐릭터 데이터 구현
  - File: `src/data/characters.ts`
  - 16개 캐릭터 유형 정의

**🔵 REFACTOR**

- [ ] **Task 2.5**: 질문 문구 다듬기
- [ ] **Task 2.6**: 캐릭터 설명 보완

#### Quality Gate ✋

**TDD Compliance**:
- [ ] Tests written BEFORE data implementation
- [ ] All data validation tests pass

**Coverage**:
- [ ] Data layer ≥80%

**Validation**:
```bash
pnpm test src/data
```

---

### Phase 3: Presentation Layer - Test Flow
**Goal**: 인트로 → 테스트 진행 UI 완성
**Estimated Time**: 2-3 hours
**Status**: ⏳ Pending
**Coverage Target**: Integration tests for user flow

#### Test Strategy
- **Test Types**: Component tests + Integration tests
- **Test Location**: `src/presentation/__tests__/`
- **Mocking**: Domain usecases (이미 테스트됨)
- **Test Scenarios**:
  - 인트로에서 시작 버튼 클릭 → 테스트 페이지 이동
  - 질문 선택 → 다음 질문 표시
  - 10번째 질문 선택 → 결과 페이지 이동
  - 진행바 업데이트 확인

#### Tasks

**🔴 RED: Write Failing Tests First**

- [ ] **Test 3.1**: QuestionCard 컴포넌트 테스트
  - File: `src/presentation/__tests__/QuestionCard.test.tsx`

- [ ] **Test 3.2**: useTest 훅 테스트
  - File: `src/presentation/__tests__/useTest.test.ts`

- [ ] **Test 3.3**: 테스트 플로우 통합 테스트
  - File: `src/presentation/__tests__/TestFlow.test.tsx`

**🟢 GREEN: Implement**

- [ ] **Task 3.4**: useTest 커스텀 훅 구현
  - File: `src/presentation/hooks/useTest.ts`
  - 상태: currentIndex, answers[]
  - 액션: selectAnswer, reset

- [ ] **Task 3.5**: QuestionCard 컴포넌트
  - File: `src/presentation/components/QuestionCard.tsx`
  - TDS Button 사용

- [ ] **Task 3.6**: ProgressBar 컴포넌트
  - File: `src/presentation/components/ProgressBar.tsx`

- [ ] **Task 3.7**: IntroPage 구현
  - File: `src/presentation/pages/IntroPage.tsx`

- [ ] **Task 3.8**: TestPage 구현
  - File: `src/presentation/pages/TestPage.tsx`

**🔵 REFACTOR**

- [ ] **Task 3.9**: 컴포넌트 분리 및 정리
- [ ] **Task 3.10**: 애니메이션 추가

#### Quality Gate ✋

**Tests**:
- [ ] 컴포넌트 테스트 통과
- [ ] 통합 테스트 통과

**Manual Testing**:
- [ ] 인트로 → 테스트 시작 동작
- [ ] 10개 질문 순차 진행
- [ ] 진행바 업데이트

---

### Phase 4: Presentation Layer - Result + Integration
**Goal**: 결과 화면 + 공유 기능 + 전체 통합
**Estimated Time**: 2-3 hours
**Status**: ⏳ Pending
**Coverage Target**: E2E critical path

#### Test Strategy
- **Test Types**: Component tests + E2E
- **Test Scenarios**:
  - 결과 계산 정확성 (Domain 연동)
  - 16유형 올바르게 표시
  - 공유 기능 동작

#### Tasks

**🔴 RED: Write Failing Tests First**

- [ ] **Test 4.1**: ResultCard 컴포넌트 테스트
- [ ] **Test 4.2**: 전체 플로우 E2E 테스트

**🟢 GREEN: Implement**

- [ ] **Task 4.3**: ResultCard 컴포넌트
  - 4개 지표 막대 그래프
  - 캐릭터 유형 표시
  - 백분위 (모의 데이터)

- [ ] **Task 4.4**: ResultPage 구현
  - Domain usecase 호출
  - 결과 렌더링

- [ ] **Task 4.5**: ShareButton 컴포넌트
  - 카카오톡 공유
  - URL 복사

- [ ] **Task 4.6**: 로딩/분석 화면
  - 결과 계산 중 연출

**🔵 REFACTOR**

- [ ] **Task 4.7**: 전체 UI 폴리싱
- [ ] **Task 4.8**: 다시하기 기능
- [ ] **Task 4.9**: 최종 코드 정리

#### Quality Gate ✋

**Tests**:
- [ ] 모든 테스트 통과
- [ ] E2E 테스트 통과

**Build**:
- [ ] 프로덕션 빌드 성공
- [ ] 번들 사이즈 확인

**Manual Testing**:
- [ ] 전체 플로우 (인트로→테스트→결과→공유)
- [ ] 모바일 반응형
- [ ] 공유 기능

---

## ⚠️ Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| TDS 버전 호환성 | Low | Medium | 공식 문서 버전 확인 |
| 계산 로직 오류 | Low | High | TDD로 철저히 테스트 |
| Apps in Toss 심사 반려 | Low | High | 가이드라인 준수, TDS 사용 |
| 테스트 커버리지 미달 | Medium | Medium | Phase별 커버리지 체크 |

---

## 🔄 Rollback Strategy

### Phase별 롤백
- **Phase 1**: 프로젝트 디렉토리 삭제 후 재시작
- **Phase 2-4**: Git 커밋 기반 롤백
  ```bash
  git log --oneline
  git reset --hard <commit-hash>
  ```

---

## 📊 Progress Tracking

### Completion Status
| Phase | Status | Coverage |
|-------|--------|----------|
| Phase 1: Domain | ⏳ 0% | -% |
| Phase 2: Data | ⏳ 0% | -% |
| Phase 3: Test UI | ⏳ 0% | -% |
| Phase 4: Result | ⏳ 0% | -% |

**Overall Progress**: 0% complete

---

## 📝 Notes & Learnings

### 질문 설계 (10문항)

#### 위험회피 측정 (Q1-3)
| Q | A (확실) | B (도박) |
|---|---------|---------|
| 1 | 확정 5만원 | 50%로 10만원 |
| 2 | 확정 3만원 | 50%로 10만원 |
| 3 | 확정 7만원 | 50%로 10만원 |

#### 손실회피 측정 (Q4-6)
| Q | A (게임 참여) | B (거절) |
|---|-------------|---------|
| 4 | 50%로 +3만/-1만 | 0원 유지 |
| 5 | 50%로 +2만/-1만 | 0원 유지 |
| 6 | 50%로 +4만/-2만 | 0원 유지 |

#### 시간할인 측정 (Q7-8)
| Q | A (지금) | B (나중) |
|---|---------|---------|
| 7 | 오늘 10만원 | 1년 후 11만원 |
| 8 | 오늘 10만원 | 1년 후 15만원 |

#### 확률가중 측정 (Q9-10)
| Q | A (낮은확률 대박) | B (확실) |
|---|-----------------|---------|
| 9 | 1%로 300만원 | 확정 5만원 |
| 10 | 90%로 10만원 | 확정 8만원 |

### 캐릭터 유형 (16가지 - MBTI 스타일)

#### 4개 축 정의
| 지표 | 높음 | 낮음 |
|------|------|------|
| 위험회피 | **C** (Cautious) | **R** (Risk-taker) |
| 손실회피 | **S** (Sensitive) | **T** (Tolerant) |
| 시간할인 | **P** (Present) | **F** (Future) |
| 확률가중 | **O** (Optimistic) | **L** (Logical) |

#### 16유형 목록
| 코드 | 이름 | 한 줄 설명 |
|------|------|-----------|
| CSPO | 조심스러운 로또러 | 안전하게, 근데 대박은 노려봄 |
| CSPL | 철벽 수비수 | 리스크 제로, 현실적 판단 |
| CSFO | 낙관적 저축러 | 미래 대비하지만 희망도 품음 |
| CSFL | 완벽한 플래너 | 모든 게 계획대로 |
| CTPO | 느긋한 한탕주의 | 손실은 괜찮아, 대박 기다림 |
| CTPL | 합리적 보수파 | 신중하고 현실적, 손실에 담담 |
| CTFO | 여유로운 낙관론자 | 미래 믿고 느긋하게 |
| CTFL | 워렌 버핏 견습생 | 장기투자, 냉철한 분석 |
| RSPO | 지금 아니면 안돼 | 당장 베팅, 대박 노림 |
| RSPL | 계산된 승부사 | 리스크 테이킹, 근데 계산적 |
| RSFO | 미래의 큰 손 | 장기 고위험 투자자 |
| RSFL | 프로 트레이더 | 리스크 감수, 냉정한 분석 |
| RTPO | 올인 도박사 | 다 걸어, 대박 아님 쪽박 |
| RTPL | 냉혈 투기꾼 | 감정 없이 베팅 |
| RTFO | 미래에 베팅하는 자 | 장기 고위험, 낙관적 |
| RTFL | 냉철한 큰 그림 | 리스크 OK, 장기적, 현실적 |

---

## 📚 References

- [Apps in Toss Developer Center](https://developers-apps-in-toss.toss.im)
- [TDS Mobile Docs](https://tossmini-docs.toss.im/tds-mobile)
- Kahneman & Tversky, Prospect Theory (1979)
- Thaler, Mental Accounting (1985)
- [Vitest Documentation](https://vitest.dev)
- [Testing Library](https://testing-library.com)

---

## ✅ Final Checklist

**Before marking plan as COMPLETE**:
- [ ] All phases completed with quality gates passed
- [ ] Domain layer coverage ≥90%
- [ ] All tests pass
- [ ] Full integration testing performed
- [ ] granite.config.ts 검증 완료
- [ ] Apps in Toss 가이드라인 준수 확인
- [ ] 모바일 UX 테스트 완료
