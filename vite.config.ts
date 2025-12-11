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

export default defineConfig(async ({ isSsrBuild, mode }) => {
    const deploymentPlugin = await getDeploymentPlugin();
    const isNetlifyEdgeBuild = mode === "netlify-edge" || process.argv.includes("netlify-edge");
    console.log(`[Vite] Building for mode: ${mode}, isNetlifyEdgeBuild: ${isNetlifyEdgeBuild}`);

    const config: UserConfig = {
        plugins: [
            // Exclude hydrogen plugin for Edge build to prevent dist overwrite
            !isNetlifyEdgeBuild ? hydrogen() : null,
            deploymentPlugin,
            // Only runs the React Router plugin if we are NOT manually building the Edge Function.
            !isNetlifyEdgeBuild ? reactRouter() : null,
            tsconfigPaths() as any,
            tailwindcss(),
            // Custom plugin to strip 'use client' directives for Edge build
            ...(isNetlifyEdgeBuild
                ? [
                      {
                          name: "strip-use-client",
                          transform(code: string) {
                              if (code.includes("use client")) {
                                  return {
                                      code: code.replace(
                                          /["']use client["'];?/g,
                                          "",
                                      ),
                                      map: null,
                                  };
                              }
                          },
                      },
                  ]
                : []),
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
            emptyOutDir: false, // Don't wipe 'dist' even if targeting it by mistake
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
            outDir: ".netlify/edge-functions",
            emptyOutDir: false, // SAFEGUARD: Prevent accidental wipe
            rollupOptions: {
                input: "app/entry.netlify.server.ts",
                output: {
                    entryFileNames: "ssr.js",
                    format: "es",
                },
                onwarn(warning, warn) {
                    if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
                        return;
                    }
                    warn(warning);
                },
            },
        };
    }

    return config;
});
