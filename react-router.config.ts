import type { Config } from "@react-router/dev/config";
import { hydrogenPreset } from "@shopify/hydrogen/react-router-preset";

/**
 * Determines if we're targeting Netlify deployment.
 * Set DEPLOY_TARGET=netlify to build for Netlify Edge Functions.
 */
const isNetlify = process.env.DEPLOY_TARGET === "netlify";

export default {
    presets: [hydrogenPreset()],
    future: {
        unstable_optimizeDeps: true,
        unstable_viteEnvironmentApi: true,
    },
    appDirectory: "app",
    buildDirectory: "dist",
    ssr: true,
    // Netlify's vite-plugin-react-router expects server.js, not index.js
    // Oxygen uses the default index.js
    ...(isNetlify && { serverBuildFile: "server.js" }),
} satisfies Config;
