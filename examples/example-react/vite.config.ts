import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    checker({ 
      typescript: {
        tsconfigPath: './tsconfig.json',
        buildMode: false,
      },
      overlay: {
        initialIsOpen: false,
      },
    }),
    tsconfigPaths(),
  ],
  resolve: {
    alias: [
      { find: 'src', replacement: path.resolve(__dirname, './src/') },
    ],
    preserveSymlinks: false,
  },
  build: {
    target: 'es2022',
    minify: true, //HINT: should be true for production, false for debugging
    sourcemap: true,
  },
  server: {
    port: 3000,
    proxy: {
      base: '../../',
      '^.*simba.*': {
        target: process.env.VITE_TARGET ?? 'https://adminsimba-dev.nadindev.ir',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
