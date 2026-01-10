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
      condition: () => true,
      isUnlocked: true,
    },
    {
      id: 'risky',
      name: '모험가',
      description: '위험한 선택 5회',
      emoji: '🎲',
      condition: () => true,
      isUnlocked: false,
    },
  ];

  it('should render unlocked achievements', () => {
    render(<AchievementList achievements={mockAchievements} />);

    expect(screen.getByText('첫 걸음')).toBeInTheDocument();
    expect(screen.getByText('백만장자')).toBeInTheDocument();
  });

  it('should render locked achievements by default', () => {
    render(<AchievementList achievements={mockAchievements} />);

    // 잠긴 업적은 '???' 으로 표시
    expect(screen.getByText('???')).toBeInTheDocument();
    expect(screen.getByText('🔒')).toBeInTheDocument();
  });

  it('should hide locked achievements when showLocked is false', () => {
    render(<AchievementList achievements={mockAchievements} showLocked={false} />);

    expect(screen.queryByText('???')).not.toBeInTheDocument();
    expect(screen.queryByText('🔒')).not.toBeInTheDocument();
  });

  it('should show description for locked achievements', () => {
    render(<AchievementList achievements={mockAchievements} />);

    expect(screen.getByText('위험한 선택 5회')).toBeInTheDocument();
  });

  it('should have correct classes for unlocked/locked items', () => {
    const { container } = render(<AchievementList achievements={mockAchievements} />);

    const unlockedItems = container.querySelectorAll('.achievement-item.unlocked');
    const lockedItems = container.querySelectorAll('.achievement-item.locked');

    expect(unlockedItems).toHaveLength(2);
    expect(lockedItems).toHaveLength(1);
  });

  it('should render empty list when no achievements', () => {
    const { container } = render(<AchievementList achievements={[]} />);

    const items = container.querySelectorAll('.achievement-item');
    expect(items).toHaveLength(0);
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
