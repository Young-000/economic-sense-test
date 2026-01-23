# Project Overview

## 기본 정보
| 항목 | 내용 |
|------|------|
| **프로젝트명** | economic-sense-test |
| **목적** | 경제 상식 테스트 게임 |
| **상태** | 🟢 운영 중 |
| **시작일** | - |
| **마지막 업데이트** | 2025-01-19 |

## 한 줄 요약
> 경제 지식을 테스트하는 퀴즈 게임 앱 (토스 앱 내 서비스)

## 기술 스택
| 분류 | 기술 |
|------|------|
| Frontend | React |
| Framework | @apps-in-toss/web-framework |
| Database | Supabase |
| UI | @toss/tds-mobile |
| Language | TypeScript |
| Testing | E2E (Playwright) |

## 주요 기능
- 경제 상식 퀴즈
- 점수 기록 및 랭킹
- 토스 앱 연동

## 아키텍처 개요
```
src/
├── pages/        # 라우팅 페이지
├── components/   # UI 컴포넌트
├── hooks/        # 커스텀 훅
└── utils/        # 유틸리티
```

## 디렉토리 구조
```
economic-sense-test/
├── coverage/          # 테스트 커버리지
├── dist/              # 빌드 결과물
├── docs/              # 문서
├── e2e/               # E2E 테스트
├── public/            # 정적 파일
├── scripts/           # 스크립트
├── src/               # 소스 코드
└── supabase/          # Supabase 설정
```

## 최근 작업 내역
| 날짜 | 작업 내용 | 상태 |
|------|----------|------|
| - | 초기 개발 완료 | ✅ 완료 |

## 다음 할 일
- [ ] 퀴즈 문제 추가
- [ ] 성능 최적화

## 참고 사항
- Supabase 스키마: `economic_sense_test`
- 토스 앱 내 서비스로 배포

---
*이 문서는 Claude Code Stop 훅에 의해 자동으로 업데이트됩니다.*
