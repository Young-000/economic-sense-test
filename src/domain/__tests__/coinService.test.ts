/**
 * coinService 경제 시스템 테스트
 *
 * 일일 목표: ~1000코인 = ~10P (적극 사용자 기준)
 * 교환비: 100코인 = 1P
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  COIN_REWARDS,
  EXCHANGE_RATE,
  getBalance,
  addCoins,
  deductCoins,
  rewardGameComplete,
  rewardHighTier,
  rewardRewardedAd,
  rewardShareResult,
  rewardMission,
  rewardDailyLogin,
  rewardStreakBonus,
  hasDailyLoginToday,
  hasDailyShareToday,
  getExchangeablePoints,
  exchangeCoinsForPoints,
  getHistory,
} from '../services/coinService';

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    clear: vi.fn(() => { store = {}; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    get length() { return Object.keys(store).length; },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('coinService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('보상 상수', () => {
    it('should have correct reward values', () => {
      expect(COIN_REWARDS.GAME_COMPLETE).toBe(20);
      expect(COIN_REWARDS.HIGH_TIER).toBe(20);
      expect(COIN_REWARDS.REWARDED_AD).toBe(100);
      expect(COIN_REWARDS.SHARE_RESULT).toBe(15);
      expect(COIN_REWARDS.DAILY_LOGIN).toBe(30);
      expect(COIN_REWARDS.STREAK_3).toBe(5);
      expect(COIN_REWARDS.STREAK_7).toBe(10);
      expect(COIN_REWARDS.STREAK_14).toBe(20);
      expect(COIN_REWARDS.STREAK_30).toBe(30);
    });

    it('should have exchange rate of 100 coins = 1P', () => {
      expect(EXCHANGE_RATE).toBe(100);
    });
  });

  describe('잔액 관리', () => {
    it('should start with 0 balance', () => {
      expect(getBalance()).toBe(0);
    });

    it('should add coins correctly', () => {
      addCoins(100, 'game_complete', 'test');
      expect(getBalance()).toBe(100);
    });

    it('should not add negative coins', () => {
      addCoins(100, 'game_complete', 'test');
      addCoins(-50, 'game_complete', 'negative test');
      expect(getBalance()).toBe(100);
    });

    it('should deduct coins correctly', () => {
      addCoins(200, 'game_complete', 'test');
      const result = deductCoins(50, 'exchange', 'test');
      expect(result).toBe(true);
      expect(getBalance()).toBe(150);
    });

    it('should not deduct more than balance', () => {
      addCoins(50, 'game_complete', 'test');
      const result = deductCoins(100, 'exchange', 'test');
      expect(result).toBe(false);
      expect(getBalance()).toBe(50);
    });
  });

  describe('게임 완료 보상', () => {
    it('should reward 20 coins per game', () => {
      rewardGameComplete();
      expect(getBalance()).toBe(20);
    });

    it('should reward high tier 20 coins', () => {
      rewardHighTier();
      expect(getBalance()).toBe(20);
    });

    it('should accumulate rewards', () => {
      rewardGameComplete();
      rewardHighTier();
      expect(getBalance()).toBe(40);
    });
  });

  describe('보상형 광고', () => {
    it('should reward 100 coins per ad', () => {
      rewardRewardedAd();
      expect(getBalance()).toBe(100);
    });
  });

  describe('일일 출석', () => {
    it('should reward 30 coins on first login', () => {
      const result = rewardDailyLogin();
      expect(result).not.toBeNull();
      expect(getBalance()).toBe(30);
    });

    it('should not reward twice on same day', () => {
      rewardDailyLogin();
      const second = rewardDailyLogin();
      expect(second).toBeNull();
      expect(getBalance()).toBe(30);
    });

    it('should track daily login status', () => {
      expect(hasDailyLoginToday()).toBe(false);
      rewardDailyLogin();
      expect(hasDailyLoginToday()).toBe(true);
    });
  });

  describe('일일 공유', () => {
    it('should reward 15 coins on first share', () => {
      rewardShareResult();
      expect(getBalance()).toBe(15);
    });

    it('should not reward twice on same day', () => {
      rewardShareResult();
      rewardShareResult();
      expect(getBalance()).toBe(15);
    });

    it('should track daily share status', () => {
      expect(hasDailyShareToday()).toBe(false);
      rewardShareResult();
      expect(hasDailyShareToday()).toBe(true);
    });
  });

  describe('스트릭 보너스', () => {
    it('should not reward for streak < 3', () => {
      const result = rewardStreakBonus(2);
      expect(result).toBeNull();
      expect(getBalance()).toBe(0);
    });

    it('should reward 5 coins for 3-day streak', () => {
      const result = rewardStreakBonus(3);
      expect(result).not.toBeNull();
      expect(getBalance()).toBe(5);
    });

    it('should reward 10 coins for 7-day streak', () => {
      const result = rewardStreakBonus(7);
      expect(result).not.toBeNull();
      expect(getBalance()).toBe(10);
    });

    it('should reward 20 coins for 14-day streak', () => {
      const result = rewardStreakBonus(14);
      expect(result).not.toBeNull();
      expect(getBalance()).toBe(20);
    });

    it('should reward 30 coins for 30-day streak', () => {
      const result = rewardStreakBonus(30);
      expect(result).not.toBeNull();
      expect(getBalance()).toBe(30);
    });

    it('should not reward twice on same day', () => {
      rewardStreakBonus(7);
      const second = rewardStreakBonus(7);
      expect(second).toBeNull();
      expect(getBalance()).toBe(10);
    });
  });

  describe('미션 보상', () => {
    it('should reward arbitrary mission amount', () => {
      rewardMission(80, 'test mission');
      expect(getBalance()).toBe(80);
    });
  });

  describe('교환', () => {
    it('should calculate exchangeable points', () => {
      addCoins(350, 'game_complete', 'test');
      expect(getExchangeablePoints()).toBe(3);
    });

    it('should exchange coins for points', () => {
      addCoins(500, 'game_complete', 'test');
      const result = exchangeCoinsForPoints(3);
      expect(result).toEqual({ coinsSpent: 300, pointsGained: 3 });
      expect(getBalance()).toBe(200);
    });

    it('should fail if insufficient balance', () => {
      addCoins(50, 'game_complete', 'test');
      const result = exchangeCoinsForPoints(1);
      expect(result).toBeNull();
      expect(getBalance()).toBe(50);
    });
  });

  describe('히스토리', () => {
    it('should record history entries', () => {
      rewardGameComplete();
      rewardDailyLogin();
      const history = getHistory();
      expect(history).toHaveLength(2);
      expect(history[0].action).toBe('game_complete');
      expect(history[1].action).toBe('daily_login');
    });
  });

  describe('일일 시나리오 (v2 리밸런스: 무료 2P + 광고5회 8P = 10P)', () => {
    it('should reach ~595 coins for active user (3 quizzes, 5 ads, share, 7-day streak)', () => {
      // 일일 출석: +30
      rewardDailyLogin();

      // 스트릭 보너스 (7일): +10
      rewardStreakBonus(7);

      // 3 퀴즈 완료: 3 x 20 = +60
      rewardGameComplete();
      rewardGameComplete();
      rewardGameComplete();

      // 1 고티어: +20
      rewardHighTier();

      // 5 보상형 광고: 5 x 100 = +500
      rewardRewardedAd();
      rewardRewardedAd();
      rewardRewardedAd();
      rewardRewardedAd();
      rewardRewardedAd();

      // 1 공유: +15
      rewardShareResult();

      const balance = getBalance();
      // 30 + 10 + 60 + 20 + 500 + 15 = 635
      expect(balance).toBe(635);
      expect(Math.floor(balance / EXCHANGE_RATE)).toBe(6);
    });

    it('should reach ~1000 coins with missions + daily goal on early days', () => {
      // 일일 출석: +30
      rewardDailyLogin();

      // 스트릭 보너스 (7일): +10
      rewardStreakBonus(7);

      // 3 퀴즈 완료: 3 x 20 = +60
      rewardGameComplete();
      rewardGameComplete();
      rewardGameComplete();

      // 1 고티어: +20
      rewardHighTier();

      // 5 보상형 광고: 5 x 100 = +500
      rewardRewardedAd();
      rewardRewardedAd();
      rewardRewardedAd();
      rewardRewardedAd();
      rewardRewardedAd();

      // 1 공유: +15
      rewardShareResult();

      // 미션 달성: 60 + 60 + 80 + 100 = 300 (다양한 미션 조합)
      rewardMission(60, '개미 투자자 달성');
      rewardMission(60, '습관 투자자 달성');
      rewardMission(80, '큰손 투자자 달성');
      rewardMission(100, '슈퍼개미 달성');

      const balance = getBalance();
      // 635 + 300 = 935
      expect(balance).toBe(935);
      expect(Math.floor(balance / EXCHANGE_RATE)).toBe(9);
    });
  });
});
