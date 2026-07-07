import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getDefaultWorkspaceId } from '../config/env';
import { useAuth } from '../hooks/useAuth';

/** Legacy guard — unauthenticated users land in workspace (in-app login). */
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page center">
        <p>Loading session…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    const ws = getDefaultWorkspaceId();
    const suffix = location.pathname === '/connect' ? '' : '';
    return <Navigate to={`/workspace/${ws}${suffix}`} replace />;
  }

  return <Outlet />;
}
