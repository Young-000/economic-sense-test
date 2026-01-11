/**
 * 업적 배지 컴포넌트
 * 새로 획득한 업적을 애니메이션과 함께 표시
 */
import { useState, useEffect } from 'react';
import type { Achievement } from '@data/achievementService';

export interface AchievementBadgeProps {
  achievement: Achievement;
  isNew?: boolean;
  onAnimationEnd?: () => void;
}

export function AchievementBadge({
  achievement,
  isNew = false,
  onAnimationEnd,
}: AchievementBadgeProps) {
  // 새 업적이 아닌 경우 즉시 visible, 새 업적인 경우 false로 시작
  const [isVisible, setIsVisible] = useState(!isNew);

  useEffect(() => {
    if (!isNew) return;
    // 새 업적인 경우 등장 애니메이션을 위해 지연 후 visible
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [isNew]);

  const handleAnimationEnd = () => {
    if (isNew && onAnimationEnd) {
      onAnimationEnd();
    }
  };

  return (
    <div
      className={`achievement-badge ${isNew ? 'new' : ''} ${isVisible ? 'visible' : ''}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <span className="achievement-emoji">{achievement.emoji}</span>
      <div className="achievement-info">
        <span className="achievement-name">{achievement.name}</span>
        <span className="achievement-desc">{achievement.description}</span>
      </div>
    </div>
  );
}

export interface AchievementListProps {
  achievements: Array<Achievement & { isUnlocked: boolean; unlockedAt?: string }>;
  showLocked?: boolean;
}

export function AchievementList({
  achievements,
  showLocked = true,
}: AchievementListProps) {
  const unlockedAchievements = achievements.filter((a) => a.isUnlocked);
  const lockedAchievements = achievements.filter((a) => !a.isUnlocked);

  return (
    <div className="achievement-list">
      <div className="achievements-unlocked">
        {unlockedAchievements.map((achievement) => (
          <div key={achievement.id} className="achievement-item unlocked">
            <span className="achievement-emoji">{achievement.emoji}</span>
            <div className="achievement-info">
              <span className="achievement-name">{achievement.name}</span>
              <span className="achievement-desc">{achievement.description}</span>
            </div>
          </div>
        ))}
      </div>

      {showLocked && lockedAchievements.length > 0 && (
        <div className="achievements-locked">
          {lockedAchievements.map((achievement) => (
            <div key={achievement.id} className="achievement-item locked">
              <span className="achievement-emoji locked">🔒</span>
              <div className="achievement-info">
                <span className="achievement-name">???</span>
                <span className="achievement-desc">{achievement.description}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export interface NewAchievementsPopupProps {
  achievements: Achievement[];
  onClose: () => void;
}

export function NewAchievementsPopup({
  achievements,
  onClose,
}: NewAchievementsPopupProps) {
  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (achievements.length === 0) return null;

  return (
    <div
      className="new-achievements-popup"
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievement-popup-title"
    >
      <div className="popup-content">
        <h3 id="achievement-popup-title" className="popup-title">🎉 업적 달성!</h3>
        <div className="new-achievements-list" role="list" aria-live="polite">
          {achievements.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              isNew={true}
            />
          ))}
        </div>
        <button className="popup-close-btn" onClick={onClose} autoFocus>
          확인
        </button>
      </div>
    </div>
  );
}
