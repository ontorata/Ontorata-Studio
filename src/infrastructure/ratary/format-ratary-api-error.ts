import { isOidcEnabled } from '../../config/env';

/** User-facing message for Ratary API failures inside workspace tabs. */
export function formatRataryApiError(err: unknown): string {
  const message = err instanceof Error ? err.message : 'Request failed';
  const lower = message.toLowerCase();

  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('network request failed') ||
    lower.includes('load failed')
  ) {
    return 'Cannot reach Ratary — check your network or server URL.';
  }

  if (
    message.includes('401') ||
    lower.includes('unauthorized') ||
    lower.includes('invalid or missing credentials') ||
    lower.includes('invalid api key')
  ) {
    return isOidcEnabled()
      ? 'Invalid or missing credentials — sign out and sign in again with SSO.'
      : 'Invalid or missing credentials — check your Ratary API key.';
  }

  if (lower.includes('x-organization-id') || lower.includes('tenant context')) {
    return 'Workspace scope not ready — sign out, sign in again, then retry.';
  }

  return message;
}
