/** User-facing message for Ratary API/network failures during login. */
export function formatRataryLoginError(err: unknown, baseUrl: string): string {
  const message = err instanceof Error ? err.message : 'Login failed';
  const lower = message.toLowerCase();

  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('network request failed') ||
    lower.includes('load failed')
  ) {
    return `Cannot reach Ratary at ${baseUrl}. Start the brain server (npm run dev in ai-brain) or verify the URL in Advanced options.`;
  }

  if (message.includes('401') || lower.includes('unauthorized')) {
    return 'Invalid API key — check your Ratary credentials.';
  }

  return message;
}
