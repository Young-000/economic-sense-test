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

/** 게임 모드 */
export type GameMode = 'normal' | 'extreme';

/** 게임 모드별 설정 */
export const GAME_MODE_CONFIG = {
  normal: {
    name: '일반 모드',
    emoji: '💰',
    description: '현실적인 경제 선택',
    initialBalance: 10_000_000,  // 1,000만원
    totalRounds: 10,
  },
  extreme: {
    name: '극한 모드',
    emoji: '🔥',
    description: '하이리스크 하이리턴',
    initialBalance: 50_000_000,  // 5,000만원
    totalRounds: 10,
  },
} as const;

/** 게임 설정 (기본값 - 일반 모드) */
export const GAME_CONFIG = {
  INITIAL_BALANCE: 10_000_000,  // 1,000만원
  TOTAL_ROUNDS: 10,
} as const;

/** 모드별 게임 설정 가져오기 */
export function getGameConfig(mode: GameMode) {
  const config = GAME_MODE_CONFIG[mode];
  return {
    INITIAL_BALANCE: config.initialBalance,
    TOTAL_ROUNDS: config.totalRounds,
  };
}

/** 투자자 유형 프로필 (도메인 지식) */
export const investorProfiles: Record<InvestorType, InvestorProfile> = {
  lucky_gambler: {
    type: 'lucky_gambler',
    name: '운빨 부자',
    emoji: '🍀',
    description: '실력? 그게 뭔데요. 운이면 충분해요! 오늘 운 다 쓴 거 아니죠?',
    tag: '오늘_치킨_각',
  },
  unlucky_gambler: {
    type: 'unlucky_gambler',
    name: '용감한 흙손',
    emoji: '😭',
    description: '용기는 좋았어요... 근데 운이 너무 없었네요. 현실에선 조심하세요!',
    tag: '내_돈_어디감',
  },
  smart_winner: {
    type: 'smart_winner',
    name: '금손 투자자',
    emoji: '👑',
    description: '똑똑한 선택 + 운까지 따라줬어요! 진짜 투자하면 부자될 스타일.',
    tag: '부자될_상',
  },
  smart_unlucky: {
    type: 'smart_unlucky',
    name: '억울한 전략가',
    emoji: '🥲',
    description: '선택은 완벽했는데 주사위가 배신했어요. 실력은 인정! 운만 따르면 버핏.',
    tag: '운만_따르면_버핏',
  },
  steady_grower: {
    type: 'steady_grower',
    name: '적금의 신',
    emoji: '🏦',
    description: '안전하게 불렸어요! 화려하진 않지만 잃지 않는 게 진짜 실력.',
    tag: '적금러_인정',
  },
  careful_realist: {
    type: 'careful_realist',
    name: '돌다리 검증러',
    emoji: '🐢',
    description: '손실은 싫어요! 근데 가끔은 도전도 해봐요. 기회비용도 손실이에요~',
    tag: '손실만은_싫어',
  },
  balanced_investor: {
    type: 'balanced_investor',
    name: '밸런스 장인',
    emoji: '⚖️',
    description: '공격과 수비의 완벽한 조화! 상황 판단 능력 甲.',
    tag: '줏대있는_투자',
  },
  wild_card: {
    type: 'wild_card',
    name: 'YOLO 투자자',
    emoji: '🎲',
    description: '패턴? 전략? 그냥 느낌 가는 대로! 인생은 모험이니까요~',
    tag: 'YOLO_투자',
  },
};
