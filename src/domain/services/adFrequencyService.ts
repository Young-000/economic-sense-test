/**
 * 광고 빈도 제어 서비스
 * - 전면 광고: 게임 완료 시마다, 하루 최대 10회
 * - 보상형 광고: 최소 60초 간격, 하루 최대 15회
 */

const INTERSTITIAL_KEY = 'est-ad-interstitial-freq';
const REWARDED_KEY = 'est-ad-rewarded-freq';
const MAX_INTERSTITIAL_PER_DAY = 10;
const REWARDED_COOLDOWN_MS = 60 * 1000;
const MAX_REWARDED_PER_DAY = 15;

interface InterstitialData {
  gameCount: number;
  dailyShownCount: number;
  lastResetDate: string;
}

interface RewardedData {
  lastShownAt: number;
  dailyCount: number;
  lastResetDate: string;
}

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadInterstitialData(): InterstitialData {
  try {
    const stored = localStorage.getItem(INTERSTITIAL_KEY);
    if (stored) {
      const data: InterstitialData = JSON.parse(stored);
      if (data.lastResetDate !== getTodayStr()) {
        return { gameCount: 0, dailyShownCount: 0, lastResetDate: getTodayStr() };
      }
      return data;
    }
  } catch { /* fallback */ }
  return { gameCount: 0, dailyShownCount: 0, lastResetDate: getTodayStr() };
}

function saveInterstitialData(data: InterstitialData): void {
  localStorage.setItem(INTERSTITIAL_KEY, JSON.stringify(data));
}

export function incrementGameCount(): void {
  const data = loadInterstitialData();
  data.gameCount = data.gameCount + 1;
  saveInterstitialData(data);
}

export function shouldShowInterstitial(): boolean {
  const data = loadInterstitialData();
  return data.dailyShownCount < MAX_INTERSTITIAL_PER_DAY;
}

export function recordInterstitialShown(): void {
  const data = loadInterstitialData();
  data.gameCount = 0;
  data.dailyShownCount = data.dailyShownCount + 1;
  saveInterstitialData(data);
}

function loadRewardedData(): RewardedData {
  try {
    const stored = localStorage.getItem(REWARDED_KEY);
    if (stored) {
      const data: RewardedData = JSON.parse(stored);
      if (data.lastResetDate !== getTodayStr()) {
        return { lastShownAt: 0, dailyCount: 0, lastResetDate: getTodayStr() };
      }
      return data;
    }
  } catch { /* fallback */ }
  return { lastShownAt: 0, dailyCount: 0, lastResetDate: getTodayStr() };
}

function saveRewardedData(data: RewardedData): void {
  localStorage.setItem(REWARDED_KEY, JSON.stringify(data));
}

export function canShowRewardedAd(): boolean {
  const data = loadRewardedData();
  const now = Date.now();
  const cooldownOk = now - data.lastShownAt >= REWARDED_COOLDOWN_MS;
  return cooldownOk && data.dailyCount < MAX_REWARDED_PER_DAY;
}

export function recordRewardedAdShown(): void {
  const data = loadRewardedData();
  data.lastShownAt = Date.now();
  data.dailyCount = data.dailyCount + 1;
  saveRewardedData(data);
}

export function getRemainingRewardedAds(): number {
  const data = loadRewardedData();
  return Math.max(0, MAX_REWARDED_PER_DAY - data.dailyCount);
}
