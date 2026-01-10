/**
 * 업적 시스템 서비스
 * 특정 조건 달성 시 배지 획득
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  condition: (stats: GameStats) => boolean;
}

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

// 업적 정의
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_game',
    name: '첫 걸음',
    description: '첫 게임을 완료했어요',
    emoji: '🎮',
    condition: (stats) => stats.totalGames >= 1,
  },
  {
    id: 'golden_touch',
    name: '금손',
    description: '수익률 50% 이상 달성',
    emoji: '✨',
    condition: (stats) => stats.totalReturn >= 50,
  },
  {
    id: 'survivor',
    name: '생존자',
    description: '손실 없이 게임 완료',
    emoji: '🛡️',
    condition: (stats) => stats.negativeRounds === 0,
  },
  {
    id: 'risk_taker',
    name: '도전자',
    description: '공격적 선택 70% 이상',
    emoji: '🎲',
    condition: (stats) => stats.riskScore >= 70,
  },
  {
    id: 'calculator',
    name: '계산기',
    description: '합리적 선택 80% 이상',
    emoji: '🧮',
    condition: (stats) => stats.rationalityScore >= 80,
  },
  {
    id: 'on_fire',
    name: '불타오르네',
    description: '5연속 수익 달성',
    emoji: '🔥',
    condition: (stats) => stats.winStreak >= 5,
  },
  {
    id: 'comeback_king',
    name: '역전의 명수',
    description: '3연속 손실 후 최종 수익',
    emoji: '👑',
    condition: (stats) => stats.loseStreak >= 3 && stats.totalReturn > 0,
  },
  {
    id: 'lucky_star',
    name: '행운의 별',
    description: '운 점수 50 이상',
    emoji: '⭐',
    condition: (stats) => stats.luckScore >= 50,
  },
  {
    id: 'veteran',
    name: '베테랑',
    description: '10게임 이상 플레이',
    emoji: '🎖️',
    condition: (stats) => stats.totalGames >= 10,
  },
  {
    id: 'perfect_ten',
    name: '퍼펙트 10',
    description: '10연속 수익 달성 (올클리어)',
    emoji: '💯',
    condition: (stats) => stats.winStreak >= 10,
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
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * 게임 결과에서 스탯 계산
 */
export function calculateGameStats(
  results: Array<{ actualOutcome: number; expectedValue: number }>,
  riskScore: number,
  rationalityScore: number,
  luckScore: number,
  totalGames: number
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

  // 수익률을 퍼센트로 변환 (초기 자금 1000만원 기준)
  const returnPercent = (totalReturn / 10_000_000) * 100;

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
