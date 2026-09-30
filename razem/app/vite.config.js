import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: { rollupOptions: { input: { main: 'index.html', agenzia: 'agenzia.html' } } },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Razem — Rzym po polsku',
        short_name: 'Razem',
        description: 'Transfer, hotel, bilety, mapa i opiekunka mówiąca po polsku — wszystko w jednej aplikacji.',
        lang: 'pl',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F4F1EA',
        theme_color: '#F4F1EA',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/agenzia/],
        globIgnores: ['agenzia.html', 'assets/agenzia-*'],
        runtimeCaching: [
          // Rome map tiles: cached as you browse, so the map keeps working offline.
          { urlPattern: /^https:\/\/tile\.openstreetmap\.org\//, handler: 'CacheFirst',
            options: { cacheName: 'osm-tiles', expiration: { maxEntries: 3000, maxAgeSeconds: 60 * 60 * 24 * 30 }, cacheableResponse: { statuses: [0, 200] } } },
          // City photos (Wikimedia Commons).
          { urlPattern: /^https:\/\/(commons|upload)\.wikimedia\.org\//, handler: 'CacheFirst',
            options: { cacheName: 'photos', expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 60 }, cacheableResponse: { statuses: [0, 200] } } },
        ],
      },
    }),
  ],
});
