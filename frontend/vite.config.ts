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
    host: '127.0.0.1',
    port: Number(process.env.FRONTEND_PORT) || 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${process.env.BACKEND_PORT || 3001}`,
        changeOrigin: true,
      },
    },
  },
});
