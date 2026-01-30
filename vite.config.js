import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/habit-tracker/", // <--- CRITICAL: Must match your repo name
  build: {
    chunkSizeWarningLimit: 1600, // (Optional) Stops the yellow warning
  },
})