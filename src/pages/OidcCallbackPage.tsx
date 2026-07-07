import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getDefaultWorkspaceId } from '../config/env';
import { useAuth } from '../hooks/useAuth';

/** Phase 04 — OIDC redirect callback handler. */
export function OidcCallbackPage() {
  const { completeOidcRedirect, authMode } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const workspacePath = `/workspace/${getDefaultWorkspaceId()}`;

  useEffect(() => {
    if (authMode !== 'oidc') {
      navigate(workspacePath, { replace: true });
      return;
    }

    void (async () => {
      try {
        await completeOidcRedirect();
        navigate(`/workspace/${getDefaultWorkspaceId()}`, { replace: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'OIDC callback failed');
      }
    })();
  }, [authMode, completeOidcRedirect, navigate, workspacePath]);

  if (authMode !== 'oidc') {
    return <Navigate to={workspacePath} replace />;
  }

  if (error) {
    return (
      <div className="page center">
        <p className="error">{error}</p>
        <a href={workspacePath}>Back to workspace</a>
      </div>
    );
  }

  return (
    <div className="page center">
      <p>Completing sign-in…</p>
      <small>Redirecting to workspace {getDefaultWorkspaceId()}</small>
    </div>
  );
}
