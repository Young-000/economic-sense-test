/**
 * 업적 시스템 서비스
 * 특정 조건 달성 시 배지 획득
 */

export interface GameStats {
  totalReturn: number;
  winStreak: number;
  loseStreak: number;
  totalGames: number;
  positiveRounds: number;
  negativeRounds: number;
  riskScore: number;
  rationalityScore: number;
  luckScore: number;
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: string;
}

const STORAGE_KEY = 'economic-sense-achievements';

// 업적 카테고리 정의
export type AchievementCategory =
  | 'milestone' // 게임 횟수 마일스톤
  | 'return' // 수익률 관련
  | 'streak' // 연속 수익/손실
  | 'strategy' // 전략/선택 패턴
  | 'luck' // 운 관련
  | 'special'; // 특별 업적

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: AchievementCategory;
  tier?: AchievementTier;
  condition: (stats: GameStats) => boolean;
}

// 업적 정의 (50개)
export const ACHIEVEMENTS: Achievement[] = [
  // ═══════════════════════════════════════════════════════════════════
  // 🎮 마일스톤 업적 (게임 횟수) - 5개
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'first_game',
    name: '첫 걸음',
    description: '첫 게임을 완료했어요',
    emoji: '🎮',
    category: 'milestone',
    tier: 'bronze',
    condition: (stats) => stats.totalGames >= 1,
  },
  {
    id: 'getting_started',
    name: '입문자',
    description: '5게임 플레이',
    emoji: '📚',
    category: 'milestone',
    tier: 'bronze',
    condition: (stats) => stats.totalGames >= 5,
  },
  {
    id: 'veteran',
    name: '베테랑',
    description: '10게임 플레이',
    emoji: '🎖️',
    category: 'milestone',
    tier: 'silver',
    condition: (stats) => stats.totalGames >= 10,
  },
  {
    id: 'dedicated',
    name: '투자 전문가',
    description: '25게임 플레이',
    emoji: '🏅',
    category: 'milestone',
    tier: 'gold',
    condition: (stats) => stats.totalGames >= 25,
  },
  {
    id: 'legend',
    name: '전설의 투자자',
    description: '50게임 플레이',
    emoji: '🏆',
    category: 'milestone',
    tier: 'diamond',
    condition: (stats) => stats.totalGames >= 50,
  },

  // ═══════════════════════════════════════════════════════════════════
  // 💰 수익률 업적 - 10개
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'profit_starter',
    name: '수익 시작',
    description: '수익률 10% 달성',
    emoji: '💵',
    category: 'return',
    tier: 'bronze',
    condition: (stats) => stats.totalReturn >= 10,
  },
  {
    id: 'profit_maker',
    name: '흑자 달성',
    description: '수익률 20% 달성',
    emoji: '💸',
    category: 'return',
    tier: 'bronze',
    condition: (stats) => stats.totalReturn >= 20,
  },
  {
    id: 'profit_hunter',
    name: '수익 사냥꾼',
    description: '수익률 30% 달성',
    emoji: '🎯',
    category: 'return',
    tier: 'silver',
    condition: (stats) => stats.totalReturn >= 30,
  },
  {
    id: 'golden_touch',
    name: '금손',
    description: '수익률 50% 달성',
    emoji: '✨',
    category: 'return',
    tier: 'silver',
    condition: (stats) => stats.totalReturn >= 50,
  },
  {
    id: 'profit_master',
    name: '수익의 달인',
    description: '수익률 70% 달성',
    emoji: '💎',
    category: 'return',
    tier: 'gold',
    condition: (stats) => stats.totalReturn >= 70,
  },
  {
    id: 'doubler',
    name: '원금 2배',
    description: '수익률 100% 달성',
    emoji: '🚀',
    category: 'return',
    tier: 'gold',
    condition: (stats) => stats.totalReturn >= 100,
  },
  {
    id: 'investment_god',
    name: '투자의 신',
    description: '수익률 150% 달성',
    emoji: '👑',
    category: 'return',
    tier: 'diamond',
    condition: (stats) => stats.totalReturn >= 150,
  },
  {
    id: 'warren_buffett',
    name: '워렌 버핏',
    description: '수익률 200% 달성',
    emoji: '🎩',
    category: 'return',
    tier: 'diamond',
    condition: (stats) => stats.totalReturn >= 200,
  },
  {
    id: 'tripler',
    name: '원금 3배',
    description: '수익률 300% 달성',
    emoji: '💫',
    category: 'return',
    tier: 'legendary',
    condition: (stats) => stats.totalReturn >= 300,
  },
  {
    id: 'impossible_return',
    name: '불가능을 가능으로',
    description: '수익률 500% 달성',
    emoji: '🌟',
    category: 'return',
    tier: 'legendary',
    condition: (stats) => stats.totalReturn >= 500,
  },

  // ═══════════════════════════════════════════════════════════════════
  // 🔥 연속 수익 업적 - 6개
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'win_streak_3',
    name: '연승 시작',
    description: '3연속 수익 달성',
    emoji: '📈',
    category: 'streak',
    tier: 'bronze',
    condition: (stats) => stats.winStreak >= 3,
  },
  {
    id: 'on_fire',
    name: '불타오르네',
    description: '5연속 수익 달성',
    emoji: '🔥',
    category: 'streak',
    tier: 'silver',
    condition: (stats) => stats.winStreak >= 5,
  },
  {
    id: 'streak_master',
    name: '연승 마스터',
    description: '7연속 수익 달성',
    emoji: '⚡',
    category: 'streak',
    tier: 'gold',
    condition: (stats) => stats.winStreak >= 7,
  },
  {
    id: 'unstoppable',
    name: '멈출 수 없어',
    description: '8연속 수익 달성',
    emoji: '🌊',
    category: 'streak',
    tier: 'gold',
    condition: (stats) => stats.winStreak >= 8,
  },
  {
    id: 'perfect_nine',
    name: '완벽한 9',
    description: '9연속 수익 달성',
    emoji: '9️⃣',
    category: 'streak',
    tier: 'diamond',
    condition: (stats) => stats.winStreak >= 9,
  },
  {
    id: 'perfect_ten',
    name: '퍼펙트 10',
    description: '10연속 수익 달성 (올클리어)',
    emoji: '💯',
    category: 'streak',
    tier: 'legendary',
    condition: (stats) => stats.winStreak >= 10,
  },

  // ═══════════════════════════════════════════════════════════════════
  // 🔄 역전/회복 업적 - 6개
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'survive_loss_2',
    name: '버티기',
    description: '2연속 손실 후 최종 수익',
    emoji: '💪',
    category: 'streak',
    tier: 'bronze',
    condition: (stats) => stats.loseStreak >= 2 && stats.totalReturn > 0,
  },
  {
    id: 'comeback_king',
    name: '역전의 명수',
    description: '3연속 손실 후 최종 수익',
    emoji: '🦁',
    category: 'streak',
    tier: 'silver',
    condition: (stats) => stats.loseStreak >= 3 && stats.totalReturn > 0,
  },
  {
    id: 'phoenix',
    name: '불사조',
    description: '4연속 손실 후 최종 수익',
    emoji: '🔶',
    category: 'streak',
    tier: 'gold',
    condition: (stats) => stats.loseStreak >= 4 && stats.totalReturn > 0,
  },
  {
    id: 'miracle_worker',
    name: '기적의 사나이',
    description: '5연속 손실 후 최종 수익',
    emoji: '🌈',
    category: 'streak',
    tier: 'diamond',
    condition: (stats) => stats.loseStreak >= 5 && stats.totalReturn > 0,
  },
  {
    id: 'survivor',
    name: '생존자',
    description: '손실 없이 게임 완료',
    emoji: '🛡️',
    category: 'streak',
    tier: 'gold',
    condition: (stats) => stats.negativeRounds === 0,
  },
  {
    id: 'mostly_winner',
    name: '대부분 승리',
    description: '80% 이상 라운드에서 수익',
    emoji: '📊',
    category: 'streak',
    tier: 'silver',
    condition: (stats) =>
      stats.positiveRounds + stats.negativeRounds >= 10 &&
      stats.positiveRounds / (stats.positiveRounds + stats.negativeRounds) >= 0.8,
  },

  // ═══════════════════════════════════════════════════════════════════
  // 🧮 합리성 업적 - 5개
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'rational_start',
    name: '합리적 판단',
    description: '합리적 선택 60% 이상',
    emoji: '🤔',
    category: 'strategy',
    tier: 'bronze',
    condition: (stats) => stats.rationalityScore >= 60,
  },
  {
    id: 'calculator',
    name: '계산기',
    description: '합리적 선택 80% 이상',
    emoji: '🧮',
    category: 'strategy',
    tier: 'silver',
    condition: (stats) => stats.rationalityScore >= 80,
  },
  {
    id: 'analyst',
    name: '분석가',
    description: '합리적 선택 90% 이상',
    emoji: '📐',
    category: 'strategy',
    tier: 'gold',
    condition: (stats) => stats.rationalityScore >= 90,
  },
  {
    id: 'perfect_logic',
    name: '완벽한 논리',
    description: '합리적 선택 95% 이상',
    emoji: '🤖',
    category: 'strategy',
    tier: 'diamond',
    condition: (stats) => stats.rationalityScore >= 95,
  },
  {
    id: 'ai_investor',
    name: 'AI 투자자',
    description: '합리적 선택 100%',
    emoji: '🧠',
    category: 'strategy',
    tier: 'legendary',
    condition: (stats) => stats.rationalityScore >= 100,
  },

  // ═══════════════════════════════════════════════════════════════════
  // 🎲 공격성 업적 - 5개
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'risk_curious',
    name: '위험 호기심',
    description: '공격적 선택 50% 이상',
    emoji: '🎰',
    category: 'strategy',
    tier: 'bronze',
    condition: (stats) => stats.riskScore >= 50,
  },
  {
    id: 'risk_taker',
    name: '도전자',
    description: '공격적 선택 70% 이상',
    emoji: '🎲',
    category: 'strategy',
    tier: 'silver',
    condition: (stats) => stats.riskScore >= 70,
  },
  {
    id: 'adventurer',
    name: '모험가',
    description: '공격적 선택 80% 이상',
    emoji: '⚔️',
    category: 'strategy',
    tier: 'gold',
    condition: (stats) => stats.riskScore >= 80,
  },
  {
    id: 'fearless',
    name: '겁 없는 자',
    description: '공격적 선택 90% 이상',
    emoji: '🦅',
    category: 'strategy',
    tier: 'diamond',
    condition: (stats) => stats.riskScore >= 90,
  },
  {
    id: 'all_in',
    name: '올인 투자자',
    description: '공격적 선택 100%',
    emoji: '💀',
    category: 'strategy',
    tier: 'legendary',
    condition: (stats) => stats.riskScore >= 100,
  },

  // ═══════════════════════════════════════════════════════════════════
  // 🛡️ 보수성 업적 - 4개
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'careful_investor',
    name: '신중한 투자자',
    description: '보수적 선택 70% 이상',
    emoji: '🐢',
    category: 'strategy',
    tier: 'silver',
    condition: (stats) => stats.riskScore <= 30,
  },
  {
    id: 'safety_first',
    name: '안전 제일',
    description: '보수적 선택 80% 이상',
    emoji: '🏰',
    category: 'strategy',
    tier: 'gold',
    condition: (stats) => stats.riskScore <= 20,
  },
  {
    id: 'iron_defense',
    name: '철통 방어',
    description: '보수적 선택 90% 이상',
    emoji: '🛡️',
    category: 'strategy',
    tier: 'diamond',
    condition: (stats) => stats.riskScore <= 10,
  },
  {
    id: 'ultimate_safety',
    name: '극도의 안전',
    description: '보수적 선택 100%',
    emoji: '🏦',
    category: 'strategy',
    tier: 'legendary',
    condition: (stats) => stats.riskScore <= 0,
  },

  // ═══════════════════════════════════════════════════════════════════
  // ⭐ 운 업적 - 5개
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'bit_lucky',
    name: '약간의 행운',
    description: '운 점수 30 이상',
    emoji: '🍀',
    category: 'luck',
    tier: 'bronze',
    condition: (stats) => stats.luckScore >= 30,
  },
  {
    id: 'lucky_star',
    name: '행운의 별',
    description: '운 점수 50 이상',
    emoji: '⭐',
    category: 'luck',
    tier: 'silver',
    condition: (stats) => stats.luckScore >= 50,
  },
  {
    id: 'fortune_cookie',
    name: '포춘 쿠키',
    description: '운 점수 70 이상',
    emoji: '🥠',
    category: 'luck',
    tier: 'gold',
    condition: (stats) => stats.luckScore >= 70,
  },
  {
    id: 'god_of_luck',
    name: '운의 신',
    description: '운 점수 90 이상',
    emoji: '🌠',
    category: 'luck',
    tier: 'diamond',
    condition: (stats) => stats.luckScore >= 90,
  },
  {
    id: 'impossible_luck',
    name: '불가능한 행운',
    description: '운 점수 100',
    emoji: '🎆',
    category: 'luck',
    tier: 'legendary',
    condition: (stats) => stats.luckScore >= 100,
  },

  // ═══════════════════════════════════════════════════════════════════
  // 🎭 특별 업적 - 4개
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'balanced',
    name: '균형 잡힌',
    description: '수익/손실 라운드 각각 4~6회',
    emoji: '⚖️',
    category: 'special',
    tier: 'silver',
    condition: (stats) =>
      stats.positiveRounds >= 4 &&
      stats.positiveRounds <= 6 &&
      stats.negativeRounds >= 4 &&
      stats.negativeRounds <= 6,
  },
  {
    id: 'zero_return',
    name: '제로섬',
    description: '수익률 -5%~5% 사이로 마무리',
    emoji: '0️⃣',
    category: 'special',
    tier: 'gold',
    condition: (stats) => stats.totalReturn >= -5 && stats.totalReturn <= 5,
  },
  {
    id: 'loss_experience',
    name: '손실 경험',
    description: '누적 8회 이상 손실 라운드',
    emoji: '📉',
    category: 'special',
    tier: 'bronze',
    condition: (stats) => stats.negativeRounds >= 8,
  },
  {
    id: 'unlucky',
    name: '불운의 상징',
    description: '운 점수 -30 이하',
    emoji: '🌧️',
    category: 'special',
    tier: 'silver',
    condition: (stats) => stats.luckScore <= -30,
  },
];

