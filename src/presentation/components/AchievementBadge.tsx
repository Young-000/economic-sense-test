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

// 카테고리별 정보
const CATEGORY_INFO: Record<string, { name: string; emoji: string }> = {
  milestone: { name: '마일스톤', emoji: '🎮' },
  return: { name: '수익률', emoji: '💰' },
  streak: { name: '연속기록', emoji: '🔥' },
  strategy: { name: '전략', emoji: '🧠' },
  luck: { name: '운', emoji: '🍀' },
  special: { name: '특별', emoji: '⭐' },
};

// 티어별 뱃지 이모지
const TIER_BADGES: Record<string, string> = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🏅',
  diamond: '💎',
  legendary: '👑',
};

export function AchievementList({
  achievements,
}: AchievementListProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // 카테고리별로 그룹화
  const groupedByCategory = achievements.reduce((acc, achievement) => {
    const category = achievement.category || 'special';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(achievement);
    return acc;
  }, {} as Record<string, typeof achievements>);

  // 카테고리 순서 정의
  const categoryOrder = ['milestone', 'return', 'streak', 'strategy', 'luck', 'special'];

  // 툴팁 토글 (모바일 클릭 지원)
  const handleBadgeClick = (id: string, isUnlocked: boolean) => {
    if (!isUnlocked) return;
    setActiveTooltip(activeTooltip === id ? null : id);
  };

  // 외부 클릭 시 툴팁 닫기
  useEffect(() => {
    const handleClickOutside = () => setActiveTooltip(null);
    if (activeTooltip) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeTooltip]);

  return (
    <div className="achievement-list compact">
      {categoryOrder.map((category) => {
        const categoryAchievements = groupedByCategory[category];
        if (!categoryAchievements || categoryAchievements.length === 0) return null;

        const info = CATEGORY_INFO[category] || { name: category, emoji: '📌' };
        const unlocked = categoryAchievements.filter((a) => a.isUnlocked);
        const total = categoryAchievements.length;

        // 티어별 달성 현황 (description 포함)
        const tierProgress = categoryAchievements
          .sort((a, b) => {
            const tierOrder = ['bronze', 'silver', 'gold', 'diamond', 'legendary'];
            return tierOrder.indexOf(a.tier || 'bronze') - tierOrder.indexOf(b.tier || 'bronze');
          })
          .map((a) => ({
            id: a.id,
            tier: a.tier || 'bronze',
            unlocked: a.isUnlocked,
            name: a.name,
            emoji: a.emoji,
            description: a.description,
          }));

        return (
          <div key={category} className="achievement-category">
            <div className="category-header">
              <span className="category-icon">{info.emoji}</span>
              <span className="category-name">{info.name}</span>
              <span className="category-progress">{unlocked.length}/{total}</span>
            </div>
            <div className="tier-badges">
              {tierProgress.map((item) => (
                <div
                  key={item.id}
                  className={`tier-badge ${item.unlocked ? 'unlocked' : 'locked'} ${activeTooltip === item.id ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBadgeClick(item.id, item.unlocked);
                  }}
                  onMouseEnter={() => item.unlocked && setActiveTooltip(item.id)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  role="button"
                  tabIndex={item.unlocked ? 0 : -1}
                  aria-label={item.unlocked ? `${item.name}: ${item.description}` : '미달성 업적'}
                >
                  {item.unlocked ? item.emoji : TIER_BADGES[item.tier]}
                  {/* 커스텀 툴팁 */}
                  {item.unlocked && activeTooltip === item.id && (
                    <div className="achievement-tooltip">
                      <span className="tooltip-name">{item.name}</span>
                      <span className="tooltip-desc">{item.description}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
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
