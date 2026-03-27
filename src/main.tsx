import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { ConvexProvider } from 'convex/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AdminAuthProvider } from '@/components/admin-auth-provider';
import { convex } from '@/lib/convex';
import App from './app.tsx';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <AdminAuthProvider>
        <App />
        <Analytics />
        <SpeedInsights />
      </AdminAuthProvider>
    </ConvexProvider>
  </StrictMode>
);
