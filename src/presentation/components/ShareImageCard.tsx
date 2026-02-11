/**
 * 공유용 이미지 카드 컴포넌트
 * 결과 화면을 SNS 공유용 이미지로 캡처하기 위한 전용 컴포넌트
 *
 * 바이럴 최적화 포인트:
 * - 강렬한 그라디언트 배경 (결과에 따라 다름)
 * - 큰 이모지와 타이포그래피
 * - 명확한 CTA
 * - FOMO 유발 문구
 */
import { forwardRef, type CSSProperties } from 'react';
import type { InvestorProfile, TierInfo, TierGrade } from '@domain/entities';
import { formatBalance, getLuckLabel } from '@lib/formatUtils';

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

// 결과에 따른 그라디언트 색상
const getResultGradient = (totalReturn: number): string => {
  if (totalReturn >= 100) return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'; // 골드
  if (totalReturn >= 50) return 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)'; // 그린
  if (totalReturn >= 0) return 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)'; // 퍼플
  if (totalReturn >= -30) return 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)'; // 오렌지
  return 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)'; // 레드
};

// 티어 등급별 아이콘
const getTierIcon = (grade: TierGrade): string => {
  switch (grade) {
    case 'SS': return '👑';
    case 'S': return '🔥';
    case 'F': return '💀';
    default: return '';
  }
};

// 티어 등급별 인라인 스타일 (html2canvas 호환)
const getTierCardStyle = (grade: TierGrade, color: string, bgColor: string): CSSProperties => {
  const base: CSSProperties = {
    textAlign: 'center' as const,
    padding: '24px 16px',
    marginBottom: '16px',
    borderRadius: '20px',
    border: `3px solid ${color}`,
    background: bgColor,
    position: 'relative' as const,
  };

  switch (grade) {
    case 'SS':
      return {
        ...base,
        background: 'linear-gradient(135deg, #3D2E00 0%, #5A4400 50%, #3D2E00 100%)',
        border: '4px solid #FFD700',
        boxShadow: '0 0 30px rgba(255, 215, 0, 0.5), inset 0 0 20px rgba(255, 215, 0, 0.1)',
      };
    case 'S':
      return {
        ...base,
        boxShadow: '0 0 20px rgba(255, 107, 53, 0.4)',
      };
    case 'F':
      return {
        ...base,
        boxShadow: '0 0 25px rgba(255, 82, 82, 0.5), inset 0 0 15px rgba(255, 82, 82, 0.1)',
      };
    default:
      return base;
  }
};

// 결과에 따른 리액션 문구 (바이럴용)
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
 */
export const ShareImageCard = forwardRef<HTMLDivElement, ShareImageCardProps>(
  (
    {
      profile,
      tier,
      finalBalance,
      initialBalance,
      totalReturn,
      riskScore,
      rationalityScore,
      luckScore,
    },
    ref
  ) => {
    const luckLabel = getLuckLabel(luckScore);

    const viralReaction = getViralReaction(totalReturn);
    const resultGradient = getResultGradient(totalReturn);

    return (
      <div ref={ref} className="share-image-card share-card-viral">
        {/* 바이럴 리액션 배지 */}
        <div className="share-viral-badge" style={{ background: resultGradient }}>
          <span className="share-viral-text">{viralReaction}</span>
        </div>

        {/* 헤더 */}
        <div className="share-card-header">
          <span className="share-card-logo">💸 돈 감각 테스트</span>
        </div>

        {/* 티어 배지 - 핵심 바이럴 요소 */}
        <div style={getTierCardStyle(tier.grade, tier.color, tier.bgColor)}>
          {getTierIcon(tier.grade) && (
            <span style={{ fontSize: '28px', display: 'block', marginBottom: '4px' }}>
              {getTierIcon(tier.grade)}
            </span>
          )}
          <span style={{
            display: 'block',
            fontSize: tier.grade === 'SS' ? '56px' : '48px',
            fontWeight: 900,
            color: tier.color,
            letterSpacing: '-2px',
            marginBottom: '4px',
            textShadow: tier.grade === 'SS' ? '0 0 20px rgba(255, 215, 0, 0.6)' : undefined,
          }}>
            {tier.grade}
          </span>
          <span style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: 700,
            color: tier.color,
            marginBottom: tier.grade === 'F' ? '6px' : '0',
          }}>
            {tier.name}
          </span>
          {tier.grade === 'F' && (
            <span style={{
              display: 'inline-block',
              fontSize: '12px',
              fontWeight: 700,
              color: '#FF5252',
              background: 'rgba(255, 82, 82, 0.15)',
              padding: '4px 10px',
              borderRadius: '10px',
              marginTop: '4px',
            }}>
              오히려 레전드
            </span>
          )}
        </div>

        {/* 투자자 유형 */}
        <div className="share-card-type" style={{ background: resultGradient }}>
          <span className="share-type-emoji">{profile.emoji}</span>
          <h2 className="share-type-name">{profile.name}</h2>
          <span className="share-type-tag">#{profile.tag}</span>
        </div>

        {/* 최종 자산 */}
        <div className="share-card-balance">
          <span className="share-balance-label">최종 자산</span>
          <span className="share-balance-value">{formatBalance(finalBalance)}</span>
          <span
            className="share-return-value share-return-large"
            style={{ color: totalReturn >= 0 ? 'var(--positive)' : 'var(--negative)' }}
          >
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

        {/* 푸터 - CTA 강화 */}
        <div className="share-card-footer">
          <span className="share-card-url">economic-sense-test.vercel.app</span>
          <span className="share-card-cta">👉 나도 테스트하기!</span>
        </div>

        {/* FOMO 유발 문구 */}
        <div className="share-card-fomo">
          <span>🏆 전체의 약 {tier.rarity}%만 달성! {tier.grade}등급 도전!</span>
        </div>
      </div>
    );
  }
);

ShareImageCard.displayName = 'ShareImageCard';
