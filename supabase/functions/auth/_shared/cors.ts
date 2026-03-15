/**
 * CORS 헤더 유틸리티
 */

const ALLOWED_ORIGINS = [
  'https://economic-sense-test.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
];

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function handleCorsPreflightRequest(): Response {
  return new Response('ok', { headers: corsHeaders });
}

export function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin') ?? '';

  if (ALLOWED_ORIGINS.includes(origin)) {
    return {
      ...corsHeaders,
      'Access-Control-Allow-Origin': origin,
    };
  }

  return corsHeaders;
}
