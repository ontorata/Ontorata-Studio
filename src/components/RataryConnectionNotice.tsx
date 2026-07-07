import { getDefaultRataryBaseUrl, isOidcEnabled } from '../config/env';
import { useAuth } from '../hooks/useAuth';
import { Card, PageHeader } from '../presentation/design-system/primitives';

interface RataryConnectionNoticeProps {
  title?: string;
  message?: string;
}

/** Inline tab notice when Ratary client is unavailable (no full-app crash). */
export function RataryConnectionNotice({ title, message }: RataryConnectionNoticeProps) {
  const { authMode } = useAuth();
  const rataryUrl = getDefaultRataryBaseUrl();
  const oidc = isOidcEnabled();

  const body =
    message ??
    (authMode === 'oidc' || oidc
      ? 'Sign in with SSO to connect Studio to Ratary. If you are already signed in, your session may have expired — sign out and sign in again.'
      : 'Connect Studio to Ratary with a valid API key (aic_…) via the login panel.');

  return (
    <div className="page studio-page">
      <PageHeader
        title={title ?? 'Ratary connection required'}
        description="This view needs an active connection to your Ratary brain."
      />
      <Card className="ratary-connection-notice">
        <p className="error">{body}</p>
        <p className="muted">
          Server: <code>{rataryUrl}</code>
        </p>
      </Card>
    </div>
  );
}
