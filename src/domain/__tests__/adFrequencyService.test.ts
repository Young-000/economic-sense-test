/**
 * adFrequencyService 광고 빈도 제어 테스트
 *
 * 보상형 광고: 최대 5회/일 (100코인/회)
 * 전면 광고: 최대 10회/일
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  shouldShowInterstitial,
  recordInterstitialShown,
  canShowRewardedAd,
  recordRewardedAdShown,
  getRemainingRewardedAds,
  incrementGameCount,
} from '../services/adFrequencyService';

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

describe('adFrequencyService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('전면 광고', () => {
    it('should allow interstitial on first visit', () => {
      expect(shouldShowInterstitial()).toBe(true);
    });

    it('should block after 10 interstitials', () => {
      for (let i = 0; i < 10; i++) {
        recordInterstitialShown();
      }
      expect(shouldShowInterstitial()).toBe(false);
    });

    it('should allow up to 10 interstitials', () => {
      for (let i = 0; i < 9; i++) {
        recordInterstitialShown();
      }
      expect(shouldShowInterstitial()).toBe(true);
    });
  });

  describe('보상형 광고', () => {
    it('should allow rewarded ad on first visit', () => {
      expect(canShowRewardedAd()).toBe(true);
    });

    it('should have 5 remaining ads initially', () => {
      expect(getRemainingRewardedAds()).toBe(5);
    });

    it('should decrement remaining ads', () => {
      recordRewardedAdShown();
      expect(getRemainingRewardedAds()).toBe(4);
    });

    it('should block after 5 rewarded ads', () => {
      for (let i = 0; i < 5; i++) {
        recordRewardedAdShown();
      }
      expect(canShowRewardedAd()).toBe(false);
      expect(getRemainingRewardedAds()).toBe(0);
    });

    it('should enforce cooldown between ads', () => {
      recordRewardedAdShown();
      // Immediately after showing, cooldown not met
      expect(canShowRewardedAd()).toBe(false);
    });
  });

  describe('게임 카운트', () => {
    it('should increment game count', () => {
      incrementGameCount();
      // No direct getter exposed, but shouldn't throw
    });
  });
});
