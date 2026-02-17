import { useState, useEffect, useCallback } from 'react';
import type { FinalResult, RoundResult, GameMode } from '@domain/entities';
import {
  checkAndUnlockAchievements,
  getAchievementStatus,
  calculateGameStats,
  type Achievement,
} from '@data/achievementService';
import { AchievementList } from '@presentation/components';

export interface AchievementSectionProps {
  finalResult: FinalResult;
  gameResults: RoundResult[];
  initialBalance: number;
  gameMode: GameMode;
  onAchievementsUnlocked?: (achievements: Achievement[]) => void;
}

export function AchievementSection({
  finalResult,
  gameResults,
  initialBalance,
  onAchievementsUnlocked,
}: AchievementSectionProps) {
  const [showAchievementList, setShowAchievementList] = useState(false);
  const [achievementStatus, setAchievementStatus] = useState(() => getAchievementStatus());

  const stableCallback = useCallback(
    (achievements: Achievement[]) => {
      onAchievementsUnlocked?.(achievements);
    },
    [onAchievementsUnlocked]
  );

  useEffect(() => {
    const totalGamesPlayed = parseInt(localStorage.getItem('economic-sense-total-games') || '0', 10) + 1;
    localStorage.setItem('economic-sense-total-games', String(totalGamesPlayed));

    const gameStats = calculateGameStats(
      gameResults.map((r) => ({ actualOutcome: r.actualOutcome, expectedValue: r.expectedValue })),
      finalResult.riskScore,
      finalResult.rationalityScore,
      finalResult.luckScore,
      totalGamesPlayed,
      initialBalance
    );

    const unlocked = checkAndUnlockAchievements(gameStats);
    if (unlocked.length > 0) {
      setShowAchievementList(true);
      setAchievementStatus(getAchievementStatus());
      stableCallback(unlocked);
    }
  }, [finalResult, gameResults, initialBalance, stableCallback]);

  return (
    <div className="achievements-section">
      <button
        className="toggle-achievements-btn"
        onClick={() => setShowAchievementList(!showAchievementList)}
      >
        🏅 업적 ({achievementStatus.unlocked}/{achievementStatus.total}) {showAchievementList ? '▲' : '▼'}
      </button>
      {showAchievementList && (
        <AchievementList
          achievements={achievementStatus.achievements}
          showLocked={true}
        />
      )}
    </div>
  );
}
