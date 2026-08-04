/**
 * 미션 서비스 - 투자자 등급 테마 3트랙 미션 시스템
 *
 * Track 1: 투자자 (games played) - 씨앗 -> 개미 -> 큰손 -> 슈퍼개미
 * Track 2: 연속 도전 (streak) - 초보 -> 습관 -> 프로 -> 전설
 * Track 3: 수익왕 (tier achievements) - 인턴 -> 매니저 -> 임원 -> CEO
 *
 * 보상: 50/60/80/100 코인 per stage
 */

import { rewardMission } from './coinService';

// --- 타입 ---

export type MissionTrack = {
  id: string;
  name: string;
  emoji: string;
  stages: MissionStage[];
};

export type MissionStage = {
  level: number;
  target: number;
  reward: number;
  description: string;
};

export type MissionProgress = {
  trackId: string;
  currentLevel: number;
  progress: number;
  completedAt?: string;
};

type MissionState = Record<string, MissionProgress>;

// --- 상수 ---

const MISSION_STATE_KEY = 'economic-sense-test-missions';
const GAME_COUNT_KEY = 'economic-sense-test-game-count';
const STREAK_KEY = 'economic-sense-test-streak';
const BEST_TIER_KEY = 'economic-sense-test-best-tier';

// --- 미션 정의 ---

export const MISSION_TRACKS: MissionTrack[] = [
  {
    id: 'investor',
    name: '투자자',
    emoji: '🏦',
    stages: [
      { level: 1, target: 1, reward: 5, description: '씨앗 투자자: 첫 게임 완료' },
      { level: 2, target: 5, reward: 6, description: '개미 투자자: 5회 게임 완료' },
      { level: 3, target: 20, reward: 8, description: '큰손 투자자: 20회 게임 완료' },
      { level: 4, target: 50, reward: 10, description: '슈퍼개미: 50회 게임 완료' },
    ],
  },
  {
    id: 'streak',
    name: '연속 도전',
    emoji: '🔥',
    stages: [
      { level: 1, target: 3, reward: 5, description: '초보 도전자: 3일 연속' },
      { level: 2, target: 7, reward: 6, description: '습관 투자자: 7일 연속' },
      { level: 3, target: 14, reward: 8, description: '프로 투자자: 14일 연속' },
      { level: 4, target: 30, reward: 10, description: '전설의 투자자: 30일 연속' },
    ],
  },
  {
    id: 'tier_master',
    name: '수익왕',
    emoji: '💰',
    stages: [
      { level: 1, target: 1, reward: 5, description: '인턴: B티어 이상 달성' },
      { level: 2, target: 2, reward: 6, description: '매니저: A티어 이상 달성' },
      { level: 3, target: 3, reward: 8, description: '임원: S티어 이상 달성' },
      { level: 4, target: 4, reward: 10, description: 'CEO: SS티어 달성' },
    ],
  },
];

// 티어 -> 숫자 매핑 (비교용)
const TIER_LEVEL_MAP: Record<string, number> = {
  'F': 0, 'D': 0, 'C': 0,
  'B': 1, 'B+': 1,
  'A': 2, 'A+': 2,
  'S': 3, 'S+': 3,
  'SS': 4, 'SS+': 4,
};

// --- localStorage 관리 ---

