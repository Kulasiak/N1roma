// Single-file build for hosting as one page (no service worker, everything inlined).
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [react(), viteSingleFile({ removeViteModuleLoader: true })],
  build: { outDir: 'dist-artifact', assetsInlineLimit: 100000000, cssCodeSplit: false, rollupOptions: { input: 'artifact.html' } },
});
