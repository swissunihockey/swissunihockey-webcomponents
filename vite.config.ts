import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {

  const isWordPress = mode === 'wordpress'

  return {
    plugins: [
      react({
        jsxRuntime: isWordPress ? 'classic' : 'automatic',
      }),
    ],

    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },

    build: {
      target: 'es2020',

      outDir: isWordPress ? 'dist-wordpress' : 'dist',

      cssCodeSplit: false,
      assetsInlineLimit: 1000000,

      rollupOptions: {
        input: 'src/main.tsx',

        external: isWordPress
            ? ['react', 'react-dom', 'react-dom/client']
            : [],

        output: {
          format: isWordPress ? 'iife' : 'es',

          name: 'SwissunihockeyWebComponents',

          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react-dom/client': 'ReactDOM',
          },

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
  }
})