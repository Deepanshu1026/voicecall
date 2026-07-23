import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: process.env.VITE_HOST || '0.0.0.0',
    port: 5173,
    proxy: process.env.NODE_ENV !== 'production' ? {
      '/api': { target: 'http://localhost:5002', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:5002', ws: true },
      '/uploads': { target: 'http://localhost:5002', changeOrigin: true },
    } : undefined,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
