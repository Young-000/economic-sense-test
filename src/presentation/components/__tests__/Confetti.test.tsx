/**
 * Confetti 컴포넌트 테스트
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { Confetti } from '../Confetti';

describe('Confetti', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not render when inactive', () => {
    const { container } = render(<Confetti active={false} />);

    expect(container.querySelector('.confetti-container')).toBeNull();
  });

  it('should render when active', () => {
    const { container } = render(<Confetti active={true} />);

    expect(container.querySelector('.confetti-container')).not.toBeNull();
  });

  it('should render correct number of pieces', () => {
    const { container } = render(<Confetti active={true} count={30} />);

    const pieces = container.querySelectorAll('.confetti');
    expect(pieces).toHaveLength(30);
  });

  it('should use default count of 50', () => {
    const { container } = render(<Confetti active={true} />);

    const pieces = container.querySelectorAll('.confetti');
    expect(pieces).toHaveLength(50);
  });

  it('should hide after duration', () => {
    const { container } = render(<Confetti active={true} duration={2000} />);

    expect(container.querySelector('.confetti-container')).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(container.querySelector('.confetti-container')).toBeNull();
  });

  it('should call onComplete after duration', () => {
    const onComplete = vi.fn();
    render(<Confetti active={true} duration={3000} onComplete={onComplete} />);

    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('should have aria-hidden for accessibility', () => {
    const { container } = render(<Confetti active={true} />);

    const confettiContainer = container.querySelector('.confetti-container');
    expect(confettiContainer).toHaveAttribute('aria-hidden', 'true');
  });

  it('should apply styles to each piece', () => {
    const { container } = render(<Confetti active={true} count={5} />);

    const pieces = container.querySelectorAll('.confetti');
    pieces.forEach((piece) => {
      expect(piece).toHaveStyle({ backgroundColor: expect.any(String) });
    });
  });

  it('should cleanup timer on unmount', () => {
    const onComplete = vi.fn();
    const { unmount } = render(
      <Confetti active={true} duration={5000} onComplete={onComplete} />
    );

    unmount();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onComplete).not.toHaveBeenCalled();
  });

  it('should not re-render pieces when active changes to true', () => {
    const { container, rerender } = render(<Confetti active={false} />);

    expect(container.querySelector('.confetti-container')).toBeNull();

    rerender(<Confetti active={true} count={25} />);

    const pieces = container.querySelectorAll('.confetti');
    expect(pieces).toHaveLength(25);
  });

  it('should use default duration of 3000ms', () => {
    const onComplete = vi.fn();
    render(<Confetti active={true} onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
