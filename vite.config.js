import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // aceita conexões externas (ex.: csb.app)
    port: 5173,
    allowedHosts: [
      /.*\.csb\.app$/, // qualquer subdomínio do CodeSandbox
      /.*\.codesandbox\.io$/, // domínios antigos do CSB
      "localhost",
      "t7dj8r-4173.csb.app", // host exato que aparece no erro
    ],
    hmr: {
      clientPort: 443, // evita bloqueio de HMR por porta
    },
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: [
      /.*\.csb\.app$/,
      /.*\.codesandbox\.io$/,
      "localhost",
      "t7dj8r-4173.csb.app",
    ],
  },
});
