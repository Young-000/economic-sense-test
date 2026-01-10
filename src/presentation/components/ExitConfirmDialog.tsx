/**
 * 종료 확인 다이얼로그
 * Apps in Toss 게임 체크리스트 필수 요소
 * - X 버튼 클릭 시 종료 확인 모달 표시
 * - 텍스트: "$서비스명$을 종료할까요?"
 * - 버튼: "취소" / "종료하기" (브랜드 컬러)
 */

interface ExitConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ExitConfirmDialog({ open, onClose, onConfirm }: ExitConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="exit-dialog-overlay" onClick={onClose}>
      <div className="exit-dialog" onClick={(e) => e.stopPropagation()}>
        <h2 className="exit-dialog-title">돈 감각 테스트를 종료할까요?</h2>
        <div className="exit-dialog-buttons">
          <button className="exit-dialog-cancel" onClick={onClose}>
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
