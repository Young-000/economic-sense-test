import { useState, useRef, useCallback } from 'react';
import type { RefObject } from 'react';
import { share } from '@apps-in-toss/web-framework';
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
  feedbackMessage: string | null;
  feedbackType: 'success' | 'error' | null;
  handleGenerateShareImage: () => Promise<void>;
  handleShareText: () => Promise<void>;
  handleCloseShareModal: () => void;
  dismissFeedback: () => void;
}

export function useShareImage(finalResult: FinalResult | null): UseShareImageReturn {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const [shareImageBlob, setShareImageBlob] = useState<Blob | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const shareCardRef = useRef<HTMLDivElement>(null);

  const showFeedback = useCallback((message: string, type: 'success' | 'error') => {
    setFeedbackMessage(message);
    setFeedbackType(type);
    clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => {
      setFeedbackMessage(null);
      setFeedbackType(null);
    }, 3000);
  }, []);

  const dismissFeedback = useCallback(() => {
    setFeedbackMessage(null);
    setFeedbackType(null);
    clearTimeout(feedbackTimerRef.current);
  }, []);

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
      showFeedback('이미지 생성에 실패했어요. 다시 시도해 주세요.', 'error');
    } finally {
      setIsGeneratingImage(false);
    }
  }, [isGeneratingImage]);

  const handleShareText = useCallback(async (): Promise<void> => {
    const shareText = getShareText('default');

    try {
      await share({ message: `${shareText}\n${window.location.origin}` });
      return;
    } catch {
      // AIT share 실패 시 클립보드 fallback
    }

    const clipboardText = getClipboardText();
    try {
      await navigator.clipboard.writeText(clipboardText);
      showFeedback('결과가 복사되었어요!', 'success');
    } catch {
      showFeedback('복사에 실패했어요. 텍스트를 직접 선택해 주세요.', 'error');
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
    feedbackMessage,
    feedbackType,
    handleGenerateShareImage,
    handleShareText,
    handleCloseShareModal,
    dismissFeedback,
  };
}