/**
 * 저장된 업적 목록 조회
 */
export function getUnlockedAchievements(): UnlockedAchievement[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * 새로 달성한 업적 확인 및 저장
 * @returns 새로 달성한 업적 목록
 */
export function checkAndUnlockAchievements(stats: GameStats): Achievement[] {
  const unlocked = getUnlockedAchievements();
  const unlockedIds = new Set(unlocked.map((a) => a.id));
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (!unlockedIds.has(achievement.id) && achievement.condition(stats)) {
      newlyUnlocked.push(achievement);
      unlocked.push({
        id: achievement.id,
        unlockedAt: new Date().toISOString(),
      });
    }
  }

  if (newlyUnlocked.length > 0) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
    } catch {
      // Storage full or unavailable
    }
  }

  return newlyUnlocked;
}

/**
 * 전체 업적 현황 조회
 */
export function getAchievementStatus(): {
  total: number;
  unlocked: number;
  achievements: Array<Achievement & { isUnlocked: boolean; unlockedAt?: string }>;
} {
  const unlocked = getUnlockedAchievements();
  const unlockedMap = new Map(unlocked.map((a) => [a.id, a.unlockedAt]));

  return {
    total: ACHIEVEMENTS.length,
    unlocked: unlocked.length,
    achievements: ACHIEVEMENTS.map((a) => ({
      ...a,
      isUnlocked: unlockedMap.has(a.id),
      unlockedAt: unlockedMap.get(a.id),
    })),
  };
}

