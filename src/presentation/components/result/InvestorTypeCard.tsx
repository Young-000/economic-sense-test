import type { InvestorProfile } from '@domain/entities';

export interface InvestorTypeCardProps {
  profile: InvestorProfile;
}

export function InvestorTypeCard({ profile }: InvestorTypeCardProps) {
  return (
    <div className="investor-type-card">
      <span className="type-emoji">{profile.emoji}</span>
      <h1 className="type-name">{profile.name}</h1>
      <span className="type-tag">#{profile.tag}</span>
    </div>
  );
}
