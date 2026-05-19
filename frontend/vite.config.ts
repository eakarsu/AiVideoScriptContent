import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Allow JSX inside .js files (used by custom-views feature components).
  esbuild: {
    loader: 'tsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  server: {
    port: 3710,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3711',
        changeOrigin: true,
      },
    },
  },
});
