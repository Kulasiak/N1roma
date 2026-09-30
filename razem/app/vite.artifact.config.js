// Single-file build for hosting as one page (no service worker, everything inlined).
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [react(), viteSingleFile({ removeViteModuleLoader: true })],
  build: { outDir: process.env.RZ_ENTRY === 'agency' ? 'dist-artifact-agency' : 'dist-artifact', emptyOutDir: true, assetsInlineLimit: 100000000, cssCodeSplit: false, rollupOptions: { input: process.env.RZ_ENTRY === 'agency' ? 'artifact-agency.html' : 'artifact.html' } },
});
