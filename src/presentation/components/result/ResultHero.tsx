import type { TierInfo } from '@domain/entities';

export interface ResultHeroProps {
  tier: TierInfo;
  isNewRecord: boolean;
}

export function ResultHero({ tier, isNewRecord }: ResultHeroProps) {
  return (
    <>
      {/* 신기록 배지 */}
      {isNewRecord && (
        <div className="new-record-badge">신기록 달성!</div>
      )}

      {/* 티어 배지 - 핵심 히어로 요소 */}
      <div
        className="tier-badge-hero"
        style={{ '--tier-color': tier.color, '--tier-bg': tier.bgColor } as React.CSSProperties}
      >
        <div className="tier-grade-display">
          <span className="tier-grade-letter">{tier.grade}</span>
        </div>
        <span className="tier-name">{tier.name}</span>
        <span className="tier-description">{tier.description}</span>
      </div>
    </>
  );
}
