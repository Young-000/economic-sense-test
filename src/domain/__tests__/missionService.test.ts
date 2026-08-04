/**
 * missionService 미션 시스템 테스트
 *
 * 투자자 등급 테마 보상: 50/60/80/100 per stage
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MISSION_TRACKS,
  getMissionDisplayData,
  getGameCount,
  incrementGameCount,
  getStreak,
  updateStreak,
  getBestTierLevel,
  updateBestTier,
  checkMissions,
  getCompletedMissionCount,
} from '../services/missionService';

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

describe('missionService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('미션 트랙 구조', () => {
    it('should have 3 tracks', () => {
      expect(MISSION_TRACKS).toHaveLength(3);
    });

    it('should have investor track with tier-themed stages', () => {
      const investor = MISSION_TRACKS.find(t => t.id === 'investor');
      expect(investor).toBeDefined();
      expect(investor!.stages).toHaveLength(4);
      expect(investor!.stages[0].reward).toBe(5);
      expect(investor!.stages[1].reward).toBe(6);
      expect(investor!.stages[2].reward).toBe(8);
      expect(investor!.stages[3].reward).toBe(10);
    });

    it('should have streak track with tier-themed stages', () => {
      const streak = MISSION_TRACKS.find(t => t.id === 'streak');
      expect(streak).toBeDefined();
      expect(streak!.stages).toHaveLength(4);
      expect(streak!.stages[0].reward).toBe(5);
      expect(streak!.stages[1].reward).toBe(6);
      expect(streak!.stages[2].reward).toBe(8);
      expect(streak!.stages[3].reward).toBe(10);
    });

    it('should have tier_master track with tier-themed stages', () => {
      const tierMaster = MISSION_TRACKS.find(t => t.id === 'tier_master');
      expect(tierMaster).toBeDefined();
      expect(tierMaster!.stages).toHaveLength(4);
      expect(tierMaster!.stages[0].reward).toBe(5);
      expect(tierMaster!.stages[1].reward).toBe(6);
      expect(tierMaster!.stages[2].reward).toBe(8);
      expect(tierMaster!.stages[3].reward).toBe(10);
    });

    it('should have total mission rewards of 87 coins across all tracks', () => {
      const totalRewards = MISSION_TRACKS.reduce(
        (sum, track) => sum + track.stages.reduce((s, stage) => s + stage.reward, 0),
        0
      );
      // 3 tracks x (5 + 6 + 8 + 10) = 3 x 29 = 87
      expect(totalRewards).toBe(87);
    });

    it('should have investor-themed descriptions', () => {
      const investor = MISSION_TRACKS.find(t => t.id === 'investor');
      expect(investor!.stages[0].description).toContain('씨앗');
      expect(investor!.stages[1].description).toContain('개미');
      expect(investor!.stages[2].description).toContain('큰손');
      expect(investor!.stages[3].description).toContain('슈퍼개미');
    });
  });

  describe('게임 카운트', () => {
    it('should start at 0', () => {
      expect(getGameCount()).toBe(0);
    });

    it('should increment correctly', () => {
      incrementGameCount();
      incrementGameCount();
      expect(getGameCount()).toBe(2);
    });
  });

  describe('스트릭', () => {
    it('should start at 0', () => {
      expect(getStreak()).toBe(0);
    });

    it('should update to 1 on first play', () => {
      const result = updateStreak();
      expect(result).toBe(1);
    });

    it('should not increment on same day', () => {
      updateStreak();
      const result = updateStreak();
      expect(result).toBe(1);
    });
  });

  describe('최고 티어', () => {
    it('should start at 0', () => {
      expect(getBestTierLevel()).toBe(0);
    });

    it('should update for B tier', () => {
      const result = updateBestTier('B');
      expect(result).toBe(1);
    });

    it('should update for higher tier', () => {
      updateBestTier('B');
      const result = updateBestTier('S');
      expect(result).toBe(3);
    });

    it('should not downgrade', () => {
      updateBestTier('S');
      const result = updateBestTier('B');
      expect(result).toBe(3);
    });
  });

  describe('미션 체크', () => {
    it('should complete investor Lv.1 after 1 game', () => {
      incrementGameCount();
      const results = checkMissions();
      const investor = results.find(r => r.trackId === 'investor');
      expect(investor).toBeDefined();
      expect(investor!.level).toBe(1);
      expect(investor!.reward).toBe(5);
    });

    it('should complete tier_master Lv.1 after reaching B tier', () => {
      updateBestTier('B');
      const results = checkMissions();
      const tier = results.find(r => r.trackId === 'tier_master');
      expect(tier).toBeDefined();
      expect(tier!.level).toBe(1);
      expect(tier!.reward).toBe(5);
    });
  });

  describe('미션 디스플레이', () => {
    it('should return display data for all 3 tracks', () => {
      const data = getMissionDisplayData();
      expect(data).toHaveLength(3);
    });

    it('should show progress correctly', () => {
      incrementGameCount();
      incrementGameCount();
      incrementGameCount();
      const data = getMissionDisplayData();
      const investor = data.find(d => d.trackId === 'investor');
      // After 3 games, Lv.1 is already completed (target=1), Lv.2 needs 5
      // checkMissions not called, so still at Lv.1 with progress 3
      expect(investor!.progress).toBe(1); // capped at target
    });
  });

  describe('완료 카운트', () => {
    it('should start at 0', () => {
      expect(getCompletedMissionCount()).toBe(0);
    });
  });
});
