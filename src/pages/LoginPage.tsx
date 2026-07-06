import { FormEvent, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getDefaultWorkspaceId } from '../config/env';
import { defaultRataryBaseUrl } from '../infrastructure/storage/legacy-auth-session';
import { Button, Input } from '../presentation/design-system/primitives';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { isAuthenticated, login, authMode, loading } = useAuth();
  const location = useLocation();
  const redirectTo =
    (location.state as { from?: string } | null)?.from?.startsWith('/') &&
    !(location.state as { from?: string }).from?.startsWith('/login')
      ? (location.state as { from: string }).from
      : `/workspace/${getDefaultWorkspaceId()}`;

  const [baseUrl, setBaseUrl] = useState(defaultRataryBaseUrl());
  const [apiKey, setApiKey] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="auth-screen">
        <p className="auth-loading">Preparing your workspace…</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  async function onOidcSignIn() {
    setError(null);
    setSubmitting(true);
    try {
      await login();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
      setSubmitting(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      setError('API key is required.');
      return;
    }
    if (!trimmedKey.startsWith('aic_')) {
      setError('API key must start with aic_ (from Ratary bootstrap).');
      return;
    }

    setSubmitting(true);
    try {
      await login({
        apiKey: trimmedKey,
        baseUrl: baseUrl.trim() || defaultRataryBaseUrl(),
        workspaceId: workspaceId.trim() || undefined,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message.includes('401') ? 'Invalid API key — check your Ratary credentials.' : message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-layout">
        <section className="auth-intro">
          <span className="brand-mark lg">O</span>
          <h1>Enterprise intelligence, one calm workspace.</h1>
          <p>
            Ontorata Studio connects your team to organizational memory, agents, and governance —
            without leaving a single trusted console.
          </p>
          <ul className="auth-benefits">
            <li>Secure sign-in with your organization identity</li>
            <li>Memory and knowledge in one place</li>
            <li>Built for long, focused work sessions</li>
          </ul>
        </section>

        <section className="auth-card">
          <div className="auth-card-head">
            <h2>Sign in to Studio</h2>
            <p>
              {authMode === 'oidc'
                ? 'Use your organization account to continue.'
                : 'Use your Ratary API key for self-hosted environments.'}
            </p>
          </div>

          {authMode === 'oidc' ? (
            <div className="form login-form">
              {error && <p className="error login-error">{error}</p>}
              <Button
                type="button"
                variant="primary"
                className="login-submit"
                disabled={submitting}
                onClick={onOidcSignIn}
              >
                {submitting ? 'Redirecting…' : 'Continue with SSO'}
              </Button>
            </div>
          ) : (
            <form className="form login-form" onSubmit={onSubmit}>
              <Input
                label="API key"
                type="password"
                name="apiKey"
                autoComplete="current-password"
                placeholder="aic_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={submitting}
                required
              />

              {showAdvanced && (
                <>
                  <Input
                    label="Ratary server URL"
                    type="url"
                    name="baseUrl"
                    placeholder={defaultRataryBaseUrl()}
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    disabled={submitting}
                  />
                  <Input
                    label={
                      <>
                        Workspace ID <span className="optional">(optional)</span>
                      </>
                    }
                    type="text"
                    name="workspaceId"
                    placeholder="UUID"
                    value={workspaceId}
                    onChange={(e) => setWorkspaceId(e.target.value)}
                    disabled={submitting}
                  />
                </>
              )}

              <Button
                type="button"
                variant="ghost"
                className="linkish toggle-advanced"
                onClick={() => setShowAdvanced((v) => !v)}
              >
                {showAdvanced ? 'Hide advanced options' : 'Advanced options'}
              </Button>

              {error && <p className="error login-error">{error}</p>}

              <Button type="submit" variant="primary" className="login-submit" disabled={submitting}>
                {submitting ? 'Verifying…' : 'Sign in'}
              </Button>
            </form>
          )}

          <p className="login-foot">
            Session credentials stay in this browser only. Managed by Ontorata — powered by Ratary memory.
          </p>
        </section>
      </div>
    </div>
  );
}
