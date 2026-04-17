import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import GlobalErrorBoundary from '@/common/GlobalErrorBoundary';
import logger from '@/services/logger';

console.log("VITE_API_URL in index.tsx:", import.meta.env.VITE_API_URL);
console.log("FileApi in index.tsx:", import.meta.env.VITE_DOCU_API_URL);

// ---------------------------------------------------------------------------
// Global unhandled promise rejection → log to Seq
// ---------------------------------------------------------------------------
window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
  logger.error("Unhandled promise rejection: {Reason}", event.reason, {
    Type: "UnhandledRejection",
  });
});

// ---------------------------------------------------------------------------
// Global JS error (e.g. script errors outside React tree) → log to Seq
// ---------------------------------------------------------------------------
window.addEventListener("error", (event: ErrorEvent) => {
  logger.error("Uncaught JS error: {ErrorMessage}", event.error, {
    Type    : "UncaughtError",
    Filename: event.filename,
    Line    : event.lineno,
    Column  : event.colno,
  });
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <QueryClientProvider client={new QueryClient()}>
        <App />
      </QueryClientProvider>
    </GlobalErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
