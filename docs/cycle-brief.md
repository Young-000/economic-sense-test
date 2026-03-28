# Cycle Brief — Economic Sense Test

## Project Summary
경제 상식 퀴즈 게임 웹앱. 사용자가 경제 지식 수준을 테스트하고 SNS로 결과를 공유.

## Tech Stack
- React 18 + TypeScript + Vite 7.3
- Supabase (`economic_sense_test` 스키마)
- react-router-dom, html2canvas (dynamic import)
- Vitest + Playwright
- 배포: Vercel (economic-sense-test.vercel.app)
- 스타일: 현재 커스텀 CSS (`src/styles/global.css`), Tailwind 마이그레이션 예정

## Architecture
```
src/
  domain/           # 엔티티 (Question, Score), 유스케이스 (gameEngine)
  data/             # 서비스 (ranking, achievements, questions, questionService)
  presentation/
    components/     # UI (Confetti, ShareImageCard, AchievementBadge, AdBanner 등)
    hooks/          # useGame, useABTest
    pages/          # IntroPage, GamePage, ResultPage
  lib/              # 유틸리티 (season, share, format, abTest, supabase)
  styles/           # global.css
```

## Pages (3 routes)
- `/` → IntroPage: 게임 소개 + 시작 CTA
- `/game` → GamePage: 퀴즈 풀기 (카테고리별 문제)
- `/result` → ResultPage: 결과 + 티어 + 랭킹 + 공유 (lazy loaded)

## DB Tables
- `economic_sense_test.questions` — 문제 데이터
- `economic_sense_test.categories` — 카테고리
- `economic_sense_test.user_scores` — 점수/랭킹

## Current State
- 완성도: 90%
- 번들: 378KB gzip
- 테스트: 단위 26개 + E2E 6개
- 미해결: 30+ PNG 스크린샷 미추적, Tailwind 미적용

## Conventions
- Global CLAUDE.md 준수 (TypeScript strict, no any, early return, etc.)
- Supabase: `economic_sense_test` 스키마 전용 (public 금지)
- 커밋: conventional commits
- Git: feature branch → PR → merge (main 직접 커밋 금지)
