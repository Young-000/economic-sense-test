/**
 * 업적 시스템 테스트
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  ACHIEVEMENTS,
  getUnlockedAchievements,
  checkAndUnlockAchievements,
  getAchievementStatus,
  clearAchievements,
  calculateGameStats,
  type GameStats,
} from '../achievementService';

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

describe('Achievement Service', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('ACHIEVEMENTS', () => {
    it('should have at least 10 achievements defined', () => {
      expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(10);
    });

    it('should have unique IDs for all achievements', () => {
      const ids = ACHIEVEMENTS.map((a) => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all required properties for each achievement', () => {
      for (const achievement of ACHIEVEMENTS) {
        expect(achievement.id).toBeDefined();
        expect(achievement.name).toBeDefined();
        expect(achievement.description).toBeDefined();
        expect(achievement.emoji).toBeDefined();
        expect(typeof achievement.condition).toBe('function');
      }
    });
  });

  describe('getUnlockedAchievements', () => {
    it('should return empty array when no achievements unlocked', () => {
      const result = getUnlockedAchievements();
      expect(result).toEqual([]);
    });

    it('should return stored achievements', () => {
      const achievements = [
        { id: 'first_game', unlockedAt: '2024-01-01T00:00:00Z' },
      ];
      localStorage.setItem('economic-sense-achievements', JSON.stringify(achievements));

      const result = getUnlockedAchievements();
      expect(result).toEqual(achievements);
    });

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem('economic-sense-achievements', 'invalid json');

      const result = getUnlockedAchievements();
      expect(result).toEqual([]);
    });
  });

  describe('checkAndUnlockAchievements', () => {
    const createStats = (overrides: Partial<GameStats> = {}): GameStats => ({
      totalReturn: 0,
      winStreak: 0,
      loseStreak: 0,
      totalGames: 1,
      positiveRounds: 5,
      negativeRounds: 5,
      riskScore: 50,
      rationalityScore: 50,
      luckScore: 0,
      ...overrides,
    });

    it('should unlock first_game achievement on first game', () => {
      const stats = createStats({ totalGames: 1 });
      const newlyUnlocked = checkAndUnlockAchievements(stats);

      expect(newlyUnlocked.some((a) => a.id === 'first_game')).toBe(true);
    });

    it('should unlock golden_touch for 50%+ return', () => {
      const stats = createStats({ totalReturn: 55, totalGames: 1 });
      const newlyUnlocked = checkAndUnlockAchievements(stats);

      expect(newlyUnlocked.some((a) => a.id === 'golden_touch')).toBe(true);
    });

    it('should unlock survivor for no negative rounds', () => {
      const stats = createStats({ negativeRounds: 0, totalGames: 1 });
      const newlyUnlocked = checkAndUnlockAchievements(stats);

      expect(newlyUnlocked.some((a) => a.id === 'survivor')).toBe(true);
    });

    it('should unlock risk_taker for 70%+ risk score', () => {
      const stats = createStats({ riskScore: 75, totalGames: 1 });
      const newlyUnlocked = checkAndUnlockAchievements(stats);

      expect(newlyUnlocked.some((a) => a.id === 'risk_taker')).toBe(true);
    });

    it('should unlock calculator for 80%+ rationality score', () => {
      const stats = createStats({ rationalityScore: 85, totalGames: 1 });
      const newlyUnlocked = checkAndUnlockAchievements(stats);

      expect(newlyUnlocked.some((a) => a.id === 'calculator')).toBe(true);
    });

    it('should unlock on_fire for 5+ win streak', () => {
      const stats = createStats({ winStreak: 5, totalGames: 1 });
      const newlyUnlocked = checkAndUnlockAchievements(stats);

      expect(newlyUnlocked.some((a) => a.id === 'on_fire')).toBe(true);
    });

    it('should unlock comeback_king for 3+ lose streak with positive return', () => {
      const stats = createStats({ loseStreak: 3, totalReturn: 10, totalGames: 1 });
      const newlyUnlocked = checkAndUnlockAchievements(stats);

      expect(newlyUnlocked.some((a) => a.id === 'comeback_king')).toBe(true);
    });

    it('should unlock lucky_star for 50+ luck score', () => {
      const stats = createStats({ luckScore: 55, totalGames: 1 });
      const newlyUnlocked = checkAndUnlockAchievements(stats);

      expect(newlyUnlocked.some((a) => a.id === 'lucky_star')).toBe(true);
    });

    it('should unlock veteran for 10+ games', () => {
      const stats = createStats({ totalGames: 10 });
      const newlyUnlocked = checkAndUnlockAchievements(stats);

      expect(newlyUnlocked.some((a) => a.id === 'veteran')).toBe(true);
    });

    it('should unlock perfect_ten for 10 win streak', () => {
      const stats = createStats({ winStreak: 10, totalGames: 1 });
      const newlyUnlocked = checkAndUnlockAchievements(stats);

      expect(newlyUnlocked.some((a) => a.id === 'perfect_ten')).toBe(true);
    });

    it('should not unlock same achievement twice', () => {
      const stats = createStats({ totalGames: 1 });

      const first = checkAndUnlockAchievements(stats);
      const second = checkAndUnlockAchievements(stats);

      const firstGameFirst = first.filter((a) => a.id === 'first_game').length;
      const firstGameSecond = second.filter((a) => a.id === 'first_game').length;

      expect(firstGameFirst).toBe(1);
      expect(firstGameSecond).toBe(0);
    });

    it('should save newly unlocked achievements to localStorage', () => {
      const stats = createStats({ totalGames: 1 });
      checkAndUnlockAchievements(stats);

      const stored = getUnlockedAchievements();
      expect(stored.some((a) => a.id === 'first_game')).toBe(true);
    });
  });

  describe('getAchievementStatus', () => {
    it('should return total and unlocked count', () => {
      const status = getAchievementStatus();

      expect(status.total).toBe(ACHIEVEMENTS.length);
      expect(status.unlocked).toBe(0);
    });

    it('should include isUnlocked status for each achievement', () => {
      // Unlock one achievement
      checkAndUnlockAchievements({
        totalReturn: 0,
        winStreak: 0,
        loseStreak: 0,
        totalGames: 1,
        positiveRounds: 5,
        negativeRounds: 5,
        riskScore: 50,
        rationalityScore: 50,
        luckScore: 0,
      });

      const status = getAchievementStatus();

      expect(status.unlocked).toBeGreaterThan(0);
      expect(status.achievements.find((a) => a.id === 'first_game')?.isUnlocked).toBe(true);
    });
  });

  describe('clearAchievements', () => {
    it('should remove all achievements from localStorage', () => {
      checkAndUnlockAchievements({
        totalReturn: 0,
        winStreak: 0,
        loseStreak: 0,
        totalGames: 1,
        positiveRounds: 5,
        negativeRounds: 5,
        riskScore: 50,
        rationalityScore: 50,
        luckScore: 0,
      });

      expect(getUnlockedAchievements().length).toBeGreaterThan(0);

      clearAchievements();

      expect(getUnlockedAchievements().length).toBe(0);
    });
  });

  describe('calculateGameStats', () => {
    it('should calculate win streak correctly', () => {
      const results = [
        { actualOutcome: 100000, expectedValue: 100000 },
        { actualOutcome: 100000, expectedValue: 100000 },
        { actualOutcome: 100000, expectedValue: 100000 },
        { actualOutcome: -50000, expectedValue: 0 },
        { actualOutcome: 100000, expectedValue: 100000 },
      ];

      const stats = calculateGameStats(results, 50, 50, 0, 1);

      expect(stats.winStreak).toBe(3);
    });

    it('should calculate lose streak correctly', () => {
      const results = [
        { actualOutcome: 100000, expectedValue: 100000 },
        { actualOutcome: -50000, expectedValue: 0 },
        { actualOutcome: -50000, expectedValue: 0 },
        { actualOutcome: -50000, expectedValue: 0 },
        { actualOutcome: 100000, expectedValue: 100000 },
      ];

      const stats = calculateGameStats(results, 50, 50, 0, 1);

      expect(stats.loseStreak).toBe(3);
    });

    it('should calculate total return as percentage', () => {
      const results = [
        { actualOutcome: 1000000, expectedValue: 1000000 }, // +100만
        { actualOutcome: 500000, expectedValue: 500000 },   // +50만
      ];

      const stats = calculateGameStats(results, 50, 50, 0, 1);

      // 1000만원 기준 150만원 = 15%
      expect(stats.totalReturn).toBe(15);
    });

    it('should count positive and negative rounds', () => {
      const results = [
        { actualOutcome: 100000, expectedValue: 100000 },
        { actualOutcome: -50000, expectedValue: 0 },
        { actualOutcome: 0, expectedValue: 0 },
        { actualOutcome: 100000, expectedValue: 100000 },
        { actualOutcome: -50000, expectedValue: 0 },
      ];

      const stats = calculateGameStats(results, 50, 50, 0, 1);

      expect(stats.positiveRounds).toBe(3); // 0 counts as positive
      expect(stats.negativeRounds).toBe(2);
    });
  });
});
