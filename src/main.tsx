import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './presentation/design-system/tokens.css';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
