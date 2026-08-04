/**
 * 코인 서비스 - 인앱 화폐 관리
 *
 * 인앱 화폐: 코인
 * 교환비: 100코인 = 1P (토스포인트)
 *
 * 경제 모델 (v2 리밸런스):
 * - 무료: 최대 2P/일 = 200코인
 *   - 출석 30 + 게임 20x3 + 고티어 20 + 공유 15 + 스트릭 ~15 + 일일목표 50 = ~190
 * - 광고 5회: 추가 8P = 800코인
 *   - 100x5 = 500 + 추가 게임/미션 ~300 = ~800
 * - 총합: 최대 10P/일 = 1000코인
 */

const COIN_BALANCE_KEY = 'economic-sense-coin-balance';
const COIN_HISTORY_KEY = 'economic-sense-coin-history';
const DAILY_LOGIN_KEY = 'economic-sense-daily-login';
const DAILY_SHARE_KEY = 'economic-sense-daily-share';
const DAILY_STREAK_KEY = 'economic-sense-daily-streak';

// --- 적립 상수 ---

/**
 * 코인 지급량 (v3 리밸런스, 2026-08-04)
 *
 * 보상형 광고 실단가가 0.2원까지 하락해 v2(3원 가정)는 광고 1회당 0.8원 역마진이었다.
 * 환원율 목표 = 광고 수익의 25%. 광고 1회 = 5코인(0.05원), 무료 경로 일 총합 ≈ 10코인.
 */
export const COIN_REWARDS = {
  GAME_COMPLETE: 1,    // 기본 (손실이어도 지급)
  HIGH_TIER: 2,
  REWARDED_AD: 5,
  SHARE_RESULT: 1,
  DAILY_LOGIN: 3,
  STREAK_3: 1,
  STREAK_7: 1,
  STREAK_14: 2,
  STREAK_30: 3,
} as const;

/** 수익률 기반 성과 보상 (레인지 구간) */
export const PERFORMANCE_REWARDS = [
  { minReturn: 30,  coins: 5, label: '대박' },
  { minReturn: 10,  coins: 4, label: '고수익' },
  { minReturn: 0,   coins: 2, label: '수익' },
  { minReturn: -10, coins: 1, label: '선방' },
  { minReturn: -Infinity, coins: 1, label: '기본' },
] as const;

/** 수익률에 따른 성과 코인 계산 */
export function getPerformanceReward(totalReturn: number): { coins: number; label: string } {
  for (const tier of PERFORMANCE_REWARDS) {
    if (totalReturn >= tier.minReturn) {
      return { coins: tier.coins, label: tier.label };
    }
  }
  return { coins: 1, label: '기본' };
}

export const EXCHANGE_RATE = 100; // 100코인 = 1P

// --- 코인 히스토리 ---

type CoinAction =
  | 'game_complete'
  | 'high_tier'
  | 'rewarded_ad'
  | 'share_result'
  | 'exchange'
  | 'mission'
  | 'daily_login'
  | 'streak_bonus';

interface CoinHistoryEntry {
  action: CoinAction;
  amount: number;
  timestamp: number;
  description: string;
}

// --- 잔액 관리 ---

export function getBalance(): number {
  try {
    const stored = localStorage.getItem(COIN_BALANCE_KEY);
    if (stored) {
      const balance = Number(stored);
      return Number.isFinite(balance) ? Math.max(0, balance) : 0;
    }
  } catch { /* fallback */ }
  return 0;
}

function setBalance(balance: number): void {
  try {
    localStorage.setItem(COIN_BALANCE_KEY, String(Math.max(0, Math.floor(balance))));
  } catch { /* localStorage 실패 */ }
}

export function addCoins(amount: number, action: CoinAction, description: string): number {
  if (amount <= 0) return getBalance();

  const currentBalance = getBalance();
  const newBalance = currentBalance + amount;
  setBalance(newBalance);
  addHistory({ action, amount, timestamp: Date.now(), description });
  return newBalance;
}

export function deductCoins(amount: number, action: CoinAction, description: string): boolean {
  const currentBalance = getBalance();
  if (currentBalance < amount) return false;

  const newBalance = currentBalance - amount;
  setBalance(newBalance);
  addHistory({ action, amount: -amount, timestamp: Date.now(), description });
  return true;
}

// --- 교환 ---

export function getExchangeablePoints(): number {
  return Math.floor(getBalance() / EXCHANGE_RATE);
}

export function exchangeCoinsForPoints(pointsToExchange: number): { coinsSpent: number; pointsGained: number } | null {
  const coinsNeeded = pointsToExchange * EXCHANGE_RATE;
  if (coinsNeeded <= 0 || getBalance() < coinsNeeded) return null;

  const success = deductCoins(coinsNeeded, 'exchange', `${pointsToExchange}P 교환`);
  if (!success) return null;

  return { coinsSpent: coinsNeeded, pointsGained: pointsToExchange };
}

// --- 히스토리 ---

