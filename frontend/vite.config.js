import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || '')
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://resume-backend-4x9z.onrender.com',
        changeOrigin: true
      }
    }
  }
})