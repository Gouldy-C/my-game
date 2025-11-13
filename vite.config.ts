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
  base: "./",
  resolve: {
    alias: {
      "@ui": path.resolve(__dirname, "./src/ui"),
      "@electron": path.resolve(__dirname, "./electron"),
      "@": path.resolve(__dirname, "./"),
      "@game": path.resolve(__dirname, "./src/game"),
    },
  },
  build: {
    outDir: "dist-ui",
    sourcemap: true, // Enable source maps for better debugging
    minify: "esbuild", // Fast minification
    target: "esnext", // Modern target for better tree-shaking
  },
  server: {
    port: 6554,
    strictPort: true,
  },
})
