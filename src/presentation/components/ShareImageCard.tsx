/**
 * 공유용 이미지 카드 컴포넌트
 * 결과 화면을 SNS 공유용 이미지로 캡처하기 위한 전용 컴포넌트
 */
import { forwardRef } from 'react';
import type { InvestorProfile } from '@domain/entities';
import { formatBalance } from '@lib/formatUtils';

export interface ShareImageCardProps {
  profile: InvestorProfile;
  finalBalance: number;
  initialBalance: number;
  totalReturn: number;
  riskScore: number;
  rationalityScore: number;
  luckScore: number;
}

/**
 * 공유용 이미지 카드
 * html2canvas로 캡처하기 위해 forwardRef 사용
 */
export const ShareImageCard = forwardRef<HTMLDivElement, ShareImageCardProps>(
  (
    {
      profile,
      finalBalance,
      initialBalance,
      totalReturn,
      riskScore,
      rationalityScore,
      luckScore,
    },
    ref
  ) => {
    const returnClassName = (() => {
      if (totalReturn >= 50) return 'return-great';
      if (totalReturn >= 0) return 'return-good';
      if (totalReturn >= -30) return 'return-bad';
      return 'return-terrible';
    })();

    const luckLabel = (() => {
      if (luckScore >= 50) return '대박 행운!';
      if (luckScore >= 20) return '운 좋았어요';
      if (luckScore >= -20) return '평균적인 운';
      if (luckScore >= -50) return '운이 없었네요';
      return '극심한 불운';
    })();

    return (
      <div ref={ref} className="share-image-card">
        {/* 헤더 */}
        <div className="share-card-header">
          <span className="share-card-logo">돈 감각 테스트</span>
        </div>

        {/* 투자자 유형 */}
        <div className="share-card-type">
          <span className="share-type-emoji">{profile.emoji}</span>
          <h2 className="share-type-name">{profile.name}</h2>
          <span className="share-type-tag">#{profile.tag}</span>
        </div>

        {/* 최종 자산 */}
        <div className="share-card-balance">
          <span className="share-balance-label">최종 자산</span>
          <span className="share-balance-value">{formatBalance(finalBalance)}</span>
          <span className={`share-return-value ${returnClassName}`}>
            {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(1)}%
          </span>
          <span className="share-initial-note">
            (시작: {formatBalance(initialBalance)})
          </span>
        </div>

        {/* 상세 통계 */}
        <div className="share-card-stats">
          <div className="share-stat-item">
            <span className="share-stat-label">공격성</span>
            <div className="share-stat-bar">
              <div
                className="share-stat-fill risk"
                style={{ width: `${riskScore}%` }}
              />
            </div>
            <span className="share-stat-value">{riskScore}%</span>
          </div>

          <div className="share-stat-item">
            <span className="share-stat-label">합리성</span>
            <div className="share-stat-bar">
              <div
                className="share-stat-fill rational"
                style={{ width: `${rationalityScore}%` }}
              />
            </div>
            <span className="share-stat-value">{rationalityScore}%</span>
          </div>

          <div className="share-stat-item">
            <span className="share-stat-label">운</span>
            <div className="share-stat-bar luck-bar">
              <div
                className={`share-stat-fill luck ${luckScore >= 0 ? 'positive' : 'negative'}`}
                style={{
                  width: `${Math.abs(luckScore) / 2}%`,
                  marginLeft: luckScore >= 0 ? '50%' : `${50 - Math.abs(luckScore) / 2}%`,
                }}
              />
              <div className="share-luck-center" />
            </div>
            <span className="share-stat-value">{luckLabel}</span>
          </div>
        </div>

        {/* 설명 */}
        <div className="share-card-description">
          <p>{profile.description}</p>
        </div>

        {/* 푸터 */}
        <div className="share-card-footer">
          <span className="share-card-url">economic-sense-test.vercel.app</span>
          <span className="share-card-cta">나도 테스트하기!</span>
        </div>
      </div>
    );
  }
);

ShareImageCard.displayName = 'ShareImageCard';
