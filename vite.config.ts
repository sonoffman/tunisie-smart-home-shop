import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Active le tagger uniquement en mode développement
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // 👇 Nécessaire pour le pré-rendu : permet de retrouver le bon fichier JS
    manifest: true,

    // 👇 Recommandé pour les assets (ex : images, CSS, etc.)
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,

    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
      output: {
        // S'assure que le fichier d'entrée est bien indexé avec un hash unique
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
}));
