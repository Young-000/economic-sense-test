/**
 * 게임 상태 관리 훅
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { GameState, Choice, RoundResult, FinalResult, Question } from '@domain/entities';
import { GAME_CONFIG } from '@domain/entities';
import { processRound, calculateFinalResult } from '@domain/usecases';
import { generateQuestions, generateQuestionsSync } from '@data/questionGenerator';

export interface UseGameReturn {
  /** 현재 게임 상태 */
  gameState: GameState;
  /** 현재 질문 */
  currentQuestion: Question | null;
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
  /** 현재 게임의 질문들 */
  questions: Question[];
  /** 질문 로딩 중 */
  isLoadingQuestions: boolean;
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
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  // 게임 시작 시 로컬 질문으로 초기화, 이후 DB에서 로드
  const [questions, setQuestions] = useState<Question[]>(() => generateQuestionsSync());

  // 비동기로 DB에서 질문 로드
  useEffect(() => {
    let mounted = true;

    const loadQuestions = async () => {
      setIsLoadingQuestions(true);
      try {
        const dbQuestions = await generateQuestions();
        if (mounted) {
          setQuestions(dbQuestions);
        }
      } catch (error) {
        console.error('Failed to load questions:', error);
        // 실패시 로컬 질문 유지
      } finally {
        if (mounted) {
          setIsLoadingQuestions(false);
        }
      }
    };

    loadQuestions();

    return () => {
      mounted = false;
    };
  }, []);

  const currentQuestion = useMemo(() => {
    if (gameState.currentRound >= GAME_CONFIG.TOTAL_ROUNDS) return null;
    return questions[gameState.currentRound];
  }, [gameState.currentRound, questions]);

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
  }, [gameState.isComplete, gameState.results, questions]);

  const reset = useCallback(async () => {
    setGameState(initialState);
    setLastResult(null);
    setIsWaitingResult(false);
    setIsLoadingQuestions(true);

    // 새 게임 시작 시 질문 재생성
    try {
      const newQuestions = await generateQuestions();
      setQuestions(newQuestions);
    } catch (error) {
      console.error('Failed to load questions on reset:', error);
      setQuestions(generateQuestionsSync());
    } finally {
      setIsLoadingQuestions(false);
    }
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
    questions,
    isLoadingQuestions,
  };
}
