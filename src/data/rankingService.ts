import { supabase, isSupabaseConfigured } from '@lib/supabase';
import type { InvestorType } from '@domain/entities';

/** 라운드별 결과 데이터 */
export interface RoundResultData {
  round: number;
  balance: number;
  outcome: number;
}

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
  round_results?: RoundResultData[];
}

export interface SubmitRankingData {
  nickname: string;
  finalBalance: number;
  totalReturn: number;
  investorType: InvestorType;
  riskScore: number;
  rationalityScore: number;
  luckScore: number;
  roundResults?: RoundResultData[];
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
        round_results: data.roundResults ?? [],
      });

    if (error) throw error;

    // 현재 순위 조회 (최종 자산 기준)
    const { count } = await supabase
      .from('economic_rankings')
      .select('*', { count: 'exact', head: true })
      .gt('final_balance', data.finalBalance);

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
      .order('final_balance', { ascending: false })
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

/**
 * 특정 수익률보다 높은 플레이어 수 조회 (상위 N% 계산용)
 */
export async function getPlayersAboveReturn(totalReturn: number): Promise<{ above: number; total: number }> {
  if (!isSupabaseConfigured || !supabase) {
    return { above: 0, total: 0 };
  }

  try {
    // 전체 수와 해당 수익률보다 높은 수를 동시에 조회
    const [totalResult, aboveResult] = await Promise.all([
      supabase
        .from('economic_rankings')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('economic_rankings')
        .select('*', { count: 'exact', head: true })
        .gt('total_return', totalReturn),
    ]);

    return {
      above: aboveResult.count ?? 0,
      total: totalResult.count ?? 0,
    };
  } catch (err) {
    console.error('Failed to get players above return:', err);
    return { above: 0, total: 0 };
  }
}

/**
 * 오늘의 1위 플레이어 조회
 */
export async function getTodayTopPlayer(): Promise<{ nickname: string; totalReturn: number } | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('economic_rankings')
      .select('nickname, total_return')
      .gte('created_at', today.toISOString())
      .order('total_return', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data ? { nickname: data.nickname, totalReturn: data.total_return } : null;
  } catch (err) {
    console.error('Failed to get today top player:', err);
    return null;
  }
}

/**
 * 1등 플레이어의 라운드별 결과 조회
 * GamePage에서 그래프 백그라운드로 표시할 데이터
 */
export async function getTopPlayerRoundResults(): Promise<RoundResultData[] | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('economic_rankings')
      .select('round_results')
      .order('total_return', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // 데이터가 없는 경우
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return (data?.round_results as RoundResultData[]) ?? null;
  } catch (err) {
    console.error('Failed to get top player round results:', err);
    return null;
  }
}