/**
 * 업적 초기화 (테스트용)
 */
export function clearAchievements(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable
  }
}

/**
 * 게임 결과에서 스탯 계산
 * @param initialBalance 게임 시작 시 초기 잔액 (모드별로 다름)
 */
export function calculateGameStats(
  results: Array<{ actualOutcome: number; expectedValue: number }>,
  riskScore: number,
  rationalityScore: number,
  luckScore: number,
  totalGames: number,
  initialBalance: number = 10_000_000
): GameStats {
  let winStreak = 0;
  let loseStreak = 0;
  let currentWinStreak = 0;
  let currentLoseStreak = 0;
  let positiveRounds = 0;
  let negativeRounds = 0;
  let totalReturn = 0;

  for (const result of results) {
    totalReturn += result.actualOutcome;

    if (result.actualOutcome >= 0) {
      positiveRounds++;
      currentWinStreak++;
      currentLoseStreak = 0;
      winStreak = Math.max(winStreak, currentWinStreak);
    } else {
      negativeRounds++;
      currentLoseStreak++;
      currentWinStreak = 0;
      loseStreak = Math.max(loseStreak, currentLoseStreak);
    }
  }

  // 수익률을 퍼센트로 변환 (모드별 초기 자금 기준)
  const returnPercent = (totalReturn / initialBalance) * 100;

  return {
    totalReturn: returnPercent,
    winStreak,
    loseStreak,
    totalGames,
    positiveRounds,
    negativeRounds,
    riskScore,
    rationalityScore,
    luckScore,
  };
}
