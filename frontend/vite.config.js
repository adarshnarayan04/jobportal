import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      // '/api': 'https://jobportal-25u3.onrender.com', 
      '/api': 'htthttp://localhost:8000'
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
