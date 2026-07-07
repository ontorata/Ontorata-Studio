import { useAuth } from './useAuth';
import { useOptionalStudioClient } from './useStudioClient';
import type { StudioRataryClient } from '../infrastructure/ratary';

export interface RataryTabClientState {
  client: StudioRataryClient | null;
  authLoading: boolean;
  isAuthenticated: boolean;
  missingConnection: boolean;
}

/** Tab-safe Ratary client — never throws; use with RataryConnectionNotice. */
export function useRataryTabClient(): RataryTabClientState {
  const client = useOptionalStudioClient();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const missingConnection = !authLoading && isAuthenticated && client === null;

  return { client, authLoading, isAuthenticated, missingConnection };
}
