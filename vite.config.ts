import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

const ENV_PREFIX = ['VITE_']

export default defineConfig(() => ({
  envPrefix: ENV_PREFIX,
  server: { port: 4001, host: false },
  assetsInclude: ['**/*.glb'],
  define: {
    'process.env.ANCHOR_BROWSER': true,
  },
  resolve: {
    alias: [
      {
        find: '@coral-xyz/anchor/dist/cjs/nodewallet',
        replacement: path.resolve(__dirname, 'src/shims/anchorNodeWallet.ts'),
      },
      {
        find: 'crypto',
        replacement: 'crypto-browserify',
      },
    ],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  plugins: [react({ jsxRuntime: 'classic' })],
}))
