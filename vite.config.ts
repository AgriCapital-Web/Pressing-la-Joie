import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";

const PLACEHOLDER = path.resolve(__dirname, "./src/assets/placeholder.svg");

// Certains médias historiques ne sont plus présents dans le dépôt.
// Ce plugin évite de casser le build en les remplaçant par un visuel de repli.
const missingAssetFallback = () => ({
  name: "missing-asset-fallback",
  enforce: "pre" as const,
  resolveId(source: string, importer?: string) {
    if (!/\.(png|jpe?g|webp|gif|svg|avif|mp4|webm)$/i.test(source)) return null;
    let resolved: string | null = null;
    if (source.startsWith("@/")) {
      resolved = path.resolve(__dirname, "./src", source.slice(2));
    } else if (source.startsWith(".") && importer) {
      resolved = path.resolve(path.dirname(importer), source);
    }
    if (resolved && !fs.existsSync(resolved)) return PLACEHOLDER;
    return null;
  },
});

export default defineConfig(({ mode }) => ({
  server: { host: "::", port: 8080 },
  plugins: [missingAssetFallback(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));