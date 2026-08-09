# Backlog

## Priority Legend
- P0: Critical / Blocking
- P1: High Priority
- P2: Medium Priority
- P3: Nice to Have

## Next

### 🔴 2026-08-09 PM 리필 — 런칭 차단 경로 해소 (기능 추가 금지)
> 근거: 실사용 지표 6개월+ 0 (마지막 실기록 2026-01-25, 랭킹 9건 전부 1월 테스트 데이터). 원인은 이탈이 아니라 AIT 콘솔 미제출 = 미런칭. 최근 4커밋이 무동작 이코노미 튜닝에 낭비됨. 이번 리필은 "지표가 움직일 수 있는 상태"를 만드는 데만 집중한다. 우선순위순.

- [ ] **P0** verify.sh GREEN 복구: lint FAIL + test FAIL(questionService 2건) 수정 (근거: `bash scripts/verify.sh` → VERIFY: RED, 모든 머지·온보딩 차단. verify: EXIT GREEN이 완료 기준)
- [ ] **P0** `user_sessions` + `promotion_records` 마이그레이션 실 DB 적용 — additive/비파괴이므로 자율 범위. `supabase/functions/*` 참조 SQL을 `economic_sense_test` 스키마에 apply_migration (근거: 두 테이블 미존재 → auth·promotion Edge Function 런타임 실패 = 코인 이코노미·토스포인트 교환 전부 무동작. verify: `list_tables`에 두 테이블 존재)
- [ ] **P1** auth Edge Function 스모크 테스트: `VITE_MOCK_USER_KEY` 경로 + 세션 upsert가 `user_sessions`에 실제 기록되는지 검증 (근거: 인증 실패 시 로그인 이후 전 기능 붕괴. verify: 세션 1건 insert 확인)
- [ ] **P1** 콘솔 제출 패키지 준비 (`ait-submit` 스킬 — 스크린샷·설명·에셋·체크리스트 산출). **실제 제출은 D1 외부노출 게이트 → GATE_NEEDED로 멈춘다** (근거: 6개월 미제출 = 실사용 0의 근본 원인. verify: 제출 리포트 파일 생성 + 누락 에셋 0)
- [ ] **P1** 런칭 후 북극성 측정 인프라: GA4 이벤트 배선(게임 완료·결과 공유·광고 시청) — 현재 지표를 DB로만 잡아 미런칭 상태에서 측정 불가 (근거: 다음 PM 사이클이 실측할 신호원이 없음. verify: 3개 이벤트 dev 콘솔 발화)
- [ ] **P2** 코인 이코노미 v3.1 동결 — 실사용 데이터 확보 전 추가 리밸런스 금지. 튜닝은 런칭 후 실광고 단가·리텐션 데이터로만 재개 (근거: 최근 4커밋이 무동작 이코노미 숫자만 조정. verify: 이후 사이클 economy 커밋 0)
- [ ] **P2** `economic_rankings` 테스트 데이터 9건 정리 — 전부 1월 테스트 레코드로 프로덕션 랭킹 오염 (근거: 실 유저 랭킹과 혼재 시 첫 리더보드 신뢰 훼손. verify: 실런칭 전 테스트 nickname 레코드 0)

### P0 — VERIFY 수복 (fleet-sync 온보딩 차단 중)
- [ ] verify.sh GREEN 복구: lint FAIL(ESLint 에러 4건) + test FAIL(Vitest `@infrastructure` alias 미해석·questionService 기대값 불일치 2건) 수정 (근거: bash scripts/verify.sh → VERIFY: RED, 야간 사이클 머지 게이트 차단)

### P1 — UI/UX 개선
- [x] ~~모드 변경 피드백 개선 (PD Issue #1 — 모드 선택 시 로컬 확인 메시지)~~ — Cycle 15

### P1 — 기능 개선
- [x] ~~시즌 2 문제 세트 추가 (새로운 경제 상식)~~ — Cycle 16 (15문제, 총 40문제)
- [ ] A/B 테스트 고도화 (버튼 텍스트, 레이아웃 변형)

### P2 — 소셜/성장
- [ ] 친구 대결 기능 (초대 링크 → 동일 문제 세트 풀기)
- [ ] 그룹 랭킹 기능
- [x] ~~재도전 유도 UX (이전 점수 비교)~~ — Cycle 17

### P2 — UX 개선 (PD 리뷰 후속)
- [x] ~~듀얼 배너 스페이싱 최적화 (PD Issue #2)~~ — Cycle 18
- [x] ~~Hook aria-hidden 접근성 개선 (PD Issue #5)~~ — Cycle 18
- [x] ~~스크롤 힌트 추가 (PD Issue #7)~~ — Cycle 18
- [x] ~~반응형 padding-top clamp() 적용 (PD Issue #8)~~ — Cycle 3 mobile-responsive에서 해결

### P3 — 기술 개선
- [ ] Tailwind CSS 마이그레이션 (글로벌 컨벤션 준수)
- [ ] 문제 난이도 자동 조절
- [ ] 테스트 커버리지 확대 (핵심 로직 90%+)
- [ ] 접근성 개선 (WCAG AA)
- [ ] GA4 + 퍼널 분석 인프라 구축

## In Progress
<!-- Pipeline mode: features currently being worked on -->

## Done
- [x] 핵심 퀴즈 게임 로직
- [x] 티어 시스템
- [x] 랭킹 시스템
- [x] 바이럴 공유 기능 (html2canvas)
- [x] 번들 최적화 (603KB -> 378KB)
- [x] Toss SDK 제거
- [x] html2canvas 동적 import
- [x] 단위 테스트 26개
- [x] E2E 테스트 6개
- [x] Vercel 배포
- [x] **[Cycle 1]** 현황 리뷰 및 기술 부채 분석
- [x] **[Cycle 1]** 30+ 미추적 PNG 스크린샷 정리 + .gitignore 설정 (PR #9)
- [x] **[Cycle 1]** ExitConfirmDialog 데드 코드 제거 (PR #9)
- [x] **[Cycle 1]** IntroPage 디자인 리뉴얼 — CTA-first 레이아웃 (PR #10)
- [x] **[Cycle 1]** 가짜 소셜 증거 제거 (PR #10)
- [x] **[Cycle 2]** ResultPage 리팩토링 — 902줄 → 147줄 + 9 컴포넌트 + 2 훅 (PR #11)
- [x] **[Cycle 2]** GamePage UX 폴리시 — 확률 바, 잔액 피드백, 결과 오버레이, 마지막 라운드 (PR #12)
- [x] **[Cycle 3]** 공유 이미지 디자인 개선 — 티어 히어로, stat bars 제거, 수익률 강조 (PR #13)
- [x] **[Cycle 3]** 모바일 반응형 최적화 — 375px~1920px, clamp(), 44px 탭 타겟 (PR #14)
- [x] **[Cycle 14]** ISSUES.md 전체 수정 — 빌드에러/교환활성화/광고CTA/배너/홈이벤트 (PR #15)
- [x] **[Cycle 14]** AIT 배포 완료 (019d35d4)
