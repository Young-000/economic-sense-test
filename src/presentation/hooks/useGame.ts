/**
 * 게임 상태 관리 훅
 */

import { useState, useCallback, useMemo } from 'react';
import type { GameState, Choice, RoundResult, FinalResult } from '@domain/entities';
import { GAME_CONFIG } from '@domain/entities';
import { processRound, calculateFinalResult } from '@domain/usecases';
import { questions } from '@data/questions';

export interface UseGameReturn {
  /** 현재 게임 상태 */
  gameState: GameState;
  /** 현재 질문 */
  currentQuestion: typeof questions[0] | null;
  /** 마지막 라운드 결과 (애니메이션용) */
  lastResult: RoundResult | null;
  /** 선택하기 */
  makeChoice: (choice: Choice) => void;
  /** 다음 라운드로 (결과 확인 후) */
  nextRound: () => void;
  /** 최종 결과 */
  finalResult: FinalResult | null;
  /** 게임 리셋 */
  reset: () => void;
  /** 결과 대기 중 (애니메이션) */
  isWaitingResult: boolean;
}

const initialState: GameState = {
  currentRound: 0,
  balance: GAME_CONFIG.INITIAL_BALANCE,
  results: [],
  isComplete: false,
};

export function useGame(): UseGameReturn {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);
  const [isWaitingResult, setIsWaitingResult] = useState(false);

  const currentQuestion = useMemo(() => {
    if (gameState.currentRound >= GAME_CONFIG.TOTAL_ROUNDS) return null;
    return questions[gameState.currentRound];
  }, [gameState.currentRound]);

  const makeChoice = useCallback((choice: Choice) => {
    if (!currentQuestion || isWaitingResult) return;

    const result = processRound(
      currentQuestion.id,
      choice,
      currentQuestion.optionA,
      currentQuestion.optionB
    );

    setLastResult(result);
    setIsWaitingResult(true);
  }, [currentQuestion, isWaitingResult]);

  const nextRound = useCallback(() => {
    if (!lastResult) return;

    setGameState((prev) => {
      const newResults = [...prev.results, lastResult];
      const newBalance = prev.balance + lastResult.actualOutcome;
      const newRound = prev.currentRound + 1;
      const isComplete = newRound >= GAME_CONFIG.TOTAL_ROUNDS;

      return {
        currentRound: newRound,
        balance: newBalance,
        results: newResults,
        isComplete,
      };
    });

    setLastResult(null);
    setIsWaitingResult(false);
  }, [lastResult]);

  const finalResult = useMemo(() => {
    if (!gameState.isComplete) return null;
    return calculateFinalResult(gameState.results, questions);
  }, [gameState.isComplete, gameState.results]);

  const reset = useCallback(() => {
    setGameState(initialState);
    setLastResult(null);
    setIsWaitingResult(false);
  }, []);

  return {
    gameState,
    currentQuestion,
    lastResult,
    makeChoice,
    nextRound,
    finalResult,
    reset,
    isWaitingResult,
  };
}
