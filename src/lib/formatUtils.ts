/**
 * 공통 포맷팅 유틸리티
 */

/**
 * 잔액을 한국어 형식으로 포맷팅
 * @param balance 금액 (원)
 * @returns 포맷팅된 문자열 (예: "1,000만원")
 */
export const formatBalance = (balance: number): string => {
  const absBalance = Math.abs(balance);
  if (absBalance >= 100_000_000) {
    return `${(balance / 100_000_000).toFixed(1)}억원`;
  }
  return `${(balance / 10_000).toLocaleString()}만원`;
};

/**
 * 금액을 간략하게 포맷팅
 * @param v 금액 (원)
 * @returns 포맷팅된 문자열 (예: "+30만", "-5만")
 */
export const formatMoney = (v: number): string => {
  const absV = Math.abs(v);
  const sign = v >= 0 ? '+' : '-';

  // 천만원 이상
  if (absV >= 10_000_000) return `${sign}${Math.round(absV / 10_000_000)}천만`;

  // 만원 이상
  if (absV >= 10_000) return `${sign}${Math.round(absV / 10_000)}만`;

  // 천원 단위 (500원 이상)
  const inThousand = Math.round(absV / 1000);
  if (inThousand > 0) return `${sign}${inThousand}천`;

  // 0원 또는 매우 작은 금액
  return '0원';
};

/**
 * 수익률에 따른 CSS 클래스 반환
 */
export const getReturnClass = (totalReturn: number): string => {
  if (totalReturn >= 30) return 'profit-high';
  if (totalReturn >= 10) return 'profit-medium';
  if (totalReturn > 0) return 'profit-low';
  if (totalReturn > -10) return 'loss-low';
  if (totalReturn > -20) return 'loss-medium';
  return 'loss-high';
};

/**
 * 운 점수에 따른 라벨 반환
 */
export const getLuckLabel = (luckScore: number): string => {
  if (luckScore > 50) return '대박 행운';
  if (luckScore > 20) return '행운';
  if (luckScore > -20) return '보통';
  if (luckScore > -50) return '불운';
  return '극심한 불운';
};
