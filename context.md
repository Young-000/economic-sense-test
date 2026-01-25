# Economic Sense Test - 개발 컨텍스트

이 문서는 프로젝트 개발 중 발견된 버그, 주의사항, 검증 프로세스를 기록합니다.

---

## 버그 히스토리

### 1. initialBalance 누락 버그 (2026-01-25 수정)

**증상**: 익스트림 모드에서 수익률이 -475%로 비정상적으로 표시됨 (실제: -23%)

**원인**: `useGame.ts`에서 `calculateFinalResult` 호출 시 `initialBalance` 파라미터 누락
- 익스트림 모드(5천만원 시작)에서도 일반 모드(1천만원)의 기본값 사용
- 수익률 계산: `(손익 / 시작잔액) * 100` → 분모가 5배 작아 결과가 5배 커짐

**수정 전**:
```typescript
// src/presentation/hooks/useGame.ts:170-173
const finalResult = useMemo(() => {
  if (!gameState.isComplete) return null;
  return calculateFinalResult(gameState.results, questions);
}, [gameState.isComplete, gameState.results, questions]);
```

**수정 후**:
```typescript
const finalResult = useMemo(() => {
  if (!gameState.isComplete) return null;
  return calculateFinalResult(gameState.results, questions, config.INITIAL_BALANCE);
}, [gameState.isComplete, gameState.results, questions, config.INITIAL_BALANCE]);
```

**교훈**:
- 함수 기본값은 정적 상수에만 사용
- 런타임에 결정되는 값(모드별 설정)은 명시적으로 전달 필수
- useMemo 의존성 배열에 사용하는 모든 외부 변수 포함

---

### 2. EV/Outcome 표시 버그 (2026-01-25 수정)

**증상**:
- 갭투자 시나리오 EV가 "-1천만" 대신 "-1.4천만"으로 표시되어야 함
- 명품 리셀 사업 시나리오 Outcome이 "+2천만" 대신 "+1.5천만"으로 표시되어야 함

**원인**: 위의 initialBalance 버그와 동일 원인 (모드별 설정 미적용)

**검증**: Playwright로 프로덕션 사이트에서 직접 확인
- 갭투자: "기대수익 -1.4천만" ✅
- 명품 리셀: "+1.5천만" (35% 확률) ✅

---

## 게임 모드별 설정

| 모드 | 시작 잔액 | 총 라운드 | 비고 |
|------|----------|----------|------|
| 일반 (normal) | 1,000만원 | 10 | 표준 난이도 |
| 익스트림 (extreme) | 5,000만원 | 10 | 높은 변동성 |

**주의사항**:
- 익스트림 모드는 잔액이 높아 계산 오류가 더 두드러짐
- 잔액 관련 로직 변경 시 익스트림 모드를 우선 테스트할 것

---

## Vercel 배포 검증 프로세스

### 배포 완료 확인 방법

Vercel 대시보드의 "Ready" 상태만으로는 부족합니다. **JS 번들 해시 변경**을 확인해야 합니다.

**검증 순서**:
1. Vercel 배포 완료 대기 (Ready 상태)
2. Chrome DevTools 열기 (F12)
3. Network 탭 → JS 필터
4. Hard refresh (Cmd+Shift+R 또는 Ctrl+Shift+F5)
5. `index-[hash].js` 파일명 비교
   - 해시가 변경되었으면 배포 완료 ✅
   - 동일하면 CDN 캐시 문제, 잠시 대기 후 재시도

**예시**:
```
이전: index-R0zV-ZVm.js
현재: index-DXKCKLos.js  ← 해시 변경됨 = 배포 완료
```

---

## React Hooks 주의사항

### useMemo 의존성 배열

**규칙**: 함수 내부에서 참조하는 모든 외부 변수를 의존성 배열에 포함

**올바른 예시**:
```typescript
const finalResult = useMemo(() => {
  return calculateFinalResult(results, questions, initialBalance);
}, [results, questions, initialBalance]); // ✅ 모두 포함
```

**잘못된 예시**:
```typescript
const finalResult = useMemo(() => {
  return calculateFinalResult(results, questions, initialBalance);
}, [results, questions]); // ❌ initialBalance 누락
```

**ESLint 설정**: `react-hooks/exhaustive-deps` 규칙을 `error`로 설정 권장

---

## 수치 계산 버그 디버깅 기법

계산 결과가 예상과 다를 때 **역산 분석**으로 빠르게 원인 파악:

1. 기대값 vs 실제값 차이 계산
2. 비율 패턴 확인 (5배, 10배 등)
3. 해당 비율을 만드는 변수 추적
4. 코드에서 누락/오류 확인

**예시**:
```
기대: -23% (손실 1,150만원 / 시작 5,000만원)
실제: -475%

비율: 475 / 23 ≈ 20.6... 아니, 정확히 5배 차이 아님
재계산: 475 / 95 = 5배 → 시작 잔액이 5배 차이 (1천만 vs 5천만)
결론: initialBalance가 잘못된 값 사용
```

---

## E2E 점검 체크리스트

프로젝트 전체 점검 시 아래 Phase를 순서대로 진행:

| Phase | 항목 | 완료 조건 |
|:-----:|------|----------|
| 0 | 현황 파악 | 브랜치 생성, git status 확인 |
| 1 | 코드 품질 | lint 에러 0, type-check 에러 0 |
| 2 | DB 연동 | 스키마 정상, RLS 활성화 |
| 3 | Backend | any 타입 최소화, 에러 핸들링 |
| 4 | Frontend | 콘솔 에러 0, 반응형 정상 |
| 5 | UI/UX | img alt 존재, 로딩/에러 상태 |
| 6 | 테스트 | 80%+ 통과 |
| 7 | 배포 | 프로덕션 URL 정상 |

**최종 검증 명령어**:
```bash
npm run lint && npm run typecheck && npm run build && npm test
```

---

## 관련 파일

| 파일 | 설명 |
|------|------|
| `src/presentation/hooks/useGame.ts` | 게임 상태 관리 훅 |
| `src/domain/usecases/gameEngine.ts` | 게임 로직 (EV 계산, 결과 계산) |
| `src/lib/formatUtils.ts` | 금액 포맷팅 유틸리티 |
| `src/domain/entities/gameConfig.ts` | 게임 모드별 설정 |

---

*마지막 업데이트: 2026-01-25*
