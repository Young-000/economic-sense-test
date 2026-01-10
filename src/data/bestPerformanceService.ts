/**
 * 최고 성적 플레이 히스토리 관리 서비스
 * - localStorage에 라운드별 자산 변화 저장
 * - 최고 수익률 기록 추적
 */

import { GAME_CONFIG } from '@domain/entities';
import type { AssetDataPoint } from '@presentation/components/AssetProgressChart';

const STORAGE_KEY = 'economic_best_performance';

export interface BestPerformanceData {
  /** 라운드별 잔액 */
  history: AssetDataPoint[];
  /** 최종 수익률 */
  totalReturn: number;
  /** 기록 달성 시간 */
  achievedAt: string;
  /** 투자자 유형 */
  investorType?: string;
}

/**
 * 최고 성적 데이터 가져오기
 */
export function getBestPerformance(): BestPerformanceData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * 최고 성적 업데이트 (더 높은 수익률일 경우에만)
 * @param history 라운드별 잔액 데이터
 * @param totalReturn 최종 수익률
 * @param investorType 투자자 유형
 * @returns 새 기록 여부
 */
export function updateBestPerformance(
  history: AssetDataPoint[],
  totalReturn: number,
  investorType?: string
): boolean {
  const current = getBestPerformance();

  // 기존 기록이 없거나 새 기록이 더 높으면 업데이트
  if (!current || totalReturn > current.totalReturn) {
    const newData: BestPerformanceData = {
      history,
      totalReturn,
      achievedAt: new Date().toISOString(),
      investorType,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * RoundResult[]와 currentBalance로부터 AssetDataPoint[] 생성
 */
export function createAssetHistory(
  results: { actualOutcome: number }[],
  initialBalance: number = GAME_CONFIG.INITIAL_BALANCE
): AssetDataPoint[] {
  const history: AssetDataPoint[] = [{ round: 0, balance: initialBalance }];
  let runningBalance = initialBalance;

  results.forEach((result, index) => {
    runningBalance += result.actualOutcome;
    history.push({ round: index + 1, balance: runningBalance });
  });

  return history;
}

/**
 * 최고 성적 기록 삭제 (테스트용)
 */
export function clearBestPerformance(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 무시
  }
}

/**
 * 샘플 최고 성적 데이터 생성 (테스트/데모용)
 */
export function generateSampleBestPerformance(): BestPerformanceData {
  const initialBalance = GAME_CONFIG.INITIAL_BALANCE;
  const rounds = GAME_CONFIG.TOTAL_ROUNDS;
  const history: AssetDataPoint[] = [{ round: 0, balance: initialBalance }];

  let balance = initialBalance;
  // 꾸준히 상승하는 가상의 최고 성적
  for (let i = 1; i <= rounds; i++) {
    // 라운드당 평균 +4~6% 수익
    const gain = balance * (0.04 + Math.random() * 0.02);
    balance += gain;
    history.push({ round: i, balance: Math.round(balance) });
  }

  const totalReturn = ((balance - initialBalance) / initialBalance) * 100;

  return {
    history,
    totalReturn,
    achievedAt: new Date().toISOString(),
    investorType: 'smart_winner',
  };
}
