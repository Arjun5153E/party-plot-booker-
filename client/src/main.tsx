import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import App from './App';
import './styles/index.css';

const rootElement = document.getElementById('root')!;

rootElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f9fafb;font-family:system-ui,sans-serif;"><div style="text-align:center;"><div style="width:48px;height:48px;border:4px solid #22c55e;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 16px;"></div><p style="color:#6b7280;">Loading PartyPlot Booker...</p><style>@keyframes spin{to{transform:rotate(360deg)}}</style></div></div>';

window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
  rootElement.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f9fafb;font-family:system-ui,sans-serif;padding:24px;"><div style="max-width:400px;text-align:center;"><h1 style="color:#dc2626;font-size:1.5rem;margin-bottom:8px;">JavaScript Error</h1><p style="color:#6b7280;margin-bottom:16px;">${e.error?.message || 'Unknown error'}</p><pre style="background:#fef2f2;color:#dc2626;padding:16px;border-radius:8px;overflow:auto;text-align:left;font-size:0.875rem;">${e.error?.stack || 'No stack trace'}</pre></div></div>`;
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled rejection:', e.reason);
  rootElement.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f9fafb;font-family:system-ui,sans-serif;padding:24px;"><div style="max-width:400px;text-align:center;"><h1 style="color:#dc2626;font-size:1.5rem;margin-bottom:8px;">Unhandled Promise Rejection</h1><p style="color:#6b7280;margin-bottom:16px;">${e.reason?.message || e.reason || 'Unknown error'}</p><pre style="background:#fef2f2;color:#dc2626;padding:16px;border-radius:8px;overflow:auto;text-align:left;font-size:0.875rem;">${e.reason?.stack || 'No stack trace'}</pre></div></div>`;
});

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <MotionConfig transition={{ type: 'spring', damping: 25, stiffness: 200 }}>
          <App />
        </MotionConfig>
      </BrowserRouter>
    </React.StrictMode>
  );
} catch (err) {
  console.error('Render error:', err);
  rootElement.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f9fafb;font-family:system-ui,sans-serif;padding:24px;"><div style="max-width:400px;text-align:center;"><h1 style="color:#dc2626;font-size:1.5rem;margin-bottom:8px;">Render Error</h1><p style="color:#6b7280;margin-bottom:16px;">${err instanceof Error ? err.message : 'Unknown error'}</p><pre style="background:#fef2f2;color:#dc2626;padding:16px;border-radius:8px;overflow:auto;text-align:left;font-size:0.875rem;">${err instanceof Error ? err.stack : 'No stack trace'}</pre></div></div>`;
}
