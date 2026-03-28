/**
 * mTLS 토스 파트너 API 클라이언트
 *
 * 환경변수:
 * - TOSS_MTLS_CERT: 클라이언트 인증서 (base64 PEM)
 * - TOSS_MTLS_KEY: 클라이언트 개인키 (base64 PEM)
 * - TOSS_API_BASE_URL: 토스 파트너 API 베이스 URL
 * - TOSS_APP_KEY: 앱 식별 키
 */

import type {
  TossGenerateTokenResponse,
  AccessTokenPayload,
} from './types.ts';
import { ErrorCode } from './types.ts';

function getRequiredEnv(key: string): string {
  const value = Deno.env.get(key);
  if (!value) {
    throw new Error(`${ErrorCode.SERVER_CONFIG_ERROR}: Missing environment variable: ${key}`);
  }
  return value;
}

function decodePem(encoded: string): string {
  const binaryString = atob(encoded);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

async function tossApiFetch(
  endpoint: string,
  body: Record<string, unknown>,
): Promise<Response> {
  const certEncoded = getRequiredEnv('TOSS_MTLS_CERT');
  const keyEncoded = getRequiredEnv('TOSS_MTLS_KEY');
  const baseUrl = Deno.env.get('TOSS_API_BASE_URL') ?? 'https://apps-in-toss-api.toss.im';
  const appKey = getRequiredEnv('TOSS_APP_KEY');

  const certPem = decodePem(certEncoded);
  const keyPem = decodePem(keyEncoded);

  const client = Deno.createHttpClient({
    cert: certPem,
    key: keyPem,
  });

  try {
    return await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Key': appKey,
      },
      body: JSON.stringify(body),
      // @ts-ignore Deno-specific fetch option
      client,
    });
  } finally {
    client.close();
  }
}

function decodeJwtPayload(token: string): AccessTokenPayload {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error(`${ErrorCode.TOKEN_DECODE_FAILED}: Invalid JWT format`);
  }

  const payload = parts[1]
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const padded = payload + '='.repeat((4 - payload.length % 4) % 4);
  const decoded = atob(padded);
  return JSON.parse(decoded) as AccessTokenPayload;
}

export function extractUserKeyFromToken(accessToken: string): string {
  const payload = decodeJwtPayload(accessToken);
  const userKey = payload.userKey ?? payload.sub;

  if (!userKey || typeof userKey !== 'string') {
    throw new Error(
      `${ErrorCode.TOKEN_DECODE_FAILED}: userKey not found in token payload`
    );
  }

  return userKey;
}

export interface GenerateTokenResult {
  accessToken: string;
  refreshToken: string;
  userKey: string;
  expiresIn: number;
}

/**
 * refreshToken을 사용하여 새 토큰을 발급받는다.
 *
 * POST /api-partner/v1/apps-in-toss/user/oauth2/refresh-token
 */
export async function refreshToken(
  token: string,
): Promise<GenerateTokenResult> {
  const endpoint = '/api-partner/v1/apps-in-toss/user/oauth2/refresh-token';

  let response: Response;
  try {
    response = await tossApiFetch(endpoint, { refreshToken: token });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.startsWith(ErrorCode.SERVER_CONFIG_ERROR)) {
      throw err;
    }
    throw new Error(`${ErrorCode.NETWORK_ERROR}: ${message}`);
  }

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[auth] Toss refresh API error (HTTP ${response.status}):`, errorBody);
    throw new Error(`${ErrorCode.TOSS_SERVER_ERROR}: HTTP ${response.status} - ${errorBody}`);
  }

  const data = (await response.json()) as TossGenerateTokenResponse;
  const userKey = extractUserKeyFromToken(data.accessToken);

  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    userKey,
    expiresIn: data.expiresIn,
  };
}

export async function disconnect(accessToken: string): Promise<{ success: boolean }> {
  const endpoint = '/api-partner/v1/apps-in-toss/user/oauth2/access/remove-by-access-token';
  const baseUrl = Deno.env.get('TOSS_API_BASE_URL') ?? 'https://apps-in-toss-api.toss.im';

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    return { success: response.ok };
  } catch {
    return { success: false };
  }
}

export async function generateToken(
  authorizationCode: string,
  referrer?: string,
): Promise<GenerateTokenResult> {
  const endpoint = '/api-partner/v1/apps-in-toss/user/oauth2/generate-token';

  const body: Record<string, unknown> = { authorizationCode };
  if (referrer) body.referrer = referrer;

  let response: Response;
  try {
    response = await tossApiFetch(endpoint, body);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.startsWith(ErrorCode.SERVER_CONFIG_ERROR)) {
      throw err;
    }
    throw new Error(`${ErrorCode.NETWORK_ERROR}: ${message}`);
  }

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[auth] Toss API error (HTTP ${response.status}):`, errorBody);

    try {
      const errorJson = JSON.parse(errorBody) as Record<string, unknown>;

      let errorCode: string | undefined;
      let errorMessage: string | undefined;

      if (typeof errorJson.errorCode === 'string') {
        errorCode = errorJson.errorCode;
        errorMessage = errorJson.message as string;
      } else if (
        errorJson.resultType === 'FAIL' &&
        errorJson.error &&
        typeof errorJson.error === 'object'
      ) {
        const err = errorJson.error as Record<string, unknown>;
        errorCode = err.errorCode as string;
        errorMessage = err.reason as string;
      }

      if (errorCode === 'INVALID_AUTHORIZATION_CODE') {
        throw new Error(
          `${ErrorCode.INVALID_AUTH_CODE}: ${errorMessage ?? 'Invalid authorization code'}`
        );
      }
      if (errorCode === 'EXPIRED_AUTHORIZATION_CODE') {
        throw new Error(
          `${ErrorCode.EXPIRED_AUTH_CODE}: ${errorMessage ?? 'Expired authorization code'}`
        );
      }

      if (response.status === 401) {
        throw new Error(
          `${ErrorCode.SERVER_AUTH_FAILED}: ${errorMessage ?? errorBody}`
        );
      }

      throw new Error(
        `${ErrorCode.TOSS_SERVER_ERROR}: [${errorCode ?? 'UNKNOWN'}] ${errorMessage ?? errorBody}`
      );
    } catch (parseErr) {
      if (parseErr instanceof Error) {
        const knownPrefixes = [
          ErrorCode.INVALID_AUTH_CODE,
          ErrorCode.EXPIRED_AUTH_CODE,
          ErrorCode.SERVER_AUTH_FAILED,
          ErrorCode.TOSS_SERVER_ERROR,
        ];
        if (knownPrefixes.some((p) => parseErr.message.startsWith(p))) {
          throw parseErr;
        }
      }

      throw new Error(
        `${ErrorCode.TOSS_SERVER_ERROR}: HTTP ${response.status} - ${errorBody}`
      );
    }
  }

  const data = (await response.json()) as TossGenerateTokenResponse;
  const userKey = extractUserKeyFromToken(data.accessToken);

  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    userKey,
    expiresIn: data.expiresIn,
  };
}
