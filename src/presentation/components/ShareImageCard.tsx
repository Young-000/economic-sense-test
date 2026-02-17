/**
 * 공유용 이미지 카드 컴포넌트
 * 결과 화면을 SNS 공유용 이미지로 캡처하기 위한 전용 컴포넌트
 *
 * 바이럴 최적화 포인트:
 * - 결과에 따른 그라디언트 배너 (thumb-stop 효과)
 * - 티어 등급이 히어로 요소 (120px 원형 + 글로우)
 * - 수익률이 가장 큰 숫자 (32px+, 색상 코딩)
 * - 투자자 유형 이모지 + 이름 + 태그
 * - 앱 URL + CTA 하단 배치
 */
import { forwardRef } from 'react';
import type { InvestorProfile, TierInfo } from '@domain/entities';
import { formatBalance } from '@lib/formatUtils';

export interface ShareImageCardProps {
  profile: InvestorProfile;
  tier: TierInfo;
  finalBalance: number;
  initialBalance: number;
  totalReturn: number;
  riskScore: number;
  rationalityScore: number;
  luckScore: number;
}

/** 결과에 따른 그라디언트 색상 */
const getResultGradient = (totalReturn: number): string => {
  if (totalReturn >= 100) return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)';
  if (totalReturn >= 50) return 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)';
  if (totalReturn >= 0) return 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)';
  if (totalReturn >= -30) return 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)';
  return 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)';
};

/** 결과에 따른 리액션 문구 (바이럴용) */
const getViralReaction = (totalReturn: number): string => {
  if (totalReturn >= 100) return '🔥 대박났다!';
  if (totalReturn >= 50) return '💰 돈 버는 감각!';
  if (totalReturn >= 20) return '📈 꽤 잘했어요!';
  if (totalReturn >= 0) return '✨ 본전 사수!';
  if (totalReturn >= -20) return '😅 아쉬워요...';
  if (totalReturn >= -50) return '😭 다시 도전!';
  return '💀 풀빵 그 잡채...';
};

/**
 * 공유용 이미지 카드
 * html2canvas로 캡처하기 위해 forwardRef 사용
 *
 * Layout (top to bottom):
 * 1. Viral reaction banner (result-dependent gradient)
 * 2. App logo
 * 3. Tier grade circle (hero, 120px with glow)
 * 4. Investor type (emoji + name + tag)
 * 5. Balance + return percentage (most prominent number)
 * 6. Footer (URL + CTA pill)
 */
export const ShareImageCard = forwardRef<HTMLDivElement, ShareImageCardProps>(
  (
    {
      profile,
      tier,
      finalBalance,
      initialBalance,
      totalReturn,
    },
    ref
  ) => {
    const viralReaction = getViralReaction(totalReturn);
    const resultGradient = getResultGradient(totalReturn);
    const returnColor = totalReturn >= 0 ? '#10B981' : '#ff4757';

    return (
      <div ref={ref} className="share-image-card">
        {/* 바이럴 리액션 배너 */}
        <div className="share-viral-banner" style={{ background: resultGradient }}>
          <span className="share-viral-text">{viralReaction}</span>
          <span className="share-card-logo">💸 돈 감각 테스트</span>
        </div>

        {/* 티어 등급 히어로 */}
        <div className="share-tier-hero">
          <div
            className="share-tier-circle"
            style={{
              borderColor: tier.color,
              boxShadow: `0 0 24px ${tier.color}66, 0 0 48px ${tier.color}33`,
            }}
          >
            <span className="share-tier-grade" style={{ color: tier.color }}>
              {tier.grade}
            </span>
          </div>
          <span className="share-tier-name" style={{ color: tier.color }}>
            {tier.name}
          </span>
        </div>

        {/* 투자자 유형 */}
        <div className="share-investor-type">
          <span className="share-type-emoji">{profile.emoji}</span>
          <span className="share-type-name">{profile.name}</span>
          <span className="share-type-tag">#{profile.tag}</span>
        </div>

        {/* 최종 자산 + 수익률 */}
        <div className="share-balance-section">
          <span className="share-balance-label">최종 자산</span>
          <span className="share-balance-value">{formatBalance(finalBalance)}</span>
          <span
            className="share-return-value"
            style={{ color: returnColor }}
          >
            {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(1)}%
          </span>
          <span className="share-initial-note">
            (시작: {formatBalance(initialBalance)})
          </span>
        </div>

        {/* 푸터 - URL + CTA */}
        <div className="share-card-footer">
          <span className="share-card-url">economic-sense-test.vercel.app</span>
          <span className="share-card-cta">나도 테스트하기!</span>
        </div>
      </div>
    );
  }
);

ShareImageCard.displayName = 'ShareImageCard';
