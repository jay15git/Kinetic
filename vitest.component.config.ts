import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.tsx"],
    include: ["**/*.{test,spec}.tsx"],
    exclude: ["**/node_modules/**", "**/.reference/**", "**/.next/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
})
