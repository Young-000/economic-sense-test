/**
 * AchievementBadge 컴포넌트 테스트
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import {
  AchievementBadge,
  AchievementList,
  NewAchievementsPopup,
} from '../AchievementBadge';
import type { Achievement } from '@data/achievementService';

const mockAchievement: Achievement = {
  id: 'first_game',
  name: '첫 걸음',
  description: '첫 게임을 완료했어요!',
  emoji: '🎮',
  category: 'milestone',
  tier: 'bronze',
  condition: () => true,
};

describe('AchievementBadge', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render achievement info', () => {
    render(<AchievementBadge achievement={mockAchievement} />);

    expect(screen.getByText('🎮')).toBeInTheDocument();
    expect(screen.getByText('첫 걸음')).toBeInTheDocument();
    expect(screen.getByText('첫 게임을 완료했어요!')).toBeInTheDocument();
  });

  it('should be visible immediately when not new', () => {
    const { container } = render(<AchievementBadge achievement={mockAchievement} />);

    const badge = container.querySelector('.achievement-badge');
    expect(badge).toHaveClass('visible');
    expect(badge).not.toHaveClass('new');
  });

  it('should have new class when isNew is true', () => {
    const { container } = render(
      <AchievementBadge achievement={mockAchievement} isNew={true} />
    );

    const badge = container.querySelector('.achievement-badge');
    expect(badge).toHaveClass('new');
  });

  it('should become visible after delay when isNew', () => {
    const { container } = render(
      <AchievementBadge achievement={mockAchievement} isNew={true} />
    );

    const badge = container.querySelector('.achievement-badge');
    expect(badge).not.toHaveClass('visible');

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(badge).toHaveClass('visible');
  });

  it('should call onAnimationEnd when animation ends and isNew', () => {
    const onAnimationEnd = vi.fn();
    const { container } = render(
      <AchievementBadge
        achievement={mockAchievement}
        isNew={true}
        onAnimationEnd={onAnimationEnd}
      />
    );

    const badge = container.querySelector('.achievement-badge');
    fireEvent.animationEnd(badge!);

    expect(onAnimationEnd).toHaveBeenCalledTimes(1);
  });

  it('should not call onAnimationEnd when not isNew', () => {
    const onAnimationEnd = vi.fn();
    const { container } = render(
      <AchievementBadge
        achievement={mockAchievement}
        isNew={false}
        onAnimationEnd={onAnimationEnd}
      />
    );

    const badge = container.querySelector('.achievement-badge');
    fireEvent.animationEnd(badge!);

    expect(onAnimationEnd).not.toHaveBeenCalled();
  });
});

describe('AchievementList', () => {
  const mockAchievements = [
    { ...mockAchievement, isUnlocked: true, unlockedAt: '2025-01-01' },
    {
      id: 'millionaire',
      name: '백만장자',
      description: '백만원 이상 벌기',
      emoji: '💰',
      category: 'return' as const,
      tier: 'gold' as const,
      condition: () => true,
      isUnlocked: true,
    },
    {
      id: 'risky',
      name: '모험가',
      description: '위험한 선택 5회',
      emoji: '🎲',
      category: 'strategy' as const,
      tier: 'silver' as const,
      condition: () => true,
      isUnlocked: false,
    },
  ];

  it('should render categories with achievements', () => {
    const { container } = render(<AchievementList achievements={mockAchievements} />);

    // 카테고리가 렌더링되어야 함
    const categories = container.querySelectorAll('.achievement-category');
    expect(categories.length).toBeGreaterThan(0);
  });

  it('should show category names', () => {
    render(<AchievementList achievements={mockAchievements} />);

    // 카테고리 이름 확인 (마일스톤, 수익률, 전략)
    expect(screen.getByText('마일스톤')).toBeInTheDocument();
    expect(screen.getByText('수익률')).toBeInTheDocument();
    expect(screen.getByText('전략')).toBeInTheDocument();
  });

  it('should show category progress', () => {
    const { container } = render(<AchievementList achievements={mockAchievements} />);

    // 각 카테고리의 진행률이 표시되어야 함 (예: "1/1")
    const progressElements = container.querySelectorAll('.category-progress');
    expect(progressElements.length).toBeGreaterThan(0);
  });

  it('should render tier badges', () => {
    const { container } = render(<AchievementList achievements={mockAchievements} />);

    // 티어 뱃지가 렌더링되어야 함
    const tierBadges = container.querySelectorAll('.tier-badge');
    expect(tierBadges).toHaveLength(3); // 3개 업적
  });

  it('should have correct classes for unlocked/locked badges', () => {
    const { container } = render(<AchievementList achievements={mockAchievements} />);

    const unlockedBadges = container.querySelectorAll('.tier-badge.unlocked');
    const lockedBadges = container.querySelectorAll('.tier-badge.locked');

    expect(unlockedBadges).toHaveLength(2);
    expect(lockedBadges).toHaveLength(1);
  });

  it('should render empty list when no achievements', () => {
    const { container } = render(<AchievementList achievements={[]} />);

    const categories = container.querySelectorAll('.achievement-category');
    expect(categories).toHaveLength(0);
  });
});

describe('NewAchievementsPopup', () => {
  const mockNewAchievements: Achievement[] = [
    mockAchievement,
    {
      id: 'lucky',
      name: '운빨',
      description: '운 좋게 대박!',
      emoji: '🍀',
      category: 'luck',
      tier: 'silver',
      condition: () => true,
    },
  ];

  it('should render nothing when no achievements', () => {
    const { container } = render(
      <NewAchievementsPopup achievements={[]} onClose={vi.fn()} />
    );

    expect(container.querySelector('.new-achievements-popup')).toBeNull();
  });

  it('should render popup with achievements', () => {
    render(<NewAchievementsPopup achievements={mockNewAchievements} onClose={vi.fn()} />);

    expect(screen.getByText('🎉 업적 달성!')).toBeInTheDocument();
    expect(screen.getByText('첫 걸음')).toBeInTheDocument();
    expect(screen.getByText('운빨')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<NewAchievementsPopup achievements={mockNewAchievements} onClose={vi.fn()} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'achievement-popup-title');
  });

  it('should call onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<NewAchievementsPopup achievements={mockNewAchievements} onClose={onClose} />);

    const closeBtn = screen.getByRole('button', { name: '확인' });
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when ESC key pressed', () => {
    const onClose = vi.fn();
    render(<NewAchievementsPopup achievements={mockNewAchievements} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose for other keys', () => {
    const onClose = vi.fn();
    render(<NewAchievementsPopup achievements={mockNewAchievements} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Enter' });
    fireEvent.keyDown(document, { key: 'a' });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('should have close button rendered', () => {
    render(<NewAchievementsPopup achievements={mockNewAchievements} onClose={vi.fn()} />);

    const closeBtn = screen.getByRole('button', { name: '확인' });
    expect(closeBtn).toBeInTheDocument();
    expect(closeBtn).toHaveClass('popup-close-btn');
  });

  it('should cleanup event listener on unmount', () => {
    const onClose = vi.fn();
    const { unmount } = render(
      <NewAchievementsPopup achievements={mockNewAchievements} onClose={onClose} />
    );

    unmount();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });
});
