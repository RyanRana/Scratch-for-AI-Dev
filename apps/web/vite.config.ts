import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const extensionBuild = process.env.VITE_EXTENSION_BUILD === "1";

export default defineConfig({
  base: extensionBuild ? "./" : "/",
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    outDir: process.env.VITE_EXTENSION_OUT ?? "dist",
    emptyOutDir: true,
  },
});
