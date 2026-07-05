import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { StudioClientProvider } from './hooks/useStudioClient';
import { GraphPage } from './pages/GraphPage';
import { HomePage } from './pages/HomePage';
import { MemoriesPage } from './pages/MemoriesPage';
import { MemoryDetailPage } from './pages/MemoryDetailPage';
import { OntoryPage } from './pages/OntoryPage';
import { SearchPage } from './pages/SearchPage';
import { WorkspacesPage } from './pages/WorkspacesPage';

export function App() {
  return (
    <StudioClientProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="memories" element={<MemoriesPage />} />
            <Route path="memories/:id" element={<MemoryDetailPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="graph" element={<GraphPage />} />
            <Route path="workspaces" element={<WorkspacesPage />} />
            <Route path="ontory" element={<OntoryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StudioClientProvider>
  );
}
