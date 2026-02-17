import { useState, useRef, useCallback } from 'react';
import type { RefObject } from 'react';
import type { FinalResult } from '@domain/entities';
import { elementToBlob } from '@lib/shareUtils';
import {
  generateShareText,
  generateClipboardText,
} from '@data/viralTemplates';

export interface UseShareImageReturn {
  shareCardRef: RefObject<HTMLDivElement | null>;
  isGeneratingImage: boolean;
  showShareModal: boolean;
  shareImageUrl: string | null;
  shareImageBlob: Blob | null;
  handleGenerateShareImage: () => Promise<void>;
  handleShareText: () => Promise<void>;
  handleCloseShareModal: () => void;
}

export function useShareImage(finalResult: FinalResult | null): UseShareImageReturn {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const [shareImageBlob, setShareImageBlob] = useState<Blob | null>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const getShareText = useCallback(
    (platform: 'default' | 'kakao' | 'twitter' | 'instagram' = 'default') => {
      if (!finalResult) return '';
      return generateShareText(finalResult.investorType, finalResult.totalReturn, platform);
    },
    [finalResult]
  );

  const getClipboardText = useCallback(() => {
    if (!finalResult) return '';
    return generateClipboardText(
      finalResult.profile.name,
      finalResult.profile.emoji,
      finalResult.totalReturn
    );
  }, [finalResult]);

  const handleGenerateShareImage = useCallback(async (): Promise<void> => {
    if (!shareCardRef.current || isGeneratingImage) return;

    setIsGeneratingImage(true);

    try {
      const blob = await elementToBlob(shareCardRef.current, {
        scale: 2,
        backgroundColor: '#0a0a0a',
      });

      setShareImageBlob(blob);
      const url = URL.createObjectURL(blob);
      setShareImageUrl(url);
      setShowShareModal(true);
    } catch (error) {
      console.error('이미지 생성 실패:', error);
      alert('이미지 생성에 실패했습니다.');
    } finally {
      setIsGeneratingImage(false);
    }
  }, [isGeneratingImage]);

  const handleShareText = useCallback(async (): Promise<void> => {
    const shareText = getShareText('default');

    if (navigator.share) {
      try {
        await navigator.share({
          title: '돈 감각 테스트',
          text: shareText,
          url: window.location.origin,
        });
        return;
      } catch {
        // 무시
      }
    }

    const clipboardText = getClipboardText();
    try {
      await navigator.clipboard.writeText(clipboardText);
      alert('결과가 복사되었습니다!');
    } catch {
      alert(clipboardText);
    }
  }, [getShareText, getClipboardText]);

  const handleCloseShareModal = useCallback((): void => {
    setShowShareModal(false);
    if (shareImageUrl) {
      URL.revokeObjectURL(shareImageUrl);
      setShareImageUrl(null);
    }
  }, [shareImageUrl]);

  return {
    shareCardRef,
    isGeneratingImage,
    showShareModal,
    shareImageUrl,
    shareImageBlob,
    handleGenerateShareImage,
    handleShareText,
    handleCloseShareModal,
  };
}
