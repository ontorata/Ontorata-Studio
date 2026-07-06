import { Navigate, Outlet, useLocation } from 'react-router-dom';
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
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!hasActiveConnection) {
    return <Navigate to="/connect" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
