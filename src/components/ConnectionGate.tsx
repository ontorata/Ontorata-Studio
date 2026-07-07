import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getDefaultWorkspaceId } from '../config/env';
import { useAuth } from '../hooks/useAuth';
import { useConnection } from '../hooks/useConnection';

/** Phase 05 — gate workspace routes until Ratary connection is active. */
export function ConnectionGate() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { hasActiveConnection } = useConnection();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="page center">
        <p>Loading session…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    const ws = getDefaultWorkspaceId();
    return <Navigate to={`/workspace/${ws}`} replace state={{ from: location.pathname }} />;
  }

  if (!hasActiveConnection) {
    return <Navigate to="/connect" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
