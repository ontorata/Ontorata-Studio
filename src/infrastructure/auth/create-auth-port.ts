import type { AuthPort } from '../../application/auth/auth-port';
import { isNativeAuthEnabled, isOidcEnabled } from '../../config/env';
import { createLegacyApiKeyAuth } from './legacy-api-key-auth';
import { createOidcAuth } from './oidc-auth-adapter';
import { createRataryNativeAuth } from './ratary-native-auth-adapter';

export function createAuthPort(): AuthPort {
  if (isOidcEnabled()) {
    return createOidcAuth();
  }
  if (isNativeAuthEnabled()) {
    return createRataryNativeAuth();
  }
  return createLegacyApiKeyAuth();
}
