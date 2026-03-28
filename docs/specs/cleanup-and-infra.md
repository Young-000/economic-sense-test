# Feature: cleanup-and-infra
> Cycle 1 | Feature 1 | 기술 부채 해소 및 인프라 정비

---

## JTBD

**개발자 관점:**
When 프로젝트를 `git status`로 확인할 때, I want to 깨끗한 상태(untracked 파일 0개)를 보고 싶다, so I can 실제 코드 변경 사항만 파악하고 효율적으로 작업할 수 있다.

**사용자 관점:**
When 프로젝트에 새 기능을 추가할 때, I want to 기술 부채 없이 깨끗한 코드베이스에서 작업하고 싶다, so I can 빠르게 개발하고 실수 없이 배포할 수 있다.

---

## Problem

- **Who:** 이 프로젝트를 유지보수하는 개발자 (1인 개발)
- **Pain:** 매 `git status` 마다 31개의 미추적 PNG 파일이 노이즈를 생성 (빈도: 매 작업 세션마다)
- **Current workaround:** 무시하고 작업하지만, 실수로 커밋할 위험 + git diff가 지저분함
- **Success metric:** `git status`에서 의도치 않은 untracked 파일 0개

---

## Solution

### Overview

프로젝트 루트에 산재한 31개의 스크린샷 PNG 파일을 삭제하고, `.gitignore`를 업데이트하여 향후 스크린샷 파일이 자동으로 무시되도록 한다. 추가로 데드 코드 확인 및 불필요한 파일 정리를 수행한다.

### 작업 범위

**1. PNG 파일 정리 (31개)**

프로젝트 루트에 위치한 미추적 PNG 파일 전체 삭제:

```
# 프리픽스별 분류
home-*         : 3개 (home-initial, home-mobile-375, mobile-375-home-clean 등)
mobile-375-*   : 4개 (home, game, result, home-clean)
tablet-768-*   : 2개 (home, home-clean)
desktop-1920-* : 1개 (home)
game-*         : 1개 (game-page-screenshot)
result-*       : 1개 (result-page-tier)
uiux-*         : 19개 (다양한 페이지/뷰포트 스크린샷)

총 31개 파일, 약 3.4MB
```

**2. .gitignore 업데이트**

```gitignore
# Screenshots (디버깅/리뷰용, repo 불포함)
*.png
!src/**/*.png
!public/**/*.png
```

- 프로젝트 루트 및 일반 디렉토리의 PNG는 무시
- `src/` 및 `public/` 내부의 PNG는 허용 (앱에서 사용하는 에셋)
- 기존 `.playwright-mcp/`, `test-results/`, `coverage/`는 이미 gitignore에 등록됨

**3. database.types.ts 확인**

- `src/lib/database.types.ts`가 untracked 상태 — git status에서 확인됨
- 이 파일이 필요한지, `.gitignore`에 추가해야 하는지 확인
- Supabase 타입 파일이므로 일반적으로 git에 포함시킴 (자동 생성이지만 CI에서 매번 생성하지 않으므로)
- **결정: 파일 내용 확인 후, 유효하면 git add. 빈 파일이거나 불필요하면 삭제.**

**4. ExitConfirmDialog 사용 여부 확인**

- `ExitConfirmDialog.tsx`가 존재하지만 현재 import/사용처가 없을 가능성
- 확인 후 미사용이면 삭제 (데드 코드 제거)
- **방법:** `grep -r "ExitConfirmDialog"` 또는 `grep -r "exit-dialog"` 로 사용처 확인

### Scope (MoSCoW)

**Must:**
- [ ] 프로젝트 루트 PNG 31개 삭제
- [ ] `.gitignore`에 스크린샷 PNG 무시 패턴 추가
- [ ] `git status` 확인 — untracked PNG 0개

**Should:**
- [ ] `database.types.ts` 상태 확인 및 처리 (git add 또는 삭제)
- [ ] `ExitConfirmDialog` 사용 여부 확인 및 데드 코드 삭제
- [ ] `.gitignore` 주석으로 각 섹션 용도 명확히 기록

