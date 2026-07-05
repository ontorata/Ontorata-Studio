import { FormEvent, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { defaultRataryBaseUrl } from '../auth/auth-session';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();
  const redirectTo =
    (location.state as { from?: string } | null)?.from?.startsWith('/') &&
    !(location.state as { from?: string }).from?.startsWith('/login')
      ? (location.state as { from: string }).from
      : '/';

  const [baseUrl, setBaseUrl] = useState(defaultRataryBaseUrl());
  const [apiKey, setApiKey] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
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
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <span className="brand-mark lg">O</span>
          <div>
            <h1>Ontorata Studio</h1>
            <p>Sign in with your Ratary API key to access the operator console.</p>
          </div>
        </div>

        <form className="form login-form" onSubmit={onSubmit}>
          <label>
            API key
            <input
              type="password"
              name="apiKey"
              autoComplete="current-password"
              placeholder="aic_..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={submitting}
              required
            />
          </label>

          {showAdvanced && (
            <>
              <label>
                Ratary server URL
                <input
                  type="url"
                  name="baseUrl"
                  placeholder={defaultRataryBaseUrl()}
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  disabled={submitting}
                />
              </label>
              <label>
                Workspace ID <span className="optional">(optional)</span>
                <input
                  type="text"
                  name="workspaceId"
                  placeholder="UUID"
                  value={workspaceId}
                  onChange={(e) => setWorkspaceId(e.target.value)}
                  disabled={submitting}
                />
              </label>
            </>
          )}

          <button
            type="button"
            className="linkish toggle-advanced"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            {showAdvanced ? 'Hide advanced options' : 'Advanced options'}
          </button>

          {error && <p className="error login-error">{error}</p>}

          <button type="submit" className="btn primary login-submit" disabled={submitting}>
            {submitting ? 'Verifying…' : 'Sign in'}
          </button>
        </form>

        <p className="login-foot">
          Keys are stored in this browser session only — not embedded in the build. Get a key from{' '}
          <a href="https://github.com/ontorata/ratary" target="_blank" rel="noreferrer">
            Ratary bootstrap
          </a>
          .
        </p>
      </div>
    </div>
  );
}
