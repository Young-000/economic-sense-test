/**
 * 교환 서비스 - 코인 -> 토스포인트 교환
 *
 * 교환비: 100코인 = 1P
 * 프로모션 Edge Function을 통해 mTLS 3단계 플로우 실행
 */

import { isAppsInTossEnvironment } from '@infrastructure/userIdentity';

const EXCHANGE_CLAIMED_KEY = 'economic-sense-exchange-claimed';
const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/promotion`;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export type ExchangeResult =
  | { success: true; message: string }
  | { success: false; error: string };

interface PromotionSuccessResponse {
  success: true;
  key: string;
}

interface PromotionErrorResponse {
  success: false;
  error: string;
  message: string;
}

type EdgeFunctionResponse = PromotionSuccessResponse | PromotionErrorResponse;

const ERROR_MESSAGES: Record<string, string> = {
  '4100': '프로모션을 찾을 수 없어요',
  '4109': '프로모션이 종료되었어요',
  '4112': '예산이 소진되었어요',
  '4113': '이미 받은 보상이에요',
  'ALREADY_CLAIMED': '이미 교환한 내역이에요',
};

function isAlreadyClaimed(promotionCode: string): boolean {
  try {
    const claimed = JSON.parse(localStorage.getItem(EXCHANGE_CLAIMED_KEY) ?? '[]') as string[];
    return claimed.includes(promotionCode);
  } catch {
    return false;
  }
}

function markClaimed(promotionCode: string): void {
  try {
    const claimed = JSON.parse(localStorage.getItem(EXCHANGE_CLAIMED_KEY) ?? '[]') as string[];
    if (!claimed.includes(promotionCode)) {
      claimed.push(promotionCode);
      localStorage.setItem(EXCHANGE_CLAIMED_KEY, JSON.stringify(claimed));
    }
  } catch { /* ignore */ }
}

async function callPromotionEdgeFunction(
  promotionCode: string,
  amount: number,
  userKey: string,
): Promise<EdgeFunctionResponse> {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ promotionCode, amount, userKey }),
  });

  return (await response.json()) as EdgeFunctionResponse;
}

/**
 * 코인을 토스포인트로 교환
 *
 * @param promotionCode 앱인토스 콘솔에서 생성한 프로모션 코드
 * @param amount 교환할 포인트 수 (이미 코인->P 변환 완료된 값)
 * @param userKey 토스 유저 식별키
 */
export async function exchangeForTossPoints(
  promotionCode: string,
  amount: number,
  userKey?: string,
): Promise<ExchangeResult> {
  if (!isAppsInTossEnvironment()) {
    return { success: false, error: '웹 환경에서는 포인트 교환이 지원되지 않습니다' };
  }

  if (isAlreadyClaimed(promotionCode)) {
    return { success: false, error: '이미 교환된 프로모션입니다' };
  }

  if (!userKey) {
    return { success: false, error: '로그인이 필요합니다' };
  }

  if (userKey.startsWith('local-') || userKey.startsWith('temp-')) {
    return {
      success: false,
      error: '토스 로그인이 필요합니다',
    };
  }

  try {
    const result = await callPromotionEdgeFunction(promotionCode, amount, userKey);

    if (result.success) {
      markClaimed(promotionCode);
      return {
        success: true,
        message: `${amount}P 교환 완료!`,
      };
    }

    if (result.error === 'ALREADY_CLAIMED') {
      markClaimed(promotionCode);
    }

    const userMessage = ERROR_MESSAGES[result.error] ?? `[${result.error}] ${result.message}`;
    return { success: false, error: userMessage };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: `교환 요청 실패: ${message}` };
  }
}