**Could:**
- [ ] `CLAUDE.md`에서 "30+ untracked PNG" 관련 항목 업데이트
- [ ] `docs/PROGRESS.md`에 정리 완료 기록

**Won't (this cycle):**
- `.playwright-mcp/` 내부 PNG 정리 (이미 .gitignore에 등록됨)
- `test-results/` 내부 파일 정리 (이미 .gitignore에 등록됨)
- CSS 파일 분리/리팩토링 (별도 Feature)
- Tailwind 마이그레이션 (Cycle 3+)

---

## Acceptance Criteria

- [ ] **AC1:** Given 프로젝트 루트에 31개의 untracked PNG가 있었을 때, When cleanup 작업을 수행하면, Then `git ls-files --others --exclude-standard '*.png'` 결과가 0개이다.

- [ ] **AC2:** Given `.gitignore`가 업데이트되었을 때, When 프로젝트 루트에 새로운 `test.png` 파일을 생성하면, Then `git status`에 해당 파일이 표시되지 않는다.

- [ ] **AC3:** Given `.gitignore`가 업데이트되었을 때, When `src/` 또는 `public/` 내부에 PNG를 추가하면, Then `git status`에 해당 파일이 정상적으로 표시된다. (앱 에셋은 추적 가능)

- [ ] **AC4:** Given ExitConfirmDialog 사용 여부를 확인했을 때, When 프로젝트 전체에서 import/참조가 없으면, Then 해당 컴포넌트 파일을 삭제하고 components/index.ts에서도 제거한다.

- [ ] **AC5:** Given 모든 정리가 완료되었을 때, When `npm run build`를 실행하면, Then 빌드가 정상적으로 성공한다. (삭제로 인한 빌드 에러 없음)

- [ ] **AC6:** Given 모든 정리가 완료되었을 때, When `npm run typecheck`를 실행하면, Then 타입 에러가 0개이다.

---

## Task Breakdown

1. **프로젝트 루트 PNG 31개 삭제** — Complexity: S — Deps: none
   ```bash
   rm *.png  # 프로젝트 루트에서 실행
   ```

2. **`.gitignore` 업데이트** — Complexity: S — Deps: none
   - PNG 무시 패턴 추가
   - 섹션별 주석 정리

3. **`database.types.ts` 상태 확인 및 처리** — Complexity: S — Deps: none
   - 파일 내용 확인
   - 유효하면 git add, 아니면 삭제

4. **`ExitConfirmDialog` 사용 여부 확인** — Complexity: S — Deps: none
   - 프로젝트 전체 grep
   - 미사용이면 삭제 + index.ts 정리 + global.css에서 관련 스타일 제거

5. **빌드/타입 검증** — Complexity: S — Deps: [1, 2, 3, 4]
   ```bash
   npm run typecheck && npm run build
   ```

6. **문서 업데이트** — Complexity: S — Deps: [5]
   - `CLAUDE.md` — "스크린샷 파일 정리" 항목 완료 표시
   - `docs/PROGRESS.md` — 작업 기록 추가

---

## Open Questions

1. `database.types.ts`가 현재 어디서 사용되는지? (import 확인 필요)
2. `src/lib/database.types.ts`와 Supabase CLI 자동 생성 타입의 관계는?

---

## Out of Scope

- **CSS 파일 분리/리팩토링**: 3,198줄 global.css는 별도 Feature에서 다룸
- **ResultPage 분리**: Cycle 2의 `result-page-refactor`에서 다룸
- **Tailwind 마이그레이션**: 장기 과제 (Cycle 3+)
- **테스트 추가/수정**: 삭제로 인한 테스트 실패만 수정, 새 테스트 작성 안 함
- **.playwright-mcp/ 내부 정리**: 이미 .gitignore에 등록되어 있으므로 불필요

---

*작성: PM Agent | 2026-02-17*
