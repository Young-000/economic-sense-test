import { formatBalance } from '@lib/formatUtils';

export interface AssetSummaryCardProps {
  finalBalance: number;
  initialBalance: number;
  totalReturn: number;
}

function getReturnClassName(totalReturn: number): string {
  if (totalReturn >= 50) return 'return-great';
  if (totalReturn >= 0) return 'return-good';
  if (totalReturn >= -30) return 'return-bad';
  return 'return-terrible';
}

export function AssetSummaryCard({ finalBalance, initialBalance, totalReturn }: AssetSummaryCardProps) {
  const returnClassName = getReturnClassName(totalReturn);

  return (
    <div className="final-balance-card">
      <span className="balance-label">최종 자산</span>
      <span className="balance-value">{formatBalance(finalBalance)}</span>
      <span className={`return-value ${returnClassName}`}>
        {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(1)}%
      </span>
      <p className="initial-note">
        (시작: {formatBalance(initialBalance)})
      </p>
    </div>
  );
}
