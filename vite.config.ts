import { reactRouter } from "@react-router/dev/vite";
import { hydrogen } from "@shopify/hydrogen/vite";
import { oxygen } from "@shopify/mini-oxygen/vite";
import tailwindcss from "@tailwindcss/vite";
import type { UserConfig } from "vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";

/**
 * Determines if we're targeting Netlify deployment.
 * Set DEPLOY_TARGET=netlify to build for Netlify Edge Functions.
 */
const isNetlify = process.env.DEPLOY_TARGET === "netlify";

/**
 * Gets the appropriate deployment plugin based on target.
 * - Oxygen (default): Uses mini-oxygen for local dev and production
 * - Netlify: We use a custom Edge Function handler (netlify/edge-functions/ssr.ts)
 *   so we don't need the Netlify plugin's generated handler. We return null
 *   and handle SSR ourselves.
 */
async function getDeploymentPlugin() {
    if (isNetlify) {
        // For Netlify, we don't use the plugin's server generation.
        // We provide our own Edge Function in netlify/edge-functions/ssr.ts
        // that properly integrates Hydrogen context.
        return null;
    }
    return oxygen();
}

export default defineConfig(async ({ isSsrBuild }) => {
    const deploymentPlugin = await getDeploymentPlugin();
    const isNetlifyEdgeBuild = process.env.EDGE_BUNDLE === "true";

    const config: UserConfig = {
        plugins: [
            hydrogen(),
            deploymentPlugin,
            // Only runs the React Router plugin if we are NOT manually building the Edge Function.
            // For the Edge Function build, we use the pre-built manifest via alias.
            !isNetlifyEdgeBuild ? reactRouter() : null,
            tsconfigPaths() as any,
            tailwindcss(),
        ].filter(Boolean),
        resolve: {
            alias: {
                ...(isNetlifyEdgeBuild
                    ? {
                          "virtual:react-router/server-build": path.resolve(
                              __dirname,
                              "./dist/server/server.js",
                          ),
                          react: path.resolve(__dirname, "node_modules/react"),
                          "react-dom": path.resolve(
                              __dirname,
                              "node_modules/react-dom",
                          ),
                          // Node built-ins for Netlify Edge (Deno) compatibility
                          stream: "node:stream",
                          crypto: "node:crypto",
                          async_hooks: "node:async_hooks",
                          util: "node:util",
                          buffer: "node:buffer",
                          events: "node:events",
                      }
                    : {}),
            },
        },
        build: {
            // Allow a strict Content-Security-Policy
            // without inlining assets as base64:
            assetsInlineLimit: 0,
        },
        server: {
            fs: {
                strict: false,
                allow: ["~/", ".."],
            },
            warmup: {
                clientFiles: [
                    "./app/routes/**/*",
                    "./app/sections/**/*",
                    "./app/components/**/*",
                ],
            },
            allowedHosts: true,
            cors: true,
        },
        ssr: {
            noExternal: ["remix-i18next"],
            optimizeDeps: {
                include: [
                    "react-i18next",
                    "react-share",
                    "@fontsource-variable/inter",
                ],
            },
        },
    };

    if (isNetlifyEdgeBuild) {
        config.ssr = {
            ...config.ssr,
            noExternal: true, // Bundle EVERYTHING
            // Explicitly externalize Node built-ins for Deno compat
            external: [
                "node:stream",
                "node:crypto",
                "node:async_hooks",
                "node:util",
                "node:buffer",
                "node:events",
            ],
            target: "webworker",
        };
        config.build = {
            ...config.build,
            outDir: "netlify/edge-functions",
            emptyOutDir: true,
            rollupOptions: {
                input: "app/entry.netlify.server.ts",
                output: {
                    entryFileNames: "ssr.js",
                    format: "es",
                },
            },
        };

        // Add a custom plugin to strip 'use client' directives
        config.plugins = [
            ...(config.plugins || []),
            {
                name: "strip-use-client",
                transform(code) {
                    if (code.includes('use client')) {
                        return {
                            code: code.replace(/["']use client["'];?/g, ""),
                            map: null,
                        };
                    }
                },
            },
        ];
    }

    return config;
});
