import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Directs any frontend network requests starting with /api over to your Express port
      "/api": {
        target: "http://localhost:5000", // 🔥 Change 5000 to your backend port if it's different!
        changeOrigin: true,
        secure: false,
      },
    },
  },
});