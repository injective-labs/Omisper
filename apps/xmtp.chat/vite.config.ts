import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  resolve: {
    alias: {
      "@root": resolve(__dirname, "../../.."),
    },
  },
  optimizeDeps: {
    exclude: ["@xmtp/wasm-bindings"],
  },
  build: {
    sourcemap: true,
  },
});