function addHistory(entry: CoinHistoryEntry): void {
  try {
    const stored = localStorage.getItem(COIN_HISTORY_KEY);
    const history: CoinHistoryEntry[] = stored ? JSON.parse(stored) : [];
    history.push(entry);
    // 최근 100개만 유지
    const trimmed = history.slice(-100);
    localStorage.setItem(COIN_HISTORY_KEY, JSON.stringify(trimmed));
  } catch { /* fallback */ }
}

export function getHistory(): CoinHistoryEntry[] {
  try {
    const stored = localStorage.getItem(COIN_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// --- 편의 함수 ---

export function rewardGameComplete(): number {
  return addCoins(COIN_REWARDS.GAME_COMPLETE, 'game_complete', '게임 완료 보상');
}

export function rewardHighTier(): number {
  return addCoins(COIN_REWARDS.HIGH_TIER, 'high_tier', '고티어(S/SS) 보너스');
}

export function rewardRewardedAd(): number {
  return addCoins(COIN_REWARDS.REWARDED_AD, 'rewarded_ad', '광고 시청 보상');
}

export function rewardMission(amount: number, description: string): number {
  return addCoins(amount, 'mission', description);
}

// --- 일일 출석 ---

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function hasDailyLoginToday(): boolean {
  try {
    return localStorage.getItem(DAILY_LOGIN_KEY) === getTodayStr();
  } catch {
    return false;
  }
}

export function rewardDailyLogin(): number | null {
  if (hasDailyLoginToday()) return null;

  try {
    localStorage.setItem(DAILY_LOGIN_KEY, getTodayStr());
  } catch { /* ignore */ }

  return addCoins(COIN_REWARDS.DAILY_LOGIN, 'daily_login', '일일 출석 보상');
}

// --- 일일 공유 (1회 제한) ---

export function hasDailyShareToday(): boolean {
  try {
    return localStorage.getItem(DAILY_SHARE_KEY) === getTodayStr();
  } catch {
    return false;
  }
}

export function rewardShareResult(): number {
  if (hasDailyShareToday()) return getBalance();

  try {
    localStorage.setItem(DAILY_SHARE_KEY, getTodayStr());
  } catch { /* ignore */ }

  return addCoins(COIN_REWARDS.SHARE_RESULT, 'share_result', '결과 공유 보상');
}

// --- 스트릭 보너스 (일 1회) ---

function hasStreakBonusToday(): boolean {
  try {
    return localStorage.getItem(DAILY_STREAK_KEY) === getTodayStr();
  } catch {
    return false;
  }
}

export function rewardStreakBonus(streak: number): number | null {
  if (hasStreakBonusToday()) return null;
  if (streak < 3) return null;

  try {
    localStorage.setItem(DAILY_STREAK_KEY, getTodayStr());
  } catch { /* ignore */ }

  if (streak >= 30) {
    return addCoins(COIN_REWARDS.STREAK_30, 'streak_bonus', '30일 연속 도전 보너스');
  }
  if (streak >= 14) {
    return addCoins(COIN_REWARDS.STREAK_14, 'streak_bonus', '14일 연속 도전 보너스');
  }
  if (streak >= 7) {
    return addCoins(COIN_REWARDS.STREAK_7, 'streak_bonus', '7일 연속 도전 보너스');
  }
  return addCoins(COIN_REWARDS.STREAK_3, 'streak_bonus', '3일 연속 도전 보너스');
}

// --- 일일 목표 (오늘의 퀴즈 3회 = 100코인) ---

const DAILY_GOAL_KEY = 'economic-sense-daily-goal';
const DAILY_GAME_COUNT_KEY = 'economic-sense-daily-game-count';

export const DAILY_GOAL_TARGET = 3;
export const DAILY_GOAL_REWARD = 50;

export function getDailyGameCount(): number {
  try {
    const stored = localStorage.getItem(DAILY_GAME_COUNT_KEY);
    if (!stored) return 0;
    const data = JSON.parse(stored) as { date: string; count: number };
    if (data.date !== getTodayStr()) return 0;
    return data.count;
  } catch {
    return 0;
  }
}

export function incrementDailyGameCount(): number {
  const today = getTodayStr();
  const current = getDailyGameCount();
  const next = current + 1;
  try {
    localStorage.setItem(DAILY_GAME_COUNT_KEY, JSON.stringify({ date: today, count: next }));
  } catch { /* ignore */ }
  return next;
}

export function hasDailyGoalToday(): boolean {
  try {
    return localStorage.getItem(DAILY_GOAL_KEY) === getTodayStr();
  } catch {
    return false;
  }
}

export function rewardDailyGoal(): number | null {
  if (hasDailyGoalToday()) return null;
  if (getDailyGameCount() < DAILY_GOAL_TARGET) return null;

  try {
    localStorage.setItem(DAILY_GOAL_KEY, getTodayStr());
  } catch { /* ignore */ }

  return addCoins(DAILY_GOAL_REWARD, 'daily_login', '오늘의 퀴즈 3회 달성 보너스');
}