function loadMissionState(): MissionState {
  try {
    const stored = localStorage.getItem(MISSION_STATE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveMissionState(state: MissionState): void {
  try {
    localStorage.setItem(MISSION_STATE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

function getProgress(trackId: string): MissionProgress {
  const state = loadMissionState();
  return state[trackId] ?? { trackId, currentLevel: 1, progress: 0 };
}

function setProgress(progress: MissionProgress): void {
  const state = loadMissionState();
  state[progress.trackId] = progress;
  saveMissionState(state);
}

// --- 게임 카운트 ---

export function getGameCount(): number {
  try {
    return Number(localStorage.getItem(GAME_COUNT_KEY) ?? '0');
  } catch {
    return 0;
  }
}

export function incrementGameCount(): void {
  try {
    const current = getGameCount();
    localStorage.setItem(GAME_COUNT_KEY, String(current + 1));
  } catch { /* ignore */ }
}

// --- 스트릭 ---

interface StreakData {
  currentStreak: number;
  lastPlayDate: string;
}

function loadStreak(): StreakData {
  try {
    const stored = localStorage.getItem(STREAK_KEY);
    return stored ? JSON.parse(stored) : { currentStreak: 0, lastPlayDate: '' };
  } catch {
    return { currentStreak: 0, lastPlayDate: '' };
  }
}

function saveStreak(data: StreakData): void {
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export function getStreak(): number {
  return loadStreak().currentStreak;
}

export function updateStreak(): number {
  const today = new Date().toISOString().slice(0, 10);
  const data = loadStreak();

  if (data.lastPlayDate === today) {
    return data.currentStreak;
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (data.lastPlayDate === yesterday) {
    data.currentStreak = data.currentStreak + 1;
  } else {
    data.currentStreak = 1;
  }

  data.lastPlayDate = today;
  saveStreak(data);
  return data.currentStreak;
}

// --- 최고 티어 ---

export function getBestTierLevel(): number {
  try {
    return Number(localStorage.getItem(BEST_TIER_KEY) ?? '0');
  } catch {
    return 0;
  }
}

export function updateBestTier(tierName: string): number {
  const newLevel = TIER_LEVEL_MAP[tierName] ?? 0;
  const current = getBestTierLevel();
  if (newLevel > current) {
    try {
      localStorage.setItem(BEST_TIER_KEY, String(newLevel));
    } catch { /* ignore */ }
    return newLevel;
  }
  return current;
}

// --- 미션 체크 ---

export type MissionCompletionResult = {
  trackId: string;
  trackName: string;
  trackEmoji: string;
  level: number;
  reward: number;
  description: string;
};

/**
 * 모든 미션 트랙을 체크하고, 달성된 스테이지가 있으면 보상 지급
 */
export function checkMissions(): MissionCompletionResult[] {
  const results: MissionCompletionResult[] = [];

  const gameCount = getGameCount();
  const streak = getStreak();
  const bestTier = getBestTierLevel();

  const progressValues: Record<string, number> = {
    investor: gameCount,
    streak: streak,
    tier_master: bestTier,
  };

  for (const track of MISSION_TRACKS) {
    const progress = getProgress(track.id);

    if (progress.completedAt) continue;

    const currentStage = track.stages.find(s => s.level === progress.currentLevel);
    if (!currentStage) continue;

    const currentValue = progressValues[track.id] ?? 0;

    if (currentValue >= currentStage.target) {
      // Stage completed
      rewardMission(currentStage.reward, `${track.name} Lv.${currentStage.level} 달성`);

      results.push({
        trackId: track.id,
        trackName: track.name,
        trackEmoji: track.emoji,
        level: currentStage.level,
        reward: currentStage.reward,
        description: currentStage.description,
      });

      // Advance to next stage
      const nextLevel = progress.currentLevel + 1;
      const hasNext = track.stages.some(s => s.level === nextLevel);

      setProgress({
        trackId: track.id,
        currentLevel: nextLevel,
        progress: currentValue,
        completedAt: hasNext ? undefined : new Date().toISOString(),
      });
    } else {
      // Update progress value
      setProgress({
        ...progress,
        progress: currentValue,
      });
    }
  }

  return results;
}

// --- UI 헬퍼 ---

export type MissionDisplayData = {
  trackId: string;
  trackName: string;
  trackEmoji: string;
  currentLevel: number;
  target: number;
  progress: number;
  reward: number;
  description: string;
  isCompleted: boolean;
};

export function getMissionDisplayData(): MissionDisplayData[] {
  const gameCount = getGameCount();
  const streak = getStreak();
  const bestTier = getBestTierLevel();

  const progressValues: Record<string, number> = {
    investor: gameCount,
    streak: streak,
    tier_master: bestTier,
  };

  return MISSION_TRACKS.map(track => {
    const missionProgress = getProgress(track.id);
    const isCompleted = !!missionProgress.completedAt;

    const currentStage = track.stages.find(s => s.level === missionProgress.currentLevel);
    const lastStage = track.stages[track.stages.length - 1];

    const stage = currentStage ?? lastStage;
    const currentValue = progressValues[track.id] ?? 0;

    return {
      trackId: track.id,
      trackName: track.name,
      trackEmoji: track.emoji,
      currentLevel: missionProgress.currentLevel,
      target: stage.target,
      progress: Math.min(currentValue, stage.target),
      reward: stage.reward,
      description: stage.description,
      isCompleted,
    };
  });
}

export function getCompletedMissionCount(): number {
  const state = loadMissionState();
  return Object.values(state).filter(p => p.completedAt).length;
}
