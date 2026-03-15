/**
 * Supabase Edge Function promotion - 공유 타입 정의
 */

export interface PromotionRequest {
  promotionCode: string;
  amount: number;
  userKey: string;
}

export interface PromotionSuccessResponse {
  success: true;
  key: string;
}

export interface PromotionErrorResponse {
  success: false;
  error: string;
  message: string;
}

export type PromotionResponse = PromotionSuccessResponse | PromotionErrorResponse;

export interface TossGetKeySuccessResponse {
  resultType: 'SUCCESS';
  success: {
    key: string;
  };
}

export interface TossApiFailResponse {
  resultType: 'FAIL';
  error: {
    errorType: number;
    errorCode: string;
    reason: string;
  };
}

export type TossGetKeyResponse = TossGetKeySuccessResponse | TossApiFailResponse;

export interface TossExecuteSuccessResponse {
  resultType: 'SUCCESS';
  success: Record<string, unknown>;
}

export type TossExecuteResponse = TossExecuteSuccessResponse | TossApiFailResponse;

export interface TossExecutionResultSuccessResponse {
  resultType: 'SUCCESS';
  success: 'SUCCESS' | 'PENDING' | 'FAILED';
}

export type TossExecutionResultResponse =
  | TossExecutionResultSuccessResponse
  | TossApiFailResponse;

export const PromotionErrorCode = {
  INVALID_REQUEST: 'INVALID_REQUEST',
  GET_KEY_FAILED: 'GET_KEY_FAILED',
  EXECUTE_FAILED: 'EXECUTE_FAILED',
  EXECUTION_RESULT_FAILED: 'EXECUTION_RESULT_FAILED',
  PROMOTION_PENDING: 'PROMOTION_PENDING',
  PROMOTION_FAILED: 'PROMOTION_FAILED',
  ALREADY_CLAIMED: 'ALREADY_CLAIMED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_CONFIG_ERROR: 'SERVER_CONFIG_ERROR',
  DB_ERROR: 'DB_ERROR',
  POLLING_TIMEOUT: 'POLLING_TIMEOUT',
} as const;

export type PromotionErrorCodeType =
  typeof PromotionErrorCode[keyof typeof PromotionErrorCode];
