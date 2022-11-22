import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import reactRefresh from "@vitejs/plugin-react-refresh"
import { r } from "./scripts/utils"

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "~/": `${r("src")}/`,
    },
  },
  plugins: [
    reactRefresh(),
    react({
      babel: {
        plugins: ["@emotion/babel-plugin", "effector/babel-plugin"],
      },
    }),
  ],
  server: {
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
})
