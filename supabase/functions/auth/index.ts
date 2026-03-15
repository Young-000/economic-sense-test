/**
 * Supabase Edge Function: auth
 *
 * POST /functions/v1/auth
 * Body: { authorizationCode: string }
 * Response: { userKey: string, expiresAt: string }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCorsPreflightRequest, getCorsHeaders } from './_shared/cors.ts';
import { generateToken } from './_shared/toss-api-client.ts';
import { ErrorCode } from './_shared/types.ts';
import type { AuthRequest, AuthSuccessResponse, AuthErrorResponse } from './_shared/types.ts';

function validateRequest(body: unknown): AuthRequest {
  if (!body || typeof body !== 'object') {
    throw new Error(`${ErrorCode.INVALID_REQUEST}: Request body is required`);
  }

  const { authorizationCode } = body as Record<string, unknown>;

  if (!authorizationCode || typeof authorizationCode !== 'string') {
    throw new Error(
      `${ErrorCode.INVALID_REQUEST}: authorizationCode is required and must be a string`
    );
  }

  if (authorizationCode.trim().length === 0) {
    throw new Error(
      `${ErrorCode.INVALID_REQUEST}: authorizationCode must not be empty`
    );
  }

  return { authorizationCode: authorizationCode.trim() };
}

async function storeUserSession(
  userKey: string,
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
): Promise<void> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[auth] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    db: { schema: 'economic_sense_test' },
  });

  const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  const { error } = await supabase
    .from('user_sessions')
    .upsert(
      {
        user_key: userKey,
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: tokenExpiresAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_key' }
    );

  if (error) {
    console.error('[auth] Failed to store user session:', error.message);
  }
}

function getHttpStatusForError(errorMessage: string): number {
  if (errorMessage.startsWith(ErrorCode.INVALID_REQUEST)) return 400;
  if (errorMessage.startsWith(ErrorCode.INVALID_AUTH_CODE)) return 400;
  if (errorMessage.startsWith(ErrorCode.EXPIRED_AUTH_CODE)) return 400;
  if (errorMessage.startsWith(ErrorCode.SERVER_AUTH_FAILED)) return 502;
  if (errorMessage.startsWith(ErrorCode.TOSS_SERVER_ERROR)) return 502;
  if (errorMessage.startsWith(ErrorCode.NETWORK_ERROR)) return 502;
  if (errorMessage.startsWith(ErrorCode.TOKEN_DECODE_FAILED)) return 502;
  if (errorMessage.startsWith(ErrorCode.SERVER_CONFIG_ERROR)) return 500;
  if (errorMessage.startsWith(ErrorCode.DB_ERROR)) return 500;
  return 500;
}

function extractErrorCode(errorMessage: string): string {
  const colonIndex = errorMessage.indexOf(':');
  if (colonIndex > 0) {
    return errorMessage.substring(0, colonIndex).trim();
  }
  return 'UNKNOWN_ERROR';
}

function extractErrorMessage(errorMessage: string): string {
  const colonIndex = errorMessage.indexOf(':');
  if (colonIndex > 0) {
    return errorMessage.substring(colonIndex + 1).trim();
  }
  return errorMessage;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  const headers = getCorsHeaders(req);

  if (req.method !== 'POST') {
    const errorResponse: AuthErrorResponse = {
      error: ErrorCode.INVALID_REQUEST,
      message: 'Only POST method is allowed',
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { authorizationCode } = validateRequest(body);
    const result = await generateToken(authorizationCode);

    await storeUserSession(
      result.userKey,
      result.accessToken,
      result.refreshToken,
      result.expiresIn,
    );

    const expiresAt = new Date(Date.now() + result.expiresIn * 1000).toISOString();
    const successResponse: AuthSuccessResponse = {
      userKey: result.userKey,
      expiresAt,
    };

    return new Response(JSON.stringify(successResponse), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const status = getHttpStatusForError(errorMessage);
    const errorCode = extractErrorCode(errorMessage);
    const message = extractErrorMessage(errorMessage);

    const safeMessage = errorCode === ErrorCode.SERVER_CONFIG_ERROR
      ? 'Server configuration error'
      : message;

    console.error(`[auth] Error: ${errorCode} - ${message}`);

    const errorResponse: AuthErrorResponse = {
      error: errorCode,
      message: safeMessage,
    };

    return new Response(JSON.stringify(errorResponse), {
      status,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
});
