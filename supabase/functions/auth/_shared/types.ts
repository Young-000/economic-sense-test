/**
 * Supabase Edge Function auth - 공유 타입 정의
 */

export interface AuthRequest {
  authorizationCode: string;
}

export interface AuthSuccessResponse {
  userKey: string;
  expiresAt: string;
}

export interface AuthErrorResponse {
  error: string;
  message: string;
}

export interface TossGenerateTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface TossApiErrorResponse {
  errorCode: string;
  message: string;
}

export interface AccessTokenPayload {
  sub?: string;
  userKey?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

export const ErrorCode = {
  INVALID_REQUEST: 'INVALID_REQUEST',
  INVALID_AUTH_CODE: 'INVALID_AUTH_CODE',
  EXPIRED_AUTH_CODE: 'EXPIRED_AUTH_CODE',
  SERVER_AUTH_FAILED: 'SERVER_AUTH_FAILED',
  TOSS_SERVER_ERROR: 'TOSS_SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TOKEN_DECODE_FAILED: 'TOKEN_DECODE_FAILED',
  SERVER_CONFIG_ERROR: 'SERVER_CONFIG_ERROR',
  DB_ERROR: 'DB_ERROR',
} as const;

export type ErrorCodeType = typeof ErrorCode[keyof typeof ErrorCode];
