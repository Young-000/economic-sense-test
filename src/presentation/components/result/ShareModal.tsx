import { useCallback, useState } from 'react';
import type { InvestorProfile, FinalResult } from '@domain/entities';
import {
  shareImage,
  downloadBlob,
  canShareFiles,
} from '@lib/shareUtils';
import {
  generateShareText,
} from '@data/viralTemplates';

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: InvestorProfile;
  finalResult: FinalResult;
  shareImageUrl: string | null;
  shareImageBlob: Blob | null;
}

export function ShareModal({
  isOpen,
  onClose,
  profile,
  finalResult,
  shareImageUrl,
  shareImageBlob,
}: ShareModalProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  const getShareText = useCallback(
    (platform: 'default' | 'kakao' | 'twitter' | 'instagram' = 'default') => {
      return generateShareText(finalResult.investorType, finalResult.totalReturn, platform);
    },
    [finalResult]
  );

  // 이미지 다운로드
  const handleDownloadImage = useCallback(() => {
    if (!shareImageBlob) return;

    const filename = `돈감각테스트_${profile.name.replace(/\s/g, '_')}.png`;
    downloadBlob(shareImageBlob, filename);
    showToast('이미지가 저장되었어요!');
  }, [shareImageBlob, profile.name, showToast]);

  // 이미지 공유
  const handleShareImageAction = useCallback(async () => {
    if (!shareImageBlob) return;

    try {
      const shared = await shareImage(shareImageBlob, {
        title: '돈 감각 테스트 결과',
        text: getShareText(),
      });

      if (shared) {
        onClose();
      } else {
        handleDownloadImage();
      }
    } catch {
      handleDownloadImage();
    }
  }, [shareImageBlob, getShareText, onClose, handleDownloadImage]);

  // 카카오톡 공유
  const handleShareKakao = async (): Promise<void> => {
    const shareText = getShareText('kakao');
    try {
      await navigator.clipboard.writeText(shareText);
      showToast('카카오톡용 문구가 복사되었어요!');
    } catch {
      showToast('복사에 실패했어요.');
    }
  };

  // 트위터/X 공유
  const handleShareTwitter = (): void => {
    const shareText = getShareText('twitter');
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };

  // 인스타그램 공유
  const handleShareInstagram = async (): Promise<void> => {
    const shareText = getShareText('instagram');
    try {
      await navigator.clipboard.writeText(shareText);
      showToast('인스타그램 캡션이 복사되었어요!');
    } catch {
      showToast('복사에 실패했어요.');
    }
  };

  if (!isOpen || !shareImageUrl) return null;

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="share-modal-title">공유 이미지 미리보기</h2>
        <div className="share-modal-preview">
          <img src={shareImageUrl} alt="공유 이미지" />
        </div>

        <div className="share-modal-buttons">
          {canShareFiles() && (
            <button
              className="share-modal-btn primary"
              onClick={handleShareImageAction}
            >
              📤 공유하기
            </button>
          )}
          <button
            className="share-modal-btn secondary"
            onClick={handleDownloadImage}
          >
            💾 이미지 저장
          </button>
        </div>

        <div className="share-platform-section">
          <p className="share-platform-title">📝 플랫폼별 공유 문구</p>
          <div className="share-platform-buttons">
            <button
              className="share-platform-btn kakao"
              onClick={handleShareKakao}
            >
              💬 카카오톡
            </button>
            <button
              className="share-platform-btn twitter"
              onClick={handleShareTwitter}
            >
              𝕏 트위터
            </button>
            <button
              className="share-platform-btn instagram"
              onClick={handleShareInstagram}
            >
              📷 인스타
            </button>
          </div>
        </div>

        <button
          className="share-modal-close"
          onClick={onClose}
        >
          닫기
        </button>

        {toastMessage && (
          <div className="share-modal-toast" role="status" aria-live="polite">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}
