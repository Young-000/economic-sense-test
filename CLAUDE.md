# Economic Sense Test

경제 상식 테스트 게임 앱

---

## 진행상황 체크리스트

| 영역 | 상태 | 배포 URL |
|------|:----:|----------|
| **Frontend** | ✅ | [economic-sense-test.vercel.app](https://economic-sense-test.vercel.app) |
| **Backend** | ❌ | Supabase 직접 연결 |
| **DB 연결** | ✅ | `economic_sense_test` 스키마 |
| **배포** | ✅ | Vercel |

<details>
<summary>상세 체크리스트</summary>

### Frontend
- [x] 프로젝트 초기화 (Vite)
- [x] TypeScript 설정
- [x] 라우팅 구성
- [x] 환경 변수 (.env.local)
- [x] ESLint/Prettier

### Backend
- [x] Supabase 직접 연결 (별도 백엔드 없음)

### DB 연결
- [x] Project 1 선택
- [x] `economic_sense_test` 스키마 생성
- [x] 테이블 생성
- [x] 클라이언트 연결

### 배포
- [x] vercel.json
- [x] 환경 변수 (Vercel)
- [x] 프로덕션 배포

</details>

---

## Supabase 설정

> ⚠️ **필수 참조**: [`/SUPABASE_RULES.md`](/SUPABASE_RULES.md)

| 항목 | 값 |
|------|-----|
| **Project** | Project 1 (게임) |
| **Project ID** | `ayibvijmjygujjieueny` |
| **Schema** | `economic_sense_test` |
| **URL** | `https://ayibvijmjygujjieueny.supabase.co` |

## 기술 스택

- **Frontend**: React + Vite + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)

## 개발 명령어

```bash
npm install    # 의존성 설치
npm run dev    # 개발 서버
npm run build  # 프로덕션 빌드
npm run lint   # 린트 실행
```

## 환경 변수

`.env.local`:
```env
# Supabase Configuration - Project 1 (게임)
# Schema: economic_sense_test

VITE_SUPABASE_URL=https://ayibvijmjygujjieueny.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## 디렉토리 구조

```
src/
├── components/   # UI 컴포넌트
├── pages/        # 페이지 컴포넌트
├── hooks/        # 커스텀 훅
├── services/     # API 서비스
└── types/        # TypeScript 타입
```

---

*이 프로젝트는 글로벌 규칙 `/CLAUDE.md` 및 `/SUPABASE_RULES.md`를 따릅니다.*
