import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy GeoServer REST API calls during local development.
      // When running outside Docker, override with:
      //   VITE_GS_TARGET=http://localhost:8080 npm run dev
      "/geoserver": {
        target: process.env.VITE_GS_TARGET ?? "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
