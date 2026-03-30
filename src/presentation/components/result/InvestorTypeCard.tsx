import { useState } from 'react';
import type { InvestorProfile, InvestorType } from '@domain/entities';
import { investorDetails } from '@data/investorDetails';

export interface InvestorTypeCardProps {
  profile: InvestorProfile;
  investorType?: InvestorType;
}

export function InvestorTypeCard({ profile, investorType }: InvestorTypeCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const detail = investorType ? investorDetails[investorType] : null;

  return (
    <div
      className={`investor-type-card ${showDetail ? 'expanded' : ''}`}
      onClick={() => detail && setShowDetail(!showDetail)}
      role={detail ? 'button' : undefined}
      tabIndex={detail ? 0 : undefined}
    >
      <span className="type-emoji">{profile.emoji}</span>
      <h1 className="type-name">{profile.name}</h1>
      <span className="type-tag">#{profile.tag}</span>
      {detail && !showDetail && (
        <span className="type-tap-hint">탭하여 설명 보기</span>
      )}
      {detail && showDetail && (
        <p className="type-summary">{detail.summary}</p>
      )}
    </div>
  );
}
