import path from 'path';
import checker from 'vite-plugin-checker';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

const PORT = 3039;

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/assets/company/crm/' : '/',
  plugins: [
    react(),
    checker({
      typescript: true,
      eslint: {
        useFlatConfig: true,
        lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
        dev: { logLevel: ['error'] },
      },
      overlay: {
        position: 'tl',
        initialIsOpen: false,
      },
    }),
  ],

  resolve: {
    alias: [
      {
        find: /^src(.+)/,
        replacement: path.resolve(process.cwd(), 'src/$1'),
      },
    ],
  },

  server: {
    port: PORT,
    host: true,
    hmr: {
      host: 'erp.localhost.innoblitz',
    },
    proxy: {
      // 🔹 Frappe APIs 
      '/api': {
        target: 'http://localhost:8025',
        router: (req) => {
          const host = req.headers.host?.split(':')[0] || 'localhost';
          return `http://${host}:8025`;
        },
        changeOrigin: true,
        secure: false,
      },
      // 🔹 File assets
      '/files': {
        target: 'http://localhost:8025',
        router: (req) => {
          const host = req.headers.host?.split(':')[0] || 'localhost';
          return `http://${host}:8025`;
        },
        changeOrigin: true,
        secure: false,
      },
      '/private': {
        target: 'http://localhost:8025',
        router: (req) => {
          const host = req.headers.host?.split(':')[0] || 'localhost';
          return `http://${host}:8025`;
        },
        changeOrigin: true,
        secure: false,
      }
    },
  },

  preview: {
    port: PORT,
    host: true,
  },
}));

