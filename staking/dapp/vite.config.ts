import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import inject from "@rollup/plugin-inject";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    build:
      mode === "production"
        ? {
            rollupOptions: {
              plugins: [inject({ Buffer: ["buffer", "Buffer"] })],
            },
          }
        : undefined,
    define:
      mode === "development"
        ? {
            global: {},
          }
        : undefined,

    optimizeDeps: {
      esbuildOptions:
        mode === "development"
          ? {
              define: {
                global: "globalThis",
              },
              plugins: [
                NodeGlobalsPolyfillPlugin({
                  buffer: true,
                  process: true,
                }),
              ],
            }
          : undefined,
    },
  };
});