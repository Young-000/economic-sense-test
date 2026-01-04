/**
 * Domain Entities for Economic Sense Simulation
 * 투자 시뮬레이션 게임 핵심 모델
 */

/** 선택지 */
export type Choice = 'A' | 'B';

/** 결과 확률 */
export interface Outcome {
  probability: number;  // 0-1
  value: number;        // 수익/손실 금액
}

/** 선택지 옵션 */
export interface Option {
  label: string;
  description: string;
  outcomes: Outcome[];
}

/** 시뮬레이션 질문 */
export interface Question {
  id: number;
  situation: string;
  optionA: Option;
  optionB: Option;
}

/** 라운드 결과 */
export interface RoundResult {
  questionId: number;
  choice: Choice;
  chosenOption: Option;
  actualOutcome: number;
  expectedValue: number;
}

/** 게임 상태 */
export interface GameState {
  currentRound: number;
  balance: number;
  results: RoundResult[];
  isComplete: boolean;
}

/** 투자자 유형 */
export type InvestorType =
  | 'lucky_gambler'      // 운 좋은 도박사 (공격+운좋음)
  | 'unlucky_gambler'    // 불운한 도전가 (공격+운나쁨)
  | 'smart_winner'       // 합리적 승리자 (합리적 공격+운좋음)
  | 'smart_unlucky'      // 실력있는 불운아 (합리적 공격+운나쁨)
  | 'steady_grower'      // 안정적 성장가 (보수+운좋음)
  | 'careful_realist'    // 신중한 현실주의자 (보수+운나쁨)
  | 'balanced_investor'  // 균형잡힌 투자자 (중간)
  | 'wild_card';         // 예측불가 (극단적 결과)

/** 투자자 유형 정보 */
export interface InvestorProfile {
  type: InvestorType;
  name: string;
  emoji: string;
  description: string;
  tag: string;
}

/** 최종 결과 */
export interface FinalResult {
  finalBalance: number;
  totalReturn: number;        // 수익률 %
  riskScore: number;          // 공격성 (0-100)
  rationalityScore: number;   // 합리성 (0-100)
  luckScore: number;          // 운 점수 (-100 ~ +100)
  investorType: InvestorType;
  profile: InvestorProfile;
}

/** 게임 설정 */
export const GAME_CONFIG = {
  INITIAL_BALANCE: 10_000_000,  // 1,000만원
  TOTAL_ROUNDS: 10,
} as const;
