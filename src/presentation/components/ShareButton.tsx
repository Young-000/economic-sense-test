import React, { useState } from 'react';

interface ShareButtonProps {
  characterName: string;
  characterCode: string;
}

export function ShareButton({ characterName, characterCode }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareText = `나의 경제 유형은 "${characterName}" (${characterCode})입니다! 🎯\n\n경제감각 테스트로 알아보세요!`;
    const shareUrl = window.location.href;

    // Web Share API 지원 시
    if (navigator.share) {
      try {
        await navigator.share({
          title: '경제감각 테스트 결과',
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // 사용자가 취소한 경우 무시
        if ((err as Error).name === 'AbortError') return;
      }
    }

    // 폴백: 클립보드에 복사
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 API도 실패 시 alert
      alert(shareText);
    }
  };

  return (
    <button className="share-button" onClick={handleShare}>
      {copied ? '복사됨!' : '결과 공유하기'}
    </button>
  );
}
