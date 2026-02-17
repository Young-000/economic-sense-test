import { useMemo, useState, useEffect } from 'react';
import type { RoundResult, Question, GameMode, FinalResult } from '@domain/entities';
import { getGameConfig } from '@domain/entities';
import { calculateFinalResult } from '@domain/usecases';
import {
  getBestPerformance,
  updateBestPerformance,
  createAssetHistory,
  type BestPerformanceData,
} from '@data/bestPerformanceService';
import type { AssetDataPoint } from '@presentation/components/AssetProgressChart';

export interface UseResultDataReturn {
  finalResult: FinalResult | null;
  gameResults: RoundResult[];
  assetHistory: AssetDataPoint[];
  bestPerformance: BestPerformanceData | null;
  initialBalance: number;
  gameMode: GameMode;
  isNewRecord: boolean;
}

export function useResultData(): UseResultDataReturn {
  const [isNewRecord, setIsNewRecord] = useState(false);

  const {
    finalResult,
    gameResults,
    assetHistory,
    bestPerformance,
    initialBalance,
    gameMode,
  } = useMemo(() => {
    try {
      const storedResults = sessionStorage.getItem('gameResults');
      const storedQuestions = sessionStorage.getItem('gameQuestions');
      const mode = (sessionStorage.getItem('gameMode') as GameMode) || 'normal';
      const config = getGameConfig(mode);

      if (!storedResults || !storedQuestions) {
        return {
          finalResult: null,
          gameResults: [] as RoundResult[],
          assetHistory: [] as AssetDataPoint[],
          bestPerformance: getBestPerformance(mode),
          gameMode: mode,
          initialBalance: config.INITIAL_BALANCE,
        };
      }

      const results: RoundResult[] = JSON.parse(storedResults);
      const questions: Question[] = JSON.parse(storedQuestions);

      if (!Array.isArray(results) || !Array.isArray(questions)) {
        return {
          finalResult: null,
          gameResults: [] as RoundResult[],
          assetHistory: [] as AssetDataPoint[],
          bestPerformance: getBestPerformance(mode),
          gameMode: mode,
          initialBalance: config.INITIAL_BALANCE,
        };
      }

      if (results.length !== config.TOTAL_ROUNDS || questions.length !== config.TOTAL_ROUNDS) {
        return {
          finalResult: null,
          gameResults: results,
          assetHistory: createAssetHistory(results, config.INITIAL_BALANCE),
          bestPerformance: getBestPerformance(mode),
          gameMode: mode,
          initialBalance: config.INITIAL_BALANCE,
        };
      }

      return {
        finalResult: calculateFinalResult(results, questions, config.INITIAL_BALANCE),
        gameResults: results,
        assetHistory: createAssetHistory(results, config.INITIAL_BALANCE),
        bestPerformance: getBestPerformance(mode),
        gameMode: mode,
        initialBalance: config.INITIAL_BALANCE,
      };
    } catch {
      const mode = 'normal' as GameMode;
      const config = getGameConfig(mode);
      return {
        finalResult: null,
        gameResults: [] as RoundResult[],
        assetHistory: [] as AssetDataPoint[],
        bestPerformance: getBestPerformance(mode),
        gameMode: mode,
        initialBalance: config.INITIAL_BALANCE,
      };
    }
  }, []);

  useEffect(() => {
    if (finalResult) {
      const wasNewRecord = updateBestPerformance(
        assetHistory,
        finalResult.totalReturn,
        finalResult.investorType,
        gameMode
      );
      setIsNewRecord(wasNewRecord);
    }
  }, [finalResult, assetHistory, gameMode]);

  return {
    finalResult,
    gameResults,
    assetHistory,
    bestPerformance,
    initialBalance,
    gameMode,
    isNewRecord,
  };
}
