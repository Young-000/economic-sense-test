/**
 * CoinBalance - 코인 잔액 표시 + 카운트업 애니메이션
 */

import { useEffect, useRef, useState } from 'react';
import { getBalance, EXCHANGE_RATE } from '@domain/services/coinService';

interface CoinBalanceProps {
  className?: string;
  showExchangeInfo?: boolean;
}

export function CoinBalance({ className = '', showExchangeInfo = false }: CoinBalanceProps): JSX.Element {
  const [displayBalance, setDisplayBalance] = useState(getBalance());
  const targetRef = useRef(getBalance());
  const animFrameRef = useRef<number>();

  useEffect(() => {
    const newBalance = getBalance();
    targetRef.current = newBalance;

    if (newBalance === displayBalance) return;

    const startBalance = displayBalance;
    const diff = newBalance - startBalance;
    const startTime = performance.now();
    const duration = 600;

    const animate = (currentTime: number): void => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplayBalance(Math.round(startBalance + diff * eased));

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  });

  const exchangeablePoints = Math.floor(displayBalance / EXCHANGE_RATE);

  return (
    <div className={`coin-balance ${className}`}>
      <div className="coin-balance-main">
        <span className="coin-icon" aria-hidden="true">{'🪙'}</span>
        <span className="coin-amount">{displayBalance.toLocaleString()}</span>
      </div>
      {showExchangeInfo && exchangeablePoints > 0 && (
        <span className="coin-exchange-info">
          = {exchangeablePoints}P
        </span>
      )}
    </div>
  );
}
