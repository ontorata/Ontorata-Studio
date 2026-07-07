import { FormEvent, useState } from 'react';
import { APP_TITLE, ONTORATA_LOGO_URL } from '../../config/brand';
import { getDefaultRataryBaseUrl } from '../../config/env';
import { formatRataryLoginError } from '../../infrastructure/ratary/format-ratary-error';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input } from '../../presentation/design-system/primitives';

interface WorkspaceLoginFormProps {
  variant?: 'welcome' | 'prompt' | 'panel';
  className?: string;
}

/** In-workspace sign-in — API key or OIDC (replaces standalone /login page). */
export function WorkspaceLoginForm({ variant = 'welcome', className = '' }: WorkspaceLoginFormProps) {
  const { login, register, authMode } = useAuth();
  const [baseUrl, setBaseUrl] = useState(getDefaultRataryBaseUrl());
  const [apiKey, setApiKey] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [nativeTab, setNativeTab] = useState<'login' | 'register'>('login');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isPanel = variant === 'panel';

  if (isPanel) {
    return (
      <div className={`ws-ai-input ${className}`.trim()}>
        <div className="ws-ai-login-card" role="status">
          Please Login
        </div>
      </div>
    );
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

  async function onNativeSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (nativeTab === 'register') {
        await register({ email: email.trim(), password, displayName: displayName.trim() || undefined });
      } else {
        await login({ email: email.trim(), password });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
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
        baseUrl: baseUrl.trim() || getDefaultRataryBaseUrl(),
        workspaceId: workspaceId.trim() || undefined,
      });
    } catch (err) {
      const resolvedBase = baseUrl.trim() || getDefaultRataryBaseUrl();
      setError(formatRataryLoginError(err, resolvedBase));
    } finally {
      setSubmitting(false);
    }
  }

  const formClass = 'form login-form ws-login-form';
  const isWelcome = variant === 'welcome';

  if (authMode === 'oidc') {
    return (
      <div className={`ws-login-wrap ${variant} ${className}`.trim()}>
        {variant === 'prompt' && <p className="ws-login-prompt-title">Please Login</p>}
        <section className="auth-card ws-login-card">
          {isWelcome ? (
            <LoginWelcomeHero subtitle="Use your organization account to continue." />
          ) : (
            <div className="auth-card-head">
              <h2>Sign in to Studio</h2>
              <p>Use your organization account to continue.</p>
            </div>
          )}
          <div className={formClass}>
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
        </section>
      </div>
    );
  }

  if (authMode === 'native') {
    return (
      <div className={`ws-login-wrap ${variant} ${className}`.trim()}>
        {variant === 'prompt' && <p className="ws-login-prompt-title">Please Login</p>}
        <section className="auth-card ws-login-card">
          {isWelcome ? (
            <LoginWelcomeHero subtitle="Create an account or sign in with email and password." />
          ) : (
            <div className="auth-card-head">
              <h2>Sign in to Studio</h2>
              <p>Multi-user accounts on your Ratary server.</p>
            </div>
          )}
          <div className="ws-login-tabs">
            <button
              type="button"
              className={nativeTab === 'login' ? 'active' : ''}
              onClick={() => setNativeTab('login')}
            >
              Sign in
            </button>
            <button
              type="button"
              className={nativeTab === 'register' ? 'active' : ''}
              onClick={() => setNativeTab('register')}
            >
              Register
            </button>
          </div>
          <form className={formClass} onSubmit={onNativeSubmit}>
            {nativeTab === 'register' && (
              <Input
                label="Display name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={submitting}
                placeholder="Optional"
              />
            )}
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              required
            />
            <Input
              label="Password"
              type="password"
              autoComplete={nativeTab === 'register' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              required
            />
            {error && <p className="error login-error">{error}</p>}
            <Button type="submit" variant="primary" className="login-submit" disabled={submitting}>
              {submitting
                ? '…'
                : nativeTab === 'register'
                  ? 'Create account'
                  : 'Sign in'}
            </Button>
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className={`ws-login-wrap ${variant} ${className}`.trim()}>
      {variant === 'prompt' && <p className="ws-login-prompt-title">Please Login</p>}
      <section className="auth-card ws-login-card">
        {isWelcome ? (
          <LoginWelcomeHero subtitle="Use your Ratary API key for self-hosted environments." />
        ) : (
          <div className="auth-card-head">
            <h2>Sign in to Studio</h2>
            <p>Use your Ratary API key for self-hosted environments.</p>
          </div>
        )}

        <form className={formClass} onSubmit={onSubmit}>
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
                placeholder={getDefaultRataryBaseUrl()}
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
      </section>
    </div>
  );
}

function LoginWelcomeHero({ subtitle }: { subtitle: string }) {
  return (
    <div className="ws-login-welcome">
      <img src={ONTORATA_LOGO_URL} alt="Ontorata" className="ws-login-welcome-logo" />
      <h2 className="ws-login-welcome-title">{APP_TITLE}</h2>
      <p className="ws-login-welcome-desc">{subtitle}</p>
    </div>
  );
}
