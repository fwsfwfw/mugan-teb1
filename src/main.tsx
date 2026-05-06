import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import {ErrorBoundary} from './App.tsx';

// Suppress Vite WebSocket connection errors in the console
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && (args[0].includes('[vite] failed to connect to websocket') || args[0].includes('WebSocket closed without opened'))) {
      return;
    }
    originalConsoleError.apply(console, args);
  };

  console.warn = (...args) => {
    if (args[0] && typeof args[0] === 'string' && (args[0].includes('[vite] failed to connect to websocket') || args[0].includes('WebSocket closed without opened'))) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);