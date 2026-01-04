import type { Scores, CharacterCode } from '../entities';

/**
 * 점수 임계값 (이상이면 높음, 미만이면 낮음)
 */
const THRESHOLD = 50;

/**
 * 각 지표별 문자 결정
 */
function getRiskLetter(score: number): 'C' | 'R' {
  return score >= THRESHOLD ? 'C' : 'R';
}

function getLossLetter(score: number): 'S' | 'T' {
  return score >= THRESHOLD ? 'S' : 'T';
}

function getTimeLetter(score: number): 'P' | 'F' {
  return score >= THRESHOLD ? 'P' : 'F';
}

function getProbabilityLetter(score: number): 'O' | 'L' {
  return score >= THRESHOLD ? 'O' : 'L';
}

/**
 * 4개 지표 점수로부터 16가지 캐릭터 유형 코드 결정
 *
 * @param scores - 4개 지표 점수
 * @returns 4글자 캐릭터 코드 (예: 'CSPO', 'RTFL')
 *
 * 코드 구조:
 * - 1번째: C(Cautious, 신중) / R(Risk-taker, 모험)
 * - 2번째: S(Sensitive, 손실민감) / T(Tolerant, 손실담담)
 * - 3번째: P(Present, 현재중시) / F(Future, 미래지향)
 * - 4번째: O(Optimistic, 낙관) / L(Logical, 현실)
 */
export function determineType(scores: Scores): CharacterCode {
  const c = getRiskLetter(scores.riskAversion);
  const s = getLossLetter(scores.lossAversion);
  const p = getTimeLetter(scores.timeDiscount);
  const o = getProbabilityLetter(scores.probabilityWeight);

  return `${c}${s}${p}${o}` as CharacterCode;
}
