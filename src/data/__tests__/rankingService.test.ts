/**
 * 랭킹 서비스 테스트
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock supabase module - vi.hoisted를 사용하여 호이스팅 문제 해결
const { mockFrom, mockSupabase } = vi.hoisted(() => {
  const mockFrom = vi.fn();
  return {
    mockFrom,
    mockSupabase: {
      from: mockFrom,
    },
  };
});

vi.mock('@lib/supabase', () => ({
  supabase: mockSupabase,
  isSupabaseConfigured: true,
}));

import { submitRanking, getTopRankings, getTotalPlayers, type SubmitRankingData } from '../rankingService';

describe('Ranking Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('submitRanking', () => {
    const mockData: SubmitRankingData = {
      nickname: 'TestUser',
      finalBalance: 12_000_000,
      totalReturn: 20.0,
      investorType: 'steady_grower',
      riskScore: 5.0,
      rationalityScore: 80,
      luckScore: 10,
    };

    it('should submit ranking and return rank', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockGt = vi.fn().mockResolvedValue({ count: 5, error: null });
      const mockSelectForCount = vi.fn().mockReturnValue({ gt: mockGt });

      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // 첫 번째 호출: insert
          return { insert: mockInsert };
        }
        // 두 번째 호출: select for count
        return { select: mockSelectForCount };
      });

      const result = await submitRanking(mockData);

      expect(result.success).toBe(true);
      expect(result.rank).toBe(6); // 5명보다 높은 점수 + 1
      expect(mockFrom).toHaveBeenCalledWith('economic_rankings');
    });

    it('should handle insert error', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: new Error('Insert failed') });

      mockFrom.mockReturnValue({
        insert: mockInsert,
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = await submitRanking(mockData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      consoleSpy.mockRestore();
    });
  });

  describe('getTopRankings', () => {
    it('should return rankings sorted by total_return', async () => {
      const mockRankings = [
        { id: '1', nickname: 'Player1', total_return: 50 },
        { id: '2', nickname: 'Player2', total_return: 40 },
      ];

      const mockLimit = vi.fn().mockResolvedValue({ data: mockRankings, error: null });
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });

      mockFrom.mockReturnValue({
        select: mockSelect,
      });

      const result = await getTopRankings(10);

      expect(result).toEqual(mockRankings);
      expect(mockFrom).toHaveBeenCalledWith('economic_rankings');
    });

    it('should return empty array on error', async () => {
      const mockLimit = vi.fn().mockResolvedValue({ data: null, error: new Error('Query failed') });
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });

      mockFrom.mockReturnValue({
        select: mockSelect,
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = await getTopRankings();

      expect(result).toEqual([]);
      consoleSpy.mockRestore();
    });

    it('should use default limit of 10', async () => {
      const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });

      mockFrom.mockReturnValue({
        select: mockSelect,
      });

      await getTopRankings();

      expect(mockLimit).toHaveBeenCalledWith(10);
    });

    it('should return empty array when data is null', async () => {
      const mockLimit = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });

      mockFrom.mockReturnValue({
        select: mockSelect,
      });

      const result = await getTopRankings(5);

      expect(result).toEqual([]);
    });
  });

  describe('getTotalPlayers', () => {
    it('should return total player count', async () => {
      const mockSelect = vi.fn().mockResolvedValue({ count: 100, error: null });

      mockFrom.mockReturnValue({
        select: mockSelect,
      });

      const result = await getTotalPlayers();

      expect(result).toBe(100);
    });

    it('should return 0 on error', async () => {
      const mockSelect = vi.fn().mockResolvedValue({ count: null, error: new Error('Count failed') });

      mockFrom.mockReturnValue({
        select: mockSelect,
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = await getTotalPlayers();

      expect(result).toBe(0);
      consoleSpy.mockRestore();
    });

    it('should return 0 when count is null', async () => {
      const mockSelect = vi.fn().mockResolvedValue({ count: null, error: null });

      mockFrom.mockReturnValue({
        select: mockSelect,
      });

      const result = await getTotalPlayers();

      expect(result).toBe(0);
    });
  });
});

// Supabase not configured 테스트는 별도 파일에서 진행해야 함 (모듈 재로드 제한)
