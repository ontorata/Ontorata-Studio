import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './hooks/useAuth';
import { StudioClientProvider } from './hooks/useStudioClient';
import { GraphPage } from './pages/GraphPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { MemoriesPage } from './pages/MemoriesPage';
import { MemoryDetailPage } from './pages/MemoryDetailPage';
import { OntoryPage } from './pages/OntoryPage';
import { SearchPage } from './pages/SearchPage';
import { WorkspacesPage } from './pages/WorkspacesPage';

function AuthenticatedShell() {
  return (
    <StudioClientProvider>
      <Layout />
    </StudioClientProvider>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AuthenticatedShell />}>
              <Route index element={<HomePage />} />
              <Route path="memories" element={<MemoriesPage />} />
              <Route path="memories/:id" element={<MemoryDetailPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="graph" element={<GraphPage />} />
              <Route path="workspaces" element={<WorkspacesPage />} />
              <Route path="ontory" element={<OntoryPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
