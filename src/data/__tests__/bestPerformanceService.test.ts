/**
 * 최고 성적 서비스 테스트
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getBestPerformance,
  updateBestPerformance,
  createAssetHistory,
  clearBestPerformance,
  generateSampleBestPerformance,
  type BestPerformanceData,
} from '../bestPerformanceService';
import { GAME_CONFIG } from '@domain/entities';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('Best Performance Service', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('getBestPerformance', () => {
    it('should return null when no data stored', () => {
      const result = getBestPerformance();
      expect(result).toBeNull();
    });

    it('should return stored data', () => {
      const mockData: BestPerformanceData = {
        history: [{ round: 0, balance: 10_000_000 }],
        totalReturn: 25.5,
        achievedAt: '2024-01-01T00:00:00Z',
        investorType: 'smart_winner',
      };
      localStorage.setItem('economic_best_performance', JSON.stringify(mockData));

      const result = getBestPerformance();
      expect(result).toEqual(mockData);
    });

    it('should return null for invalid JSON', () => {
      localStorage.setItem('economic_best_performance', 'invalid json');

      const result = getBestPerformance();
      expect(result).toBeNull();
    });
  });

  describe('updateBestPerformance', () => {
    it('should save new record when no existing data', () => {
      const history = [
        { round: 0, balance: 10_000_000 },
        { round: 1, balance: 10_500_000 },
      ];

      const result = updateBestPerformance(history, 5.0, 'steady_grower');

      expect(result).toBe(true);
      const stored = getBestPerformance();
      expect(stored?.totalReturn).toBe(5.0);
      expect(stored?.investorType).toBe('steady_grower');
    });

    it('should update when new return is higher', () => {
      // 기존 기록 저장
      const oldData: BestPerformanceData = {
        history: [{ round: 0, balance: 10_000_000 }],
        totalReturn: 10.0,
        achievedAt: '2024-01-01T00:00:00Z',
      };
      localStorage.setItem('economic_best_performance', JSON.stringify(oldData));

      // 더 높은 기록으로 업데이트
      const newHistory = [
        { round: 0, balance: 10_000_000 },
        { round: 1, balance: 12_000_000 },
      ];
      const result = updateBestPerformance(newHistory, 20.0);

      expect(result).toBe(true);
      const stored = getBestPerformance();
      expect(stored?.totalReturn).toBe(20.0);
    });

    it('should not update when new return is lower', () => {
      // 기존 기록 저장
      const oldData: BestPerformanceData = {
        history: [{ round: 0, balance: 10_000_000 }],
        totalReturn: 30.0,
        achievedAt: '2024-01-01T00:00:00Z',
      };
      localStorage.setItem('economic_best_performance', JSON.stringify(oldData));

      // 더 낮은 기록으로 업데이트 시도
      const newHistory = [{ round: 0, balance: 10_000_000 }];
      const result = updateBestPerformance(newHistory, 10.0);

      expect(result).toBe(false);
      const stored = getBestPerformance();
      expect(stored?.totalReturn).toBe(30.0);
    });

    it('should update when new return equals existing (edge case)', () => {
      const oldData: BestPerformanceData = {
        history: [{ round: 0, balance: 10_000_000 }],
        totalReturn: 10.0,
        achievedAt: '2024-01-01T00:00:00Z',
      };
      localStorage.setItem('economic_best_performance', JSON.stringify(oldData));

      // 동일한 기록은 업데이트 안됨 (> 조건)
      const result = updateBestPerformance([], 10.0);
      expect(result).toBe(false);
    });
  });

  describe('createAssetHistory', () => {
    it('should create history with initial balance', () => {
      const results: { actualOutcome: number }[] = [];
      const history = createAssetHistory(results);

      expect(history).toHaveLength(1);
      expect(history[0]).toEqual({ round: 0, balance: GAME_CONFIG.INITIAL_BALANCE });
    });

    it('should accumulate outcomes correctly', () => {
      const results = [
        { actualOutcome: 500_000 },
        { actualOutcome: -200_000 },
        { actualOutcome: 300_000 },
      ];
      const history = createAssetHistory(results);

      expect(history).toHaveLength(4);
      expect(history[0].balance).toBe(10_000_000);
      expect(history[1].balance).toBe(10_500_000);
      expect(history[2].balance).toBe(10_300_000);
      expect(history[3].balance).toBe(10_600_000);
    });

    it('should use custom initial balance', () => {
      const results = [{ actualOutcome: 100_000 }];
      const history = createAssetHistory(results, 5_000_000);

      expect(history[0].balance).toBe(5_000_000);
      expect(history[1].balance).toBe(5_100_000);
    });

    it('should handle negative outcomes', () => {
      const results = [
        { actualOutcome: -1_000_000 },
        { actualOutcome: -500_000 },
      ];
      const history = createAssetHistory(results);

      expect(history[2].balance).toBe(8_500_000);
    });
  });

  describe('clearBestPerformance', () => {
    it('should remove stored data', () => {
      const mockData: BestPerformanceData = {
        history: [],
        totalReturn: 10.0,
        achievedAt: '2024-01-01T00:00:00Z',
      };
      localStorage.setItem('economic_best_performance', JSON.stringify(mockData));

      clearBestPerformance();

      expect(getBestPerformance()).toBeNull();
    });

    it('should not throw when no data exists', () => {
      expect(() => clearBestPerformance()).not.toThrow();
    });
  });

  describe('generateSampleBestPerformance', () => {
    it('should generate valid sample data', () => {
      const sample = generateSampleBestPerformance();

      expect(sample.history).toBeDefined();
      expect(sample.history.length).toBe(GAME_CONFIG.TOTAL_ROUNDS + 1);
      expect(sample.totalReturn).toBeGreaterThan(0);
      expect(sample.achievedAt).toBeDefined();
      expect(sample.investorType).toBe('smart_winner');
    });

    it('should start with initial balance', () => {
      const sample = generateSampleBestPerformance();

      expect(sample.history[0].round).toBe(0);
      expect(sample.history[0].balance).toBe(GAME_CONFIG.INITIAL_BALANCE);
    });

    it('should have increasing balances (sample is always positive)', () => {
      const sample = generateSampleBestPerformance();

      for (let i = 1; i < sample.history.length; i++) {
        expect(sample.history[i].balance).toBeGreaterThan(sample.history[i - 1].balance);
      }
    });

    it('should calculate totalReturn correctly', () => {
      const sample = generateSampleBestPerformance();
      const initialBalance = GAME_CONFIG.INITIAL_BALANCE;
      const finalBalance = sample.history[sample.history.length - 1].balance;
      const expectedReturn = ((finalBalance - initialBalance) / initialBalance) * 100;

      expect(Math.abs(sample.totalReturn - expectedReturn)).toBeLessThan(0.01);
    });
  });
});
