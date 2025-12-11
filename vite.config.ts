import { reactRouter } from "@react-router/dev/vite";
import { hydrogen } from "@shopify/hydrogen/vite";
import { oxygen } from "@shopify/mini-oxygen/vite";
import tailwindcss from "@tailwindcss/vite";
import type { UserConfig } from "vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Determines if we're targeting Netlify deployment.
 * Set DEPLOY_TARGET=netlify to build for Netlify Edge Functions.
 */
const isNetlify = process.env.DEPLOY_TARGET === "netlify";

/**
 * Gets the appropriate deployment plugin based on target.
 * - Oxygen (default): Uses mini-oxygen for local dev
 * - Netlify: Uses @netlify/vite-plugin-react-router for Edge Functions
 */
async function getDeploymentPlugin() {
    if (isNetlify) {
        const { default: netlifyReactRouter } = await import(
            "@netlify/vite-plugin-react-router"
        );
        return netlifyReactRouter({ edge: true });
    }
    return oxygen();
}

export default defineConfig(async (): Promise<UserConfig> => {
    const deploymentPlugin = await getDeploymentPlugin();

    return {
        plugins: [
            hydrogen(),
            deploymentPlugin,
            reactRouter(),
            tsconfigPaths() as any,
            tailwindcss()
        ].filter(Boolean),
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
});
