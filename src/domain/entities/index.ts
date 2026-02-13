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
  tier: TierInfo;             // 티어 등급
}

/** 티어 등급 */
export type TierGrade = 'SS' | 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

/** 티어 정보 */
export interface TierInfo {
  grade: TierGrade;
  name: string;
  color: string;
  bgColor: string;
  description: string;
  minReturn: number; // 이 티어의 최소 수익률 (%)
  rarity: number;    // 이 등급의 희소성 (%, 전체 플레이어 중 비율)
}

/** 티어 등급 기준 (수익률 기반, 내림차순) */
export const TIER_THRESHOLDS: TierInfo[] = [
  { grade: 'SS', name: '금손 중의 금손', color: '#FFD700', bgColor: '#3D2E00', description: '전설적인 수익률! 운빨 만렙 달성', minReturn: 80, rarity: 2 },
  { grade: 'S', name: '타고난 금손', color: '#FF6B35', bgColor: '#3D1A0A', description: '대단한 결과! 자랑할 만한 수익률', minReturn: 50, rarity: 8 },
  { grade: 'A', name: '제법 하는데?', color: '#4ECDC4', bgColor: '#0F2E2C', description: '꽤 괜찮은 결과! 운이 따라줬어요', minReturn: 20, rarity: 20 },
  { grade: 'B', name: '본전치기 장인', color: '#95E1D3', bgColor: '#1A2E2A', description: '무난하게 지켜냈어요', minReturn: 0, rarity: 30 },
  { grade: 'C', name: '살짝 흙손', color: '#A8A8A8', bgColor: '#2A2A2A', description: '아쉽지만 다음엔 다를 거예요', minReturn: -30, rarity: 25 },
  { grade: 'D', name: '본격 흙손', color: '#FF8A80', bgColor: '#3D1A1A', description: '운이 안 따라줬네요...', minReturn: -60, rarity: 12 },
  { grade: 'F', name: '전설의 흙손', color: '#FF5252', bgColor: '#3D0A0A', description: '오히려 레전드! 이것도 재능', minReturn: -Infinity, rarity: 3 },
];

/** 수익률로 티어 계산 */
export function calculateTier(totalReturn: number): TierInfo {
  for (const tier of TIER_THRESHOLDS) {
    if (totalReturn >= tier.minReturn) {
      return tier;
    }
  }
  return TIER_THRESHOLDS[TIER_THRESHOLDS.length - 1];
}

