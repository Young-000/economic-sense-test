/**
 * ExitConfirmDialog 컴포넌트 테스트
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExitConfirmDialog } from '../ExitConfirmDialog';

describe('ExitConfirmDialog', () => {
  it('should not render when closed', () => {
    const { container } = render(
      <ExitConfirmDialog open={false} onClose={vi.fn()} onConfirm={vi.fn()} />
    );

    expect(container.querySelector('.exit-dialog-overlay')).toBeNull();
  });

  it('should render when open', () => {
    render(<ExitConfirmDialog open={true} onClose={vi.fn()} onConfirm={vi.fn()} />);

    expect(screen.getByText('돈 감각 테스트를 종료할까요?')).toBeInTheDocument();
  });

  it('should show cancel and confirm buttons', () => {
    render(<ExitConfirmDialog open={true} onClose={vi.fn()} onConfirm={vi.fn()} />);

    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '종료하기' })).toBeInTheDocument();
  });

  it('should call onClose when cancel button clicked', () => {
    const onClose = vi.fn();
    render(<ExitConfirmDialog open={true} onClose={onClose} onConfirm={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: '취소' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onConfirm when confirm button clicked', () => {
    const onConfirm = vi.fn();
    render(<ExitConfirmDialog open={true} onClose={vi.fn()} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole('button', { name: '종료하기' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when overlay clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <ExitConfirmDialog open={true} onClose={onClose} onConfirm={vi.fn()} />
    );

    const overlay = container.querySelector('.exit-dialog-overlay');
    fireEvent.click(overlay!);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when dialog content clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <ExitConfirmDialog open={true} onClose={onClose} onConfirm={vi.fn()} />
    );

    const dialog = container.querySelector('.exit-dialog');
    fireEvent.click(dialog!);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('should have correct button classes', () => {
    const { container } = render(
      <ExitConfirmDialog open={true} onClose={vi.fn()} onConfirm={vi.fn()} />
    );

    expect(container.querySelector('.exit-dialog-cancel')).toBeInTheDocument();
    expect(container.querySelector('.exit-dialog-confirm')).toBeInTheDocument();
  });
});
