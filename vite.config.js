import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    plugins: [react()],
    server: {
      port: 5173,
      // Dev-only proxy — routes /api/* to local backend so VITE_API_BASE_URL
      // is not needed during local development (kept for convenience).
      // In production (Vercel / Netlify) VITE_API_BASE_URL must be set.
      proxy: isDev
        ? {
            "/api": {
              target: "http://localhost:8081",
              changeOrigin: true,
            },
          }
        : undefined,
    },
  };
});