/** 티어 희소성 텍스트 반환 */
export function getTierRarityText(tier: TierInfo): string {
  return `전체의 약 ${tier.rarity}%만 달성!`;
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

/** 게임 설정 반환 타입 */
export interface GameConfig {
  INITIAL_BALANCE: number;
  TOTAL_ROUNDS: number;
}

/** 모드별 게임 설정 가져오기 */
export function getGameConfig(mode: GameMode): GameConfig {
  const config = GAME_MODE_CONFIG[mode];
  return {
    INITIAL_BALANCE: config.initialBalance,
    TOTAL_ROUNDS: config.totalRounds,
  };
}

/** 시즌 타입 */
export type SeasonType =
  | 'spring'      // 봄 (3-5월)
  | 'summer'      // 여름 (6-8월)
  | 'autumn'      // 가을 (9-11월)
  | 'winter';     // 겨울 (12-2월)

/** 특별 이벤트 타입 */
export type SpecialEventType =
  | 'new_year'        // 설날 (음력 1월 1일 전후)
  | 'valentines'      // 발렌타인데이 (2/14)
  | 'white_day'       // 화이트데이 (3/14)
  | 'chuseok'         // 추석 (음력 8월 15일 전후)
  | 'halloween'       // 할로윈 (10/31)
  | 'black_friday'    // 블랙프라이데이 (11월 넷째 금요일)
  | 'christmas'       // 크리스마스 (12/24-25)
  | 'year_end';       // 연말 (12/26-31)

/** 시즌/이벤트 테마 설정 */
export interface SeasonTheme {
  id: SeasonType | SpecialEventType;
  name: string;
  emoji: string;
  description: string;
  bannerMessage: string;
  accentColor: string;
  specialAchievementId?: string;
}

/** 시즌 테마 설정 */
export const SEASON_THEMES: Record<SeasonType, SeasonTheme> = {
  spring: {
    id: 'spring',
    name: '봄 시즌',
    emoji: '🌸',
    description: '새로운 시작의 계절',
    bannerMessage: '🌸 봄맞이 투자 시즌!',
    accentColor: '#FFB7C5',
  },
  summer: {
    id: 'summer',
    name: '여름 시즌',
    emoji: '🏖️',
    description: '뜨거운 여름, 뜨거운 수익',
    bannerMessage: '🏖️ 여름 특별 이벤트!',
    accentColor: '#00CED1',
  },
  autumn: {
    id: 'autumn',
    name: '가을 시즌',
    emoji: '🍂',
    description: '풍요로운 수확의 계절',
    bannerMessage: '🍂 가을 수확 시즌!',
    accentColor: '#FF8C00',
  },
  winter: {
    id: 'winter',
    name: '겨울 시즌',
    emoji: '❄️',
    description: '차가운 겨울, 뜨거운 투자',
    bannerMessage: '❄️ 겨울 특별 시즌!',
    accentColor: '#87CEEB',
  },
};

/** 특별 이벤트 테마 설정 */
export const SPECIAL_EVENT_THEMES: Record<SpecialEventType, SeasonTheme> = {
  new_year: {
    id: 'new_year',
    name: '설날 이벤트',
    emoji: '🧧',
    description: '새해 복 많이 받으세요!',
    bannerMessage: '🧧 설날 세뱃돈 이벤트!',
    accentColor: '#FF4500',
    specialAchievementId: 'new_year_luck',
  },
  valentines: {
    id: 'valentines',
    name: '발렌타인 이벤트',
    emoji: '💝',
    description: '사랑과 투자의 날',
    bannerMessage: '💝 발렌타인 스페셜!',
    accentColor: '#FF69B4',
  },
  white_day: {
    id: 'white_day',
    name: '화이트데이 이벤트',
    emoji: '🍬',
    description: '달콤한 수익의 날',
    bannerMessage: '🍬 화이트데이 스페셜!',
    accentColor: '#FFF0F5',
  },
  chuseok: {
    id: 'chuseok',
    name: '추석 이벤트',
    emoji: '🌕',
    description: '풍요로운 한가위',
    bannerMessage: '🌕 추석 대박 이벤트!',
    accentColor: '#FFD700',
    specialAchievementId: 'chuseok_harvest',
  },
  halloween: {
    id: 'halloween',
    name: '할로윈 이벤트',
    emoji: '🎃',
    description: '무서운 수익률의 밤',
    bannerMessage: '🎃 할로윈 스페셜!',
    accentColor: '#FF6600',
    specialAchievementId: 'halloween_thrill',
  },
  black_friday: {
    id: 'black_friday',
    name: '블랙프라이데이',
    emoji: '🛍️',
    description: '역대급 할인의 날',
    bannerMessage: '🛍️ 블프 특별 이벤트!',
    accentColor: '#000000',
  },
  christmas: {
    id: 'christmas',
    name: '크리스마스 이벤트',
    emoji: '🎄',
    description: '산타의 선물 같은 수익',
    bannerMessage: '🎄 크리스마스 스페셜!',
    accentColor: '#228B22',
    specialAchievementId: 'christmas_gift',
  },
  year_end: {
    id: 'year_end',
    name: '연말 정산 이벤트',
    emoji: '🎊',
    description: '올해의 마지막 투자',
    bannerMessage: '🎊 연말 결산 이벤트!',
    accentColor: '#9400D3',
  },
};

/** 투자자 유형 프로필 (도메인 지식) */
export const investorProfiles: Record<InvestorType, InvestorProfile> = {
  lucky_gambler: {
    type: 'lucky_gambler',
    name: '운빨 도전가',
    emoji: '🍀',
    description: '과감한 선택에 운까지 따라줬어요! 주사위의 신이 함께하네요.',
    tag: '운빨_갓겜',
  },
  unlucky_gambler: {
    type: 'unlucky_gambler',
    name: '용감한 도전가',
    emoji: '😭',
    description: '과감하게 도전했지만 운이 따라주지 않았어요. 다음엔 분명 다를 거예요!',
    tag: '다음엔_대박',
  },
  smart_winner: {
    type: 'smart_winner',
    name: '금손 전략가',
    emoji: '👑',
    description: '합리적인 선택 + 운까지 따라줬어요! 완벽한 조합이에요.',
    tag: '완벽한_조합',
  },
  smart_unlucky: {
    type: 'smart_unlucky',
    name: '억울한 전략가',
    emoji: '🥲',
    description: '분석은 완벽했는데 주사위가 배신했어요. 실력은 인정! 운만 따르면 버핏.',
    tag: '운만_따르면_버핏',
  },
  steady_grower: {
    type: 'steady_grower',
    name: '안정 추구형',
    emoji: '🏦',
    description: '안전한 선택을 선호하고, 운도 따라줬어요! 신중함이 돋보여요.',
    tag: '신중한_선택',
  },
  careful_realist: {
    type: 'careful_realist',
    name: '돌다리 검증러',
    emoji: '🐢',
    description: '리스크를 피하는 신중한 타입! 근데 가끔은 도전도 해봐요~',
    tag: '안전제일',
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
