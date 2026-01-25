# Economic Sense Test

경제 상식 테스트 게임 앱

---

## Overview

| 항목 | 값 |
|------|-----|
| **배포 URL** | https://economic-sense-test.vercel.app |
| **Supabase Project** | Project 1 (게임) - `ayibvijmjygujjieueny` |
| **Schema** | `economic_sense_test` |

---

## 진행상황

| 영역 | 상태 |
|------|:----:|
| Frontend | ✅ |
| Backend | - (Supabase 직접 연결) |
| DB 연결 | ✅ |
| 배포 | ✅ |

---

## 프로젝트별 설정

### DB 테이블

```
economic_sense_test.questions
economic_sense_test.categories
economic_sense_test.user_scores
```

### 환경 변수 (.env.local)

```env
VITE_SUPABASE_URL=https://ayibvijmjygujjieueny.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## 디렉토리 구조

```
src/
├── components/   # UI 컴포넌트
├── pages/        # 페이지 컴포넌트
├── hooks/        # 커스텀 훅
├── services/     # Supabase 서비스
└── types/        # TypeScript 타입
```

---

*글로벌 설정은 상위 `CLAUDE.md` 참조*
