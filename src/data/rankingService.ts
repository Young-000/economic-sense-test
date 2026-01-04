import { supabase, isSupabaseConfigured } from '@lib/supabase';
import type { InvestorType } from '@domain/entities';

export interface RankingEntry {
  id: string;
  nickname: string;
  final_balance: number;
  total_return: number;
  investor_type: InvestorType;
  risk_score: number;
  rationality_score: number;
  luck_score: number;
  created_at: string;
}

export interface SubmitRankingData {
  nickname: string;
  finalBalance: number;
  totalReturn: number;
  investorType: InvestorType;
  riskScore: number;
  rationalityScore: number;
  luckScore: number;
}

/**
 * 랭킹 제출
 */
export async function submitRanking(data: SubmitRankingData): Promise<{ success: boolean; rank?: number; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase
      .from('economic_rankings')
      .insert({
        nickname: data.nickname,
        final_balance: data.finalBalance,
        total_return: data.totalReturn,
        investor_type: data.investorType,
        risk_score: data.riskScore,
        rationality_score: data.rationalityScore,
        luck_score: data.luckScore,
      });

    if (error) throw error;

    // 현재 순위 조회
    const { count } = await supabase
      .from('economic_rankings')
      .select('*', { count: 'exact', head: true })
      .gt('total_return', data.totalReturn);

    return { success: true, rank: (count ?? 0) + 1 };
  } catch (err) {
    console.error('Failed to submit ranking:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * 상위 랭킹 조회
 */
export async function getTopRankings(limit = 10): Promise<RankingEntry[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('economic_rankings')
      .select('*')
      .order('total_return', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error('Failed to get rankings:', err);
    return [];
  }
}

/**
 * 총 참여자 수 조회
 */
export async function getTotalPlayers(): Promise<number> {
  if (!isSupabaseConfigured || !supabase) {
    return 0;
  }

  try {
    const { count, error } = await supabase
      .from('economic_rankings')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count ?? 0;
  } catch (err) {
    console.error('Failed to get total players:', err);
    return 0;
  }
}
