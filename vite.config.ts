import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// Proxy Cloud.ru foundation-models to avoid CORS in dev.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api/gigachat": {
        target: "https://foundation-models.api.cloud.ru",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gigachat/, ""),
      },
    },
  },
});
