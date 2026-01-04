import { useMemo } from 'react';
import type { AnswerChoice, Scores, CharacterCode, Character } from '@domain/entities';
import { calculateScores } from '@domain/usecases/calculateScores';
import { determineType } from '@domain/usecases/determineType';
import { characters } from '@data/characters';

export interface UseResultReturn {
  scores: Scores | null;
  characterCode: CharacterCode | null;
  character: Character | null;
}

/**
 * URL 파라미터에서 답변을 파싱하고 결과를 계산하는 훅
 */
export function useResult(answersParam: string): UseResultReturn {
  return useMemo(() => {
    if (!answersParam || answersParam.length < 10) {
      return { scores: null, characterCode: null, character: null };
    }

    const answers = answersParam.split('').slice(0, 10) as AnswerChoice[];
    const scores = calculateScores(answers);
    const characterCode = determineType(scores);
    const character = characters[characterCode];

    return { scores, characterCode, character };
  }, [answersParam]);
}
