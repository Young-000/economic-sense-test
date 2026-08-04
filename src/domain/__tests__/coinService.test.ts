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
      expect(COIN_REWARDS.GAME_COMPLETE).toBe(1);
      expect(COIN_REWARDS.HIGH_TIER).toBe(2);
      expect(COIN_REWARDS.REWARDED_AD).toBe(5);
      expect(COIN_REWARDS.SHARE_RESULT).toBe(1);
      expect(COIN_REWARDS.DAILY_LOGIN).toBe(3);
      expect(COIN_REWARDS.STREAK_3).toBe(1);
      expect(COIN_REWARDS.STREAK_7).toBe(1);
      expect(COIN_REWARDS.STREAK_14).toBe(2);
      expect(COIN_REWARDS.STREAK_30).toBe(3);
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
    it('should reward 1 coin per game', () => {
      rewardGameComplete();
      expect(getBalance()).toBe(1);
    });

    it('should reward high tier 2 coins', () => {
      rewardHighTier();
      expect(getBalance()).toBe(2);
    });

    it('should accumulate rewards', () => {
      rewardGameComplete();
      rewardHighTier();
      expect(getBalance()).toBe(3);
    });
  });

  describe('보상형 광고', () => {
    it('should reward 5 coins per ad', () => {
      rewardRewardedAd();
      expect(getBalance()).toBe(5);
    });
  });

  describe('일일 출석', () => {
    it('should reward 3 coins on first login', () => {
      const result = rewardDailyLogin();
      expect(result).not.toBeNull();
      expect(getBalance()).toBe(3);
    });

    it('should not reward twice on same day', () => {
      rewardDailyLogin();
      const second = rewardDailyLogin();
      expect(second).toBeNull();
      expect(getBalance()).toBe(3);
    });

    it('should track daily login status', () => {
      expect(hasDailyLoginToday()).toBe(false);
      rewardDailyLogin();
      expect(hasDailyLoginToday()).toBe(true);
    });
  });

  describe('일일 공유', () => {
    it('should reward 1 coin on first share', () => {
      rewardShareResult();
      expect(getBalance()).toBe(1);
    });

    it('should not reward twice on same day', () => {
      rewardShareResult();
      rewardShareResult();
      expect(getBalance()).toBe(1);
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

    it('should reward 1 coin for 3-day streak', () => {
      const result = rewardStreakBonus(3);
      expect(result).not.toBeNull();
      expect(getBalance()).toBe(1);
    });

    it('should reward 1 coin for 7-day streak', () => {
      const result = rewardStreakBonus(7);
      expect(result).not.toBeNull();
      expect(getBalance()).toBe(1);
    });

    it('should reward 2 coins for 14-day streak', () => {
      const result = rewardStreakBonus(14);
      expect(result).not.toBeNull();
      expect(getBalance()).toBe(2);
    });

    it('should reward 3 coins for 30-day streak', () => {
      const result = rewardStreakBonus(30);
      expect(result).not.toBeNull();
      expect(getBalance()).toBe(3);
    });

    it('should not reward twice on same day', () => {
      rewardStreakBonus(7);
      const second = rewardStreakBonus(7);
      expect(second).toBeNull();
      expect(getBalance()).toBe(1);
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

  describe('일일 시나리오 (v3 리밸런스: 광고 실단가 0.2원)', () => {
    /** 보상형 광고 1회 실수익 (2026-08-04 실측 최악값, 원) */
    const REVENUE_PER_REWARDED_AD_WON = 0.2;
    /** 지급 상한: 보상형 광고 수익의 50% (전면·배너 수익은 안전마진으로 남겨둔다) */
    const MAX_PAYOUT_RATIO = 0.5;

    /** 활발한 유저 하루치 적립 (3퀴즈 + 고티어 1 + 광고 5 + 공유 + 7일 스트릭) */
    function playActiveDay(): void {
      rewardDailyLogin();      // +3
      rewardStreakBonus(7);    // +1
      rewardGameComplete();    // +1
      rewardGameComplete();    // +1
      rewardGameComplete();    // +1
      rewardHighTier();        // +2
      rewardRewardedAd();      // +5
      rewardRewardedAd();      // +5
      rewardRewardedAd();      // +5
      rewardRewardedAd();      // +5
      rewardRewardedAd();      // +5
      rewardShareResult();     // +1
    }

    it('활발한 유저 하루 적립이 35코인이다', () => {
      playActiveDay();
      // 3 + 1 + 3 + 2 + 25 + 1 = 35
      expect(getBalance()).toBe(35);
    });

    it('활발한 유저 지급액이 광고 수익의 50%를 넘지 않는다', () => {
      playActiveDay();

      // 코인 → 원 (100코인 = 1P = 1원)
      const payoutWon = getBalance() / EXCHANGE_RATE;
      const revenueWon = 5 * REVENUE_PER_REWARDED_AD_WON;

      expect(payoutWon).toBeLessThanOrEqual(revenueWon * MAX_PAYOUT_RATIO);
    });

    it('미션 보상을 더해도 초기 며칠 적립이 65코인을 넘지 않는다', () => {
      playActiveDay();

      // 미션 달성: 6 + 6 + 8 + 10 = 30 (다양한 미션 조합)
      rewardMission(6, '개미 투자자 달성');
      rewardMission(6, '습관 투자자 달성');
      rewardMission(8, '큰손 투자자 달성');
      rewardMission(10, '슈퍼개미 달성');

      // 35 + 30 = 65
      expect(getBalance()).toBe(65);
    });
  });
});
