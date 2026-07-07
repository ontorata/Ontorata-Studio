import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getDefaultRataryBaseUrl, getDefaultWorkspaceId } from '../config/env';
import type { ConnectionMode } from '../domain/connection/connection';
import { useAuth } from '../hooks/useAuth';
import { useConnection } from '../hooks/useConnection';
import { Button, Input } from '../presentation/design-system/primitives';

/** Phase 05 — Ratary connection wizard after OIDC (or manual reconnect). */
export function ConnectPage() {
  const { isAuthenticated, authMode } = useAuth();
  const { connectionPort, refresh, selectConnection, hasActiveConnection } = useConnection();
  const navigate = useNavigate();

  const [baseUrl, setBaseUrl] = useState(getDefaultRataryBaseUrl());
  const [apiKey, setApiKey] = useState('');
  const [label, setLabel] = useState('');
  const [mode, setMode] = useState<ConnectionMode>('temporary');
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<string | null>(null);

  useEffect(() => {
    if (hasActiveConnection) {
      navigate(`/workspace/${getDefaultWorkspaceId()}`, { replace: true });
    }
  }, [hasActiveConnection, navigate]);

  if (!isAuthenticated) {
    return <Navigate to={`/workspace/${getDefaultWorkspaceId()}`} replace />;
  }

  async function onValidate() {
    setError(null);
    setValidation(null);
    const trimmedKey = apiKey.trim();
    if (!trimmedKey.startsWith('aic_')) {
      setError('API key must start with aic_.');
      return;
    }
    setValidating(true);
    try {
      const result = await connectionPort.validate({ baseUrl: baseUrl.trim(), apiKey: trimmedKey });
      if (!result.ok) {
        setError(result.errors.map((e) => e.message).join(' '));
        return;
      }
      setValidation(
        `Connected (${result.latencyMs}ms) — ${result.features?.length ?? 0} features enabled.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setValidating(false);
    }
  }

  async function onSave(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const trimmedKey = apiKey.trim();
    if (!trimmedKey.startsWith('aic_')) {
      setError('API key must start with aic_.');
      return;
    }

    setValidating(true);
    try {
      const result = await connectionPort.validate({ baseUrl: baseUrl.trim(), apiKey: trimmedKey });
      if (!result.ok) {
        setError(result.errors.map((e) => e.message).join(' '));
        return;
      }

      const connection = await connectionPort.createFromWizard({
        baseUrl: baseUrl.trim(),
        apiKey: trimmedKey,
        label: label.trim() || undefined,
        mode,
      });
      await refresh();
      selectConnection(connection.id);
      navigate(`/workspace/${connection.workspaceId}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setValidating(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card connect-card auth-card-centered">
        <div className="auth-card-head">
          <h2>Connect memory engine</h2>
          <p>
            {authMode === 'oidc'
              ? 'Optional — link a self-hosted Ratary instance with an API key.'
              : 'Configure your Ratary connection to continue.'}
          </p>
        </div>

        <form className="form login-form" onSubmit={onSave}>
          <Input
            label="Ratary server URL"
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            disabled={validating}
          />
          <Input
            label="API key (AIC)"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="aic_..."
            disabled={validating}
            required
          />
          <Input
            label="Label (optional)"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            disabled={validating}
          />

          <fieldset className="mode-fieldset">
            <legend>Storage mode</legend>
            <label>
              <input
                type="radio"
                name="mode"
                checked={mode === 'temporary'}
                onChange={() => setMode('temporary')}
              />
              Session only (recommended)
            </label>
            <label>
              <input
                type="radio"
                name="mode"
                checked={mode === 'persistent'}
                onChange={() => setMode('persistent')}
              />
              Remember on this device
            </label>
          </fieldset>

          {validation && <p className="ok-text">{validation}</p>}
          {error && <p className="error login-error">{error}</p>}

          <div className="button-row">
            <Button type="button" variant="ghost" onClick={() => navigate(`/workspace/${getDefaultWorkspaceId()}`)}>
              Skip for now
            </Button>
            <Button type="button" variant="ghost" onClick={onValidate} disabled={validating}>
              {validating ? 'Testing…' : 'Test'}
            </Button>
            <Button type="submit" variant="primary" disabled={validating}>
              {validating ? 'Saving…' : 'Connect'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
