/**
 * 코인 서비스 - 인앱 화폐 관리
 *
 * 인앱 화폐: 코인
 * 교환비: 10코인 = 1P (토스포인트)
 *
 * 적립 경로:
 * - 게임 완료 (10문제): +5 코인
 * - 고티어 (S/SS): +10 코인
 * - 보상형 광고 시청: +20 코인
 * - 결과 공유: +5 코인
 */

const COIN_BALANCE_KEY = 'economic-sense-coin-balance';
const COIN_HISTORY_KEY = 'economic-sense-coin-history';

// --- 적립 상수 ---

export const COIN_REWARDS = {
  GAME_COMPLETE: 5,
  HIGH_TIER: 10,
  REWARDED_AD: 20,
  SHARE_RESULT: 5,
} as const;

export const EXCHANGE_RATE = 10; // 10코인 = 1P

// --- 코인 히스토리 ---

type CoinAction = 'game_complete' | 'high_tier' | 'rewarded_ad' | 'share_result' | 'exchange' | 'mission';

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

export function rewardShareResult(): number {
  return addCoins(COIN_REWARDS.SHARE_RESULT, 'share_result', '결과 공유 보상');
}

export function rewardMission(amount: number, description: string): number {
  return addCoins(amount, 'mission', description);
}
