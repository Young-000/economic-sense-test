/**
 * 게임 엔진 - 시뮬레이션 핵심 로직
 */

import type { Option, Outcome, RoundResult, FinalResult, InvestorType } from '../entities';
import { GAME_CONFIG, investorProfiles, calculateTier } from '../entities';

/**
 * 옵션의 기대값 계산
 */
export function calculateExpectedValue(option: Option): number {
  return option.outcomes.reduce(
    (sum, outcome) => sum + outcome.probability * outcome.value,
    0
  );
}

/**
 * 옵션의 분산(리스크) 계산
 */
export function calculateVariance(option: Option): number {
  const ev = calculateExpectedValue(option);
  return option.outcomes.reduce(
    (sum, outcome) => sum + outcome.probability * Math.pow(outcome.value - ev, 2),
    0
  );
}

/**
 * 확률 합계 검증 (1.0 ± 허용 오차)
 */
export function validateProbabilities(option: Option, tolerance = 0.001): boolean {
  const sum = option.outcomes.reduce((acc, o) => acc + o.probability, 0);
  return Math.abs(sum - 1.0) <= tolerance;
}

/**
 * 확률 정규화 (합계가 1.0이 되도록 조정)
 */
function normalizeProbabilities(outcomes: Outcome[]): Outcome[] {
  const sum = outcomes.reduce((acc, o) => acc + o.probability, 0);
  if (sum === 0 || Math.abs(sum - 1.0) < 0.001) return outcomes;

  return outcomes.map(o => ({
    ...o,
    probability: o.probability / sum,
  }));
}

/**
 * 확률 기반 결과 뽑기
 * 확률 합이 1.0이 아닌 경우 자동 정규화
 */
export function rollOutcome(option: Option): Outcome {
  // 확률 정규화 (안전성 확보)
  const normalizedOutcomes = normalizeProbabilities(option.outcomes);

  const random = Math.random();
  let cumulative = 0;

  for (const outcome of normalizedOutcomes) {
    cumulative += outcome.probability;
    if (random < cumulative) {
      // 원본 outcome 반환 (value는 동일)
      const originalIndex = normalizedOutcomes.indexOf(outcome);
      return option.outcomes[originalIndex];
    }
  }

  // 부동소수점 오차 대비 (거의 발생하지 않음)
  return option.outcomes[option.outcomes.length - 1];
}

/**
 * 라운드 결과 생성
 */
export function processRound(
  questionId: number,
  choice: 'A' | 'B',
  optionA: Option,
  optionB: Option
): RoundResult {
  const chosenOption = choice === 'A' ? optionA : optionB;
  const outcome = rollOutcome(chosenOption);
  const expectedValue = calculateExpectedValue(chosenOption);

  return {
    questionId,
    choice,
    chosenOption,
    actualOutcome: outcome.value,
    expectedValue,
  };
}

/**
 * 리스크 점수 계산 (0-100)
 * 높은 분산 옵션을 얼마나 선택했는지
 */
export function calculateRiskScore(
  results: RoundResult[],
  questions: { optionA: Option; optionB: Option }[]
): number {
  if (results.length === 0) return 50;

  let riskChoices = 0;

  results.forEach((result, i) => {
    const question = questions[i];
    const varianceA = calculateVariance(question.optionA);
    const varianceB = calculateVariance(question.optionB);

    const choseHigherRisk = result.choice === 'A'
      ? varianceA > varianceB
      : varianceB > varianceA;

    if (choseHigherRisk) riskChoices++;
  });

  return Math.round((riskChoices / results.length) * 100);
}

/**
 * 합리성 점수 계산 (0-100)
 * 기대값이 높은 옵션을 얼마나 선택했는지
 */
export function calculateRationalityScore(
  results: RoundResult[],
  questions: { optionA: Option; optionB: Option }[]
): number {
  if (results.length === 0) return 50;

  let rationalChoices = 0;

  results.forEach((result, i) => {
    const question = questions[i];
    const evA = calculateExpectedValue(question.optionA);
    const evB = calculateExpectedValue(question.optionB);

    const choseHigherEV = result.choice === 'A'
      ? evA >= evB
      : evB >= evA;

    if (choseHigherEV) rationalChoices++;
  });

  return Math.round((rationalChoices / results.length) * 100);
}

/**
 * 운 점수 계산 (-100 ~ +100)
 * 실제 결과 vs 기대값
 */
export function calculateLuckScore(results: RoundResult[]): number {
  if (results.length === 0) return 0;

  const totalActual = results.reduce((sum, r) => sum + r.actualOutcome, 0);
  const totalExpected = results.reduce((sum, r) => sum + r.expectedValue, 0);

  // 기대값 대비 실제 결과 비율 (-100 ~ +100 범위로 정규화)
  if (totalExpected === 0) return totalActual > 0 ? 100 : totalActual < 0 ? -100 : 0;

  const ratio = (totalActual - totalExpected) / Math.abs(totalExpected);
  return Math.round(Math.max(-100, Math.min(100, ratio * 100)));
}

/**
 * 투자자 유형 결정
 */
export function determineInvestorType(
  riskScore: number,
  rationalityScore: number,
  luckScore: number
): InvestorType {
  const isAggressive = riskScore >= 60;
  const isConservative = riskScore <= 40;
  const isRational = rationalityScore >= 60;
  const isLucky = luckScore >= 20;
  const isUnlucky = luckScore <= -20;

  // 공격적 투자자
  if (isAggressive) {
    if (isRational && isLucky) return 'smart_winner';
    if (isRational && isUnlucky) return 'smart_unlucky';
    if (!isRational && isLucky) return 'lucky_gambler';
    if (!isRational && isUnlucky) return 'unlucky_gambler';
    return 'lucky_gambler'; // 기본
  }

  // 보수적 투자자
  if (isConservative) {
    if (isLucky) return 'steady_grower';
    if (isUnlucky) return 'careful_realist';
    return 'careful_realist'; // 기본
  }

  // 중간
  return 'balanced_investor';
}

/**
 * 최종 결과 계산
 * @param results - 라운드 결과 배열
 * @param questions - 질문 배열
 * @param initialBalance - 시작 잔액 (게임 모드별로 다름)
 */
export function calculateFinalResult(
  results: RoundResult[],
  questions: { optionA: Option; optionB: Option }[],
  initialBalance: number = GAME_CONFIG.INITIAL_BALANCE
): FinalResult {
  const totalGain = results.reduce((sum, r) => sum + r.actualOutcome, 0);
  const finalBalance = initialBalance + totalGain;
  const totalReturn = (totalGain / initialBalance) * 100;

  const riskScore = calculateRiskScore(results, questions);
  const rationalityScore = calculateRationalityScore(results, questions);
  const luckScore = calculateLuckScore(results);

  const investorType = determineInvestorType(riskScore, rationalityScore, luckScore);
  const profile = investorProfiles[investorType];

  const tier = calculateTier(totalReturn);

  return {
    finalBalance,
    totalReturn,
    riskScore,
    rationalityScore,
    luckScore,
    investorType,
    profile,
    tier,
  };
}
