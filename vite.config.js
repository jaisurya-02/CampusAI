import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/knowafest/events': {
        target: 'https://r.jina.ai',
        changeOrigin: true,
        secure: true,
        rewrite: () => '/http://www.knowafest.com/explore/events',
      },
      '/api/unstop/events': {
        target: 'https://r.jina.ai',
        changeOrigin: true,
        secure: true,
        rewrite: () => '/http://www.unstop.com/hackathons',
      },
    },
  },
})
