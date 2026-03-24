import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [
      "./vitest.setup.ts"
    ],
    include: [
      "**/*.{test,spec}.{ts,tsx}"
    ]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@invitehub/shared": path.resolve(__dirname, "packages/shared/src/index.ts")
    }
  }
});
