import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { NativeWorkspaceBootstrap } from './components/NativeWorkspaceBootstrap';
import { getDefaultWorkspaceId } from './config/env';
import { AuthProvider } from './hooks/useAuth';
import { ConnectionProvider } from './hooks/useConnection';
import { StudioClientProvider } from './hooks/useStudioClient';
import { AgentManagerPage } from './pages/AgentManagerPage';
import { CodingWorkspacePage } from './pages/CodingWorkspacePage';
import { ConnectPage } from './pages/ConnectPage';
import { EnterprisePage } from './pages/EnterprisePage';
import { GraphPage } from './pages/GraphPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { MemoriesPage } from './pages/MemoriesPage';
import { MemoryDetailPage } from './pages/MemoryDetailPage';
import { McpManagerPage } from './pages/McpManagerPage';
import { ModelProvidersPage } from './pages/ModelProvidersPage';
import { ObservabilityPage } from './pages/ObservabilityPage';
import { OrganizationPage } from './pages/OrganizationPage';
import { OidcCallbackPage } from './pages/OidcCallbackPage';
import { OntoryChatPage } from './pages/OntoryChatPage';
import { OntoryPage } from './pages/OntoryPage';
import { ProfilesPage } from './pages/ProfilesPage';
import { SearchPage } from './pages/SearchPage';
import { SecurityPage } from './pages/SecurityPage';
import { StackBuilderPage } from './pages/StackBuilderPage';
import { StacksPage } from './pages/StacksPage';
import { WorkspacesPage } from './pages/WorkspacesPage';

function LegacyPathRedirect() {
  const location = useLocation();
  const ws = getDefaultWorkspaceId();
  const suffix = location.pathname === '/' ? '' : location.pathname;
  return <Navigate to={`/workspace/${ws}${suffix}`} replace />;
}

function WorkspaceShell() {
  return (
    <StudioClientProvider>
      <NativeWorkspaceBootstrap>
        <Layout />
      </NativeWorkspaceBootstrap>
    </StudioClientProvider>
  );
}

export function App() {
  const defaultWs = getDefaultWorkspaceId();

  return (
    <AuthProvider>
      <ConnectionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Navigate to={`/workspace/${defaultWs}`} replace />} />
            <Route path="/callback" element={<OidcCallbackPage />} />
            <Route path="/connect" element={<ConnectPage />} />
            <Route path="/workspace/:workspaceId" element={<WorkspaceShell />}>
              <Route path="memories" element={<MemoriesPage />} />
              <Route path="memories/:id" element={<MemoryDetailPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="graph" element={<GraphPage />} />
              <Route path="workspaces" element={<WorkspacesPage />} />
              <Route path="ontory" element={<OntoryPage />} />
              <Route path="ontory/chat" element={<OntoryChatPage />} />
              <Route path="profiles" element={<ProfilesPage />} />
              <Route path="stacks" element={<StacksPage />} />
              <Route path="stack-builder" element={<StackBuilderPage />} />
              <Route path="knowledge" element={<KnowledgePage />} />
              <Route path="mcp" element={<McpManagerPage />} />
              <Route path="agents" element={<AgentManagerPage />} />
              <Route path="models" element={<ModelProvidersPage />} />
              <Route path="coding" element={<CodingWorkspacePage />} />
              <Route path="observability" element={<ObservabilityPage />} />
              <Route path="organization" element={<OrganizationPage />} />
              <Route path="enterprise" element={<EnterprisePage />} />
              <Route path="security" element={<SecurityPage />} />
            </Route>
            <Route path="/" element={<Navigate to={`/workspace/${defaultWs}`} replace />} />
            <Route path="/memories/*" element={<LegacyPathRedirect />} />
            <Route path="/search" element={<LegacyPathRedirect />} />
            <Route path="/graph" element={<LegacyPathRedirect />} />
            <Route path="/workspaces" element={<LegacyPathRedirect />} />
            <Route path="/ontory/*" element={<LegacyPathRedirect />} />
            <Route path="*" element={<Navigate to={`/workspace/${defaultWs}`} replace />} />
          </Routes>
        </BrowserRouter>
      </ConnectionProvider>
    </AuthProvider>
  );
}
