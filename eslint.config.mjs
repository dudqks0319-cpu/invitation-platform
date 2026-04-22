import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    ".claude/**",
    "apps/mobile/**",
    "out/**",
    "build/**",
    "dist/**",
    "next-env.d.ts",
    "backend/**",
    "js/**",
    "node_modules/**"
  ]),
]);

export default eslintConfig;
