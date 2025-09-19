import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // This tells Vite to serve the PDF worker as a file URL instead of bundling it
      "pdfjs-dist/build/pdf.worker.min": "pdfjs-dist/build/pdf.worker.min?url",
    },
  },
}));
