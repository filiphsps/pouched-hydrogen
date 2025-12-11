/// <reference types="vitest" />

import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import type { ViteUserConfigExport } from "vitest/config";

export default defineConfig({
    plugins: [tsconfigPaths(), react()],
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: ["./tests/setup.ts"],
        include: ["./app/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        watch: false,
        alias: {
            "swiper/react": path.resolve(__dirname, "./tests/mocks/swiper.tsx"),
            "swiper/modules": path.resolve(
                __dirname,
                "./tests/mocks/swiper.tsx",
            ),
            "swiper/css": path.resolve(__dirname, "./tests/mocks/swiper.tsx"),
            "swiper/css/navigation": path.resolve(
                __dirname,
                "./tests/mocks/swiper.tsx",
            ),
            "swiper/css/pagination": path.resolve(
                __dirname,
                "./tests/mocks/swiper.tsx",
            ),
        },
        server: {
            deps: {
                inline: ["swiper"],
            },
        },
    },
} as ViteUserConfigExport);
