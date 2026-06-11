import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves the site at https://<user>.github.io/<repo>/
// so we need the build to know that prefix in production.
const repo = "ornikar-social-lab";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? `/${repo}/` : "/",
  server: { port: 5173, host: true },
}));
