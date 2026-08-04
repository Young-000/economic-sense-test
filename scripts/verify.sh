#!/usr/bin/env bash
# scripts/verify.sh — 야간 자율 사이클 검증 게이트
# 사용법: bash scripts/verify.sh
# 출력: 마지막 줄 'VERIFY: GREEN' (exit 0) 또는 'VERIFY: RED' (exit 1)

set -euo pipefail
cd "$(dirname "$0")/.."

FAIL=0

run_step() {
  local name="$1"
  shift
  echo "==> [$name] $*"
  if "$@"; then
    echo "[OK] $name"
  else
    echo "[FAIL] $name"
    FAIL=1
  fi
  echo ""
}

# 1. typecheck
run_step "typecheck" npm run typecheck

# 2. lint
run_step "lint" npm run lint

# 3. test (run 모드 — watch 금지)
run_step "test" npm run test -- run

# 4. build
run_step "build" npm run build

# 최종 결과
if [ "$FAIL" -eq 0 ]; then
  echo "VERIFY: GREEN"
  exit 0
else
  echo "VERIFY: RED"
  exit 1
fi
