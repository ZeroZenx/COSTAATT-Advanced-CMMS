import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('http://10.2.1.27:4000/api/v1'),
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('http://10.2.1.27:4000'),
  },
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5174,
    strictPort: true,
    allowedHosts: [
      'cmms.costaatt.edu.tt',
      '10.2.1.27',
      'localhost',
      '127.0.0.1'
    ],
    hmr: {
      clientPort: 5174,
      host: 'localhost',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})

