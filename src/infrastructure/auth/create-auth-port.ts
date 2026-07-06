import type { AuthPort } from '../../application/auth/auth-port';
import { isOidcEnabled } from '../../config/env';
import { createLegacyApiKeyAuth } from './legacy-api-key-auth';
import { createOidcAuth } from './oidc-auth-adapter';

export function createAuthPort(): AuthPort {
  if (isOidcEnabled()) {
    return createOidcAuth();
  }
  return createLegacyApiKeyAuth();
}
