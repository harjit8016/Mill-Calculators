import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const pwaOptions = {
  registerType: 'autoUpdate',
  includeAssets: ['favicon.svg', 'robots.txt'],
  manifest: {
    name: 'Mill Calc',
    short_name: 'Mill Calc',
    description: 'Steel rolling mill calculator — yield, breakeven & power',
    theme_color: '#185FA5',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'portrait',
    start_url: '/',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
  workbox: {
    runtimeCaching: [
      {
        urlPattern: ({ url }) => url.origin === self.location.origin,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-assets',
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      {
        urlPattern: ({ url }) => url.hostname.includes('firestore.googleapis.com'),
        handler: 'NetworkFirst',
        options: {
          cacheName: 'firestore-calls',
          networkTimeoutSeconds: 8,
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
        },
      },
    ],
  },
};

export default defineConfig({
  plugins: [react(), VitePWA(pwaOptions)],
});
