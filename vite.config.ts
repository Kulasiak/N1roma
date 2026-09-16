import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Installabile su iOS, iPadOS, Android e desktop: dal browser si aggiunge
    // alla schermata home e si apre a schermo intero.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'ONDA — Salone & Gestionale',
        short_name: 'ONDA',
        description: 'Prenota online dal salone ONDA e gestisci agenda, clienti, cassa e fedeltà.',
        lang: 'it',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#FDFAF7',
        theme_color: '#3A1A31',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Bacheca', short_name: 'Bacheca', url: '/#/studio/bacheca' },
          { name: 'Agenda', short_name: 'Agenda', url: '/#/studio/agenda' },
          { name: 'Cassa', short_name: 'Cassa', url: '/#/studio/cassa' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,jpg}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        // La foto di sfondo può essere grande: alziamo il limite del precache.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})
