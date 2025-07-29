import { defineConfig, loadEnv } from 'vite'

import path from 'path';
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => {
  // Load env file from root directory (parent folder)
  const env = loadEnv(mode, path.resolve(process.cwd(), '../'), '')

  return {
    plugins: [
      // this is the plugin that enables path aliases
          tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
      viteTsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      tailwindcss(),
      tanstackStart({ target: 'node-server' })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
    },
    server: {
      port: parseInt(env.VITE_DEV_PORT || '5173'),
      host: env.VITE_DEV_HOST || 'localhost',
    },
    // Make sure Vite loads the env from root directory
    envDir: '../',
    // Define which env variables to expose to the client
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
    },
    build: {
      rollupOptions: {
        external: [],
        output: {
          manualChunks: undefined,
        }
      }
    }
  }
})
