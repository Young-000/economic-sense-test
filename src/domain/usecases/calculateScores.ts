import type { AnswerChoice, Scores } from '../entities';

/**
 * 질문 범위 상수
 */
const QUESTION_RANGES = {
  risk: { start: 0, end: 3 },        // Q1-3: 위험회피
  loss: { start: 3, end: 6 },        // Q4-6: 손실회피
  time: { start: 6, end: 8 },        // Q7-8: 시간할인
  probability: { start: 8, end: 10 }, // Q9-10: 확률가중
} as const;

/**
 * 특정 범위의 답변에서 특정 선택지 비율 계산
 */
function calculateRatio(
  answers: AnswerChoice[],
  start: number,
  end: number,
  targetChoice: AnswerChoice
): number {
  const rangeAnswers = answers.slice(start, end);
  const count = rangeAnswers.filter((a) => a === targetChoice).length;
  const total = end - start;
  return (count / total) * 100;
}

/**
 * 10개 답변으로부터 4개 지표 점수 계산
 *
 * @param answers - 10개의 A/B 답변 배열
 * @returns 4개 지표 점수 (각 0-100)
 *
 * 점수 계산 방식:
 * - 위험회피(Q1-3): A 선택 비율 (A=확실한 금액 선호 = 위험회피)
 * - 손실회피(Q4-6): B 선택 비율 (B=게임 거절 = 손실회피)
 * - 시간할인(Q7-8): A 선택 비율 (A=현재 선호 = 높은 시간할인)
 * - 확률가중(Q9-10): A 선택 비율 (A=낮은확률 대박 선호 = 낙관적)
 */
export function calculateScores(answers: AnswerChoice[]): Scores {
  const { risk, loss, time, probability } = QUESTION_RANGES;

  return {
    riskAversion: calculateRatio(answers, risk.start, risk.end, 'A'),
    lossAversion: calculateRatio(answers, loss.start, loss.end, 'B'),
    timeDiscount: calculateRatio(answers, time.start, time.end, 'A'),
    probabilityWeight: calculateRatio(answers, probability.start, probability.end, 'A'),
  };
}
