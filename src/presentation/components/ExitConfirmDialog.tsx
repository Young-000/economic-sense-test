/**
 * 종료 확인 다이얼로그
 * Apps in Toss 게임 체크리스트 필수 요소
 * - X 버튼 클릭 시 종료 확인 모달 표시
 * - 텍스트: "$서비스명$을 종료할까요?"
 * - 버튼: "취소" / "종료하기" (브랜드 컬러)
 */

import { useEffect, useRef } from 'react';

interface ExitConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ExitConfirmDialog({ open, onClose, onConfirm }: ExitConfirmDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);

  // ESC 키로 닫기 및 포커스 관리
  useEffect(() => {
    if (!open) return;

    // 모달 오픈 시 취소 버튼에 포커스
    cancelButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="exit-dialog-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="exit-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-dialog-title"
      >
        <h2 id="exit-dialog-title" className="exit-dialog-title">
          돈 감각 테스트를 종료할까요?
        </h2>
        <div className="exit-dialog-buttons">
          <button
            ref={cancelButtonRef}
            className="exit-dialog-cancel"
            onClick={onClose}
          >
            취소
          </button>
          <button className="exit-dialog-confirm" onClick={onConfirm}>
            종료하기
          </button>
        </div>
      </div>
    </div>
  );
}
