import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    assetsInlineLimit: 1000000,
    rollupOptions: {
      input: 'src/main.tsx',
      output: {
        entryFileNames: 'swissunihockey-webcomponents.js',
        assetFileNames: (assetInfo: any) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'swissunihockey-webcomponents.css'
          }

          return '[name][extname]'
        },
      },
    },
  },
})