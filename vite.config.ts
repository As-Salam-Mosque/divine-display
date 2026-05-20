import { defineConfig } from "vite";
import type { UserConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
const cfg: UserConfig & { test?: { environment: string; setupFiles: string } } =
  {
    plugins: [react()],
    test: {
      environment: "jsdom",
      setupFiles: "src/test/setup.ts",
    },
  };

export default defineConfig(cfg);
