import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import fixReactVirtualized from 'esbuild-plugin-react-virtualized'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    VitePWA({
      injectRegister: 'auto',
      manifest: {
        name: "Sigma",
        short_name: "Sigma",
        description: "Welcome to Sigma Open Network",
        display: "standalone",
        start_url: "/?mode=standalone"
      }
    })
  ],
  optimizeDeps: {
    esbuildOptions: {
      plugins: [fixReactVirtualized],
    },
  },
  server: {
    port: 3000,
  },
})
