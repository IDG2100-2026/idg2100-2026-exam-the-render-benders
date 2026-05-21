import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }
    },
    rules: {
      "comma-dangle": "warn",
      "no-unused-vars": "warn",
      "semi": ["error", "always"],
      "prefer-const": "warn"
    }
  }
]);