import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { App } from './App';
import { getDefaultWorkspaceId } from './config/env';
import './presentation/design-system/tokens.css';
import './styles/index.css';
import './styles/workspace.css';

const rootPath = window.location.pathname;
if (rootPath === '/' || rootPath === '') {
  const ws = getDefaultWorkspaceId();
  window.history.replaceState(null, '', `/workspace/${ws}`);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);
