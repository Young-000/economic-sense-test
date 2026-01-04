import { useState, useCallback } from 'react';
import type { AnswerChoice } from '@domain/entities';

export interface UseTestReturn {
  /** 현재 질문 인덱스 (0-9) */
  currentIndex: number;
  /** 지금까지의 답변들 */
  answers: AnswerChoice[];
  /** 테스트 완료 여부 */
  isComplete: boolean;
  /** 진행률 (0-100) */
  progress: number;
  /** 답변 선택 */
  selectAnswer: (answer: AnswerChoice) => void;
  /** 테스트 리셋 */
  reset: () => void;
}

const TOTAL_QUESTIONS = 10;

/**
 * 테스트 진행 상태 관리 훅
 */
export function useTest(): UseTestReturn {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerChoice[]>([]);

  const isComplete = answers.length >= TOTAL_QUESTIONS;
  const progress = (answers.length / TOTAL_QUESTIONS) * 100;

  const selectAnswer = useCallback((answer: AnswerChoice) => {
    setAnswers((prev) => {
      if (prev.length >= TOTAL_QUESTIONS) return prev;
      return [...prev, answer];
    });
    setCurrentIndex((prev) => Math.min(prev + 1, TOTAL_QUESTIONS - 1));
  }, []);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setAnswers([]);
  }, []);

  return {
    currentIndex,
    answers,
    isComplete,
    progress,
    selectAnswer,
    reset,
  };
}
