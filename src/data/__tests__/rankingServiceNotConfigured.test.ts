/**
 * 랭킹 서비스 테스트 - Supabase 미설정 케이스
 */
import { describe, it, expect, vi } from 'vitest';

// Supabase가 설정되지 않은 경우를 테스트
vi.mock('@lib/supabase', () => ({
  supabase: null,
  isSupabaseConfigured: false,
}));

import { submitRanking, getTopRankings, getTotalPlayers, type SubmitRankingData } from '../rankingService';

describe('Ranking Service - Supabase Not Configured', () => {
  const mockData: SubmitRankingData = {
    nickname: 'TestUser',
    finalBalance: 10_000_000,
    totalReturn: 0,
    investorType: 'careful_realist',
    riskScore: 3,
    rationalityScore: 90,
    luckScore: 0,
  };

  it('submitRanking should return error when Supabase not configured', async () => {
    const result = await submitRanking(mockData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Supabase not configured');
  });

  it('getTopRankings should return empty array when Supabase not configured', async () => {
    const result = await getTopRankings();

    expect(result).toEqual([]);
  });

  it('getTotalPlayers should return 0 when Supabase not configured', async () => {
    const result = await getTotalPlayers();

    expect(result).toBe(0);
  });
});
