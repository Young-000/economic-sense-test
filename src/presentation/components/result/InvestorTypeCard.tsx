import { useState } from 'react';
import type { InvestorProfile, InvestorType } from '@domain/entities';
import { INVESTOR_TYPE_CODES, INVESTOR_DIMENSIONS } from '@domain/entities';
import { investorDetails } from '@data/investorDetails';

export interface InvestorTypeCardProps {
  profile: InvestorProfile;
  investorType?: InvestorType;
  riskScore?: number;
  rationalityScore?: number;
  luckScore?: number;
}

export function InvestorTypeCard({
  profile, investorType,
  riskScore = 50, rationalityScore = 50, luckScore = 0,
}: InvestorTypeCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const detail = investorType ? investorDetails[investorType] : null;
  const code = investorType ? INVESTOR_TYPE_CODES[investorType] : '';

  // 각 차원별 0~100 비율 (바 표시용)
  const dimensions = [
    { ...INVESTOR_DIMENSIONS[0], value: riskScore },
    { ...INVESTOR_DIMENSIONS[1], value: rationalityScore },
    { ...INVESTOR_DIMENSIONS[2], value: Math.min(100, Math.max(0, 50 + luckScore / 2)) },
  ];

  return (
    <div
      className={`investor-type-card ${showDetail ? 'expanded' : ''}`}
      onClick={() => setShowDetail(!showDetail)}
      role="button"
      tabIndex={0}
    >
      <span className="type-emoji">{profile.emoji}</span>
      <span className="type-code">{code}</span>
      <h1 className="type-name">{profile.name}</h1>

      {!showDetail ? (
        <>
          <span className="type-tag">#{profile.tag}</span>
          <span className="type-tap-hint">탭하여 분석 보기</span>
        </>
      ) : (
        <div className="type-dimensions">
          {dimensions.map((dim) => (
            <div key={dim.key} className="dim-row">
              <span className="dim-label-left">{dim.leftEmoji} {dim.left}</span>
              <div className="dim-bar">
                <div className="dim-fill" style={{ width: `${dim.value}%` }} />
              </div>
              <span className="dim-label-right">{dim.right} {dim.rightEmoji}</span>
            </div>
          ))}
          {detail && <p className="type-summary">{detail.summary}</p>}
        </div>
      )}
    </div>
  );
}
