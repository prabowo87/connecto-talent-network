import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import globals from "globals";

export default defineConfig([
  {
    files: ["server/src/**/*.js", "server/data/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: globals.node,
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-console": "off",
    },
  },
  {
    files: ["client/src/**/*.{js,jsx}"],
    ignores: ["client/dist/**"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.es2021 },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { react: reactPlugin },
    settings: { react: { version: "detect" } },
    rules: {
      ...js.configs.recommended.rules,
      "react/jsx-uses-vars": "error",
      "react/jsx-uses-react": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
]);