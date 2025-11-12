import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@ui": path.resolve(__dirname, "./src/ui"),
      "@electron": path.resolve(__dirname, "./src/electron"),
      "@": path.resolve(__dirname, "./src"),
      "@game": path.resolve(__dirname, "./src/game"),
    },
  },
  build: {
    outDir: "dist-ui",
  },
})
