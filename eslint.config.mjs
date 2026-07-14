import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  { ignores: ["**/dist/**", "**/node_modules/**", "**/target/**", "**/src-tauri/binaries/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["app/web/**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    languageOptions: { globals: globals.browser },
    rules: reactHooks.configs.recommended.rules,
  },
  {
    files: ["app/api/**/*.ts"],
    languageOptions: { globals: globals.node },
  },
);
