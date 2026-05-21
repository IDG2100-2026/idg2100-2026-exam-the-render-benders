import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  resolve: {
    alias: {
      // Alias so I don't have to write full path for every import
      // instead I can do @ for assets inside the "src" directory (# for assets in styles)
      "@": path.resolve(__dirname, "src"),
      "@styles": path.resolve(__dirname, "src/styles")
    }
  }
});
