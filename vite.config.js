import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: process.env.GITHUB_ACTIONS ? '/class-schedule/' : '/',
    plugins: [react()],
    define: {
      'process.env.GOOGLE_SHEET_URL': JSON.stringify(env.GOOGLE_SHEET_URL || env.VITE_GOOGLE_SHEET_URL || ''),
      'process.env.ACCOUNT': JSON.stringify(env.ACCOUNT || env.VITE_ACCOUNT || 'teacher'),
      'process.env.PASSWORD': JSON.stringify(env.PASSWORD || env.VITE_PASSWORD || '66589422'),
    },
    server: {
      port: 5173,
      host: true
    }
  }
})
