# Economic Sense Test
경제 센스 테스트 게임 앱 (앱인토스 미니앱)

## Overview
| 항목 | 값 |
|------|-----|
| 배포 URL | https://economic-sense-test.vercel.app |
| Supabase | Project 1 (게임) - `ayibvijmjygujjieueny` |
| 스키마 | `economic_sense_test` |
| 브랜치 | main |
| 완성도 | 95% |
| 앱인토스 | 비게임 카테고리 |

## 기술 스택
- React 18 + TypeScript + Vite 7.3
- Apps-in-Toss (@apps-in-toss/web-framework, @toss/tds-mobile)
- Supabase (DB/Auth + Edge Functions)
- react-router-dom (라우팅)
- html2canvas (공유 이미지 생성)
- Vitest + Playwright (테스트)

## 앱인토스 아키텍처

### 인증 플로우
```
appLogin() -> authorizationCode
  -> Edge Function /functions/v1/auth (mTLS)
  -> 토스 파트너 API (AccessToken + RefreshToken)
  -> userKey 추출 -> 클라이언트 캐싱 (50분 TTL)
```

### 코인 이코노미
- 인앱 화폐: 코인 (coin)
- 교환비: 10코인 = 1P (토스포인트)
- 적립: 게임 완료(+5), 고티어(+10), 광고(+20), 공유(+5)
- 교환: promotion Edge Function 경유

### 광고 (v2 API)
- 보상형: 결과 페이지 (+20 coin), 60초 쿨다운, 일 15회
- 전면: 게임 완료 후, 일 10회
- 배너: 결과 페이지 하단

### 미션 (3트랙 x 4스테이지)
- 투자자: 게임 횟수 (1/5/20/50)
- 연속 도전: 스트릭 (3/7/14/30일)
- 수익왕: 티어 달성 (B/A/S/SS)

## 프로젝트 구조
```
src/
  domain/           # 엔티티, 유스케이스
    services/       # coinService, exchangeService, missionService
  data/             # 서비스 (ranking, achievements, questions)
  infrastructure/   # userIdentity (appLogin 인증)
  constants/        # ad.ts (광고 그룹 ID)
  presentation/
    components/     # UI 컴포넌트 (MissionPanel, CoinBalance, ErrorBoundary 등)
    hooks/          # useFullScreenAd, useInterstitialAd, useBannerAd
    pages/          # Intro, Game, Result
  lib/              # 유틸리티 (season, share, format, abTest)
  styles/           # global.css (라이트 모드)
supabase/
  functions/
    auth/           # 인증 Edge Function (mTLS 토큰 교환)
    promotion/      # 프로모션 Edge Function (토스 포인트 지급)
```

## DB 테이블
```
economic_sense_test.question_categories
economic_sense_test.question_scenarios
economic_sense_test.amount_ranges
economic_sense_test.economic_rankings
economic_sense_test.user_sessions     (Edge Function 전용)
economic_sense_test.promotion_records (Edge Function 전용)
```

## 환경 변수 (.env.local)
```env
VITE_SUPABASE_URL=https://ayibvijmjygujjieueny.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_MOCK_USER_KEY=dev-test-user-key  # 개발용 (선택)
```

## 개발 명령어
```bash
npm run dev            # 개발 서버
npm run build          # 웹 빌드
npm run build:ait      # AIT 빌드 (builds/ 디렉토리)
npm run typecheck      # 타입 체크
npm run lint           # ESLint
npm run test           # 단위 테스트
```

## 테스트
- 단위 테스트: Vitest 26개
- E2E 테스트: Playwright 6개 spec 파일

## 진행상황
- [x] 핵심 퀴즈 게임 로직
- [x] 티어 시스템
- [x] 랭킹 시스템
- [x] 바이럴 공유 기능 (html2canvas)
- [x] 번들 최적화
- [x] AIT SDK 연동 (granite.config.ts)
- [x] 라이트 모드 전환 (다크 -> 라이트)
- [x] appLogin 인증 인프라 (Edge Function)
- [x] 코인 이코노미 (적립/교환)
- [x] 광고 4종 연동 (보상형/전면/배너)
- [x] 미션 시스템 (3트랙 x 4스테이지)
- [x] 보상 이펙트 (코인 파티클, 카운트업)
- [x] ErrorBoundary
- [x] AIT 빌드 스크립트
- [ ] 광고 그룹 ID 실제 값 교체 (콘솔 발급 후)
- [ ] user_sessions / promotion_records DB 마이그레이션
- [ ] E2E 테스트 리뷰

## Known Issues (프로젝트 고유)
- 광고 그룹 ID가 아직 placeholder (TODO: 콘솔 발급 후 교체)
- user_sessions, promotion_records 테이블 미생성 (DB 마이그레이션 필요)
- CoinParticle/ResultPage의 setState-in-effect warning (기능 동작에 영향 없음)

---
*글로벌 설정은 상위 `CLAUDE.md` 참조*
