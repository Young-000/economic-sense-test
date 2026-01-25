import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdBannerProps {
  className?: string;
}

/**
 * Google AdSense 광고 배너 컴포넌트
 *
 * AdSense 계정: ca-pub-1379707580934572
 *
 * 참고:
 * - localhost에서는 광고가 표시되지 않음 (AdSense 정책)
 * - 프로덕션에서 400 에러 발생 시 → AdSense 계정/사이트 승인 대기 중
 * - 승인 완료 후 24-48시간 내 광고 표시 시작
 */
export function AdBanner({ className = '' }: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isAdLoaded = useRef(false);

  // 개발 환경 감지 (localhost 또는 127.0.0.1)
  const isDevelopment = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
     window.location.hostname === '127.0.0.1');

  useEffect(() => {
    // 개발 환경에서는 광고 로드 시도하지 않음
    if (isDevelopment || isAdLoaded.current || !adRef.current) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      isAdLoaded.current = true;
    } catch (error) {
      // 광고 로드 실패는 정상 상황 (승인 대기 등)
      // 프로덕션에서도 console.error 대신 warn 사용
      console.warn('AdSense:', error);
    }
  }, [isDevelopment]);

  // 개발 환경: placeholder 표시
  if (isDevelopment) {
    return (
      <div className={`ad-banner-container ${className}`}>
        <div
          style={{
            minHeight: '100px',
            background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            fontSize: '12px',
          }}
        >
          📢 광고 영역 (개발 환경)
        </div>
      </div>
    );
  }

  return (
    <div className={`ad-banner-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-1379707580934572"
        data-ad-slot="auto"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
