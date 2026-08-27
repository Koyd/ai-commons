import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite-plus";
import { courseFiles } from "./build/course-files.ts";

export default defineConfig({
  fmt: { ignorePatterns: ["course-format/generated/**"] },
  lint: {
    ignorePatterns: ["course-format/generated/**"],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  plugins: [courseFiles(), preact(), tailwindcss()],
});
