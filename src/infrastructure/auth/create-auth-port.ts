import type { AuthPort } from '../../application/auth/auth-port';
import { isNativeAuthEnabled, isOidcEnabled } from '../../config/env';
import { createLegacyApiKeyAuth } from './legacy-api-key-auth';
import { createOidcAuth } from './oidc-auth-adapter';
import { createRataryNativeAuth } from './ratary-native-auth-adapter';

export function createAuthPort(): AuthPort {
  if (isNativeAuthEnabled()) {
    return createRataryNativeAuth();
  }
  if (isOidcEnabled()) {
    return createOidcAuth();
  }
  return createLegacyApiKeyAuth();
}
