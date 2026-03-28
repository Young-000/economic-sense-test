/**
 * 교환 서비스 - 코인 -> 토스포인트 교환
 *
 * 교환비: 100코인 = 1P
 * SDK grantPromotionReward() 직접 호출 방식.
 */

import { grantPromotionReward } from '@apps-in-toss/web-framework';

export type ExchangeResult =
  | { success: true; message: string }
  | { success: false; error: string };

const ERROR_MESSAGES: Record<string, string> = {
  '4100': '프로모션을 찾을 수 없어요',
  '4109': '프로모션이 종료되었어요',
  '4112': '예산이 소진되었어요',
  '4113': '이미 받은 보상이에요',
};

/**
 * 코인을 토스포인트로 교환 (SDK 직접 호출)
 *
 * @param promotionCode 앱인토스 콘솔에서 생성한 프로모션 코드
 * @param amount 교환할 포인트 수 (이미 코인->P 변환 완료된 값)
 * @param _userKey 미사용 (SDK가 자동 처리)
 */
export async function exchangeForTossPoints(
  promotionCode: string,
  amount: number,
  _userKey?: string,
): Promise<ExchangeResult> {
  try {
    const result = await grantPromotionReward({
      params: { promotionCode, amount },
    });

    // undefined = 앱 버전 미지원
    if (result === undefined) {
      return { success: false, error: '앱 업데이트가 필요합니다 (v5.232.0+)' };
    }

    // 에러 응답
    if (result === 'ERROR') {
      return { success: false, error: '알 수 없는 오류가 발생했습니다' };
    }

    // 에러 코드 응답
    if ('errorCode' in result) {
      const code = result.errorCode;
      const userMessage = ERROR_MESSAGES[code] ?? `프로모션 오류 (${code}): ${result.message}`;
      return { success: false, error: userMessage };
    }

    // 성공 응답 { key: string }
    if ('key' in result) {
      return {
        success: true,
        message: `${amount}P 교환 완료!`,
      };
    }

    return { success: false, error: '예상치 못한 응답입니다' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: `교환 요청 실패: ${message}` };
  }
}
