/**
 * Hydrogen server entry point.
 * Handles both Shopify Oxygen and Netlify Edge Functions deployments.
 *
 * For Netlify Edge, this exports the handler for virtual:netlify-server-entry.
 * For Oxygen, this exports a fetch handler in module format.
 */
import * as remixBuild from "virtual:react-router/server-build";
import { storefrontRedirect } from "@shopify/hydrogen";
import { createRequestHandler } from "@shopify/hydrogen/oxygen";
import { createHydrogenRouterContext } from "~/.server/context";

import { buildEnvFromNetlify } from "~/lib/env.server";

/**
 * Oxygen deployment handler.
 * Export a fetch handler in module format for Cloudflare Workers.
 */
export default {
    async fetch(
        request: Request,
        env: Env,
        executionContext: ExecutionContext,
    ): Promise<Response> {
        try {
            // Check if running on Netlify and build proper Env object
            const isNetlify = Boolean(globalThis.Netlify);
            console.log(`[Server] isNetlify: ${isNetlify}`);

            let appEnv = env;
            if (isNetlify) {
                console.log("[Server] Building Env from Netlify global");
                appEnv = buildEnvFromNetlify();
            } else {
                console.log(
                    "[Server] Using passed env object. Keys:",
                    Object.keys(env || {}),
                );
            }

            const hydrogenContext = await createHydrogenRouterContext(
                request,
                appEnv,
                executionContext,
            );

            console.log(
                "[Server] Context created. Weaverse:",
                hydrogenContext.weaverse,
                "Storefront:",
                hydrogenContext.storefront,
            );

            /**
             * Create a Remix request handler and pass
             * Hydrogen's Storefront client to the loader context.
             */
            const handleRequest = createRequestHandler({
                build: remixBuild,
                mode: process.env.NODE_ENV,
                getLoadContext: () => hydrogenContext,
            });

            const response = await handleRequest(request);

            if (hydrogenContext.session.isPending) {
                response.headers.set(
                    "Set-Cookie",
                    await hydrogenContext.session.commit(),
                );
            }

            if (response.status === 404) {
                /**
                 * Check for redirects only when there's a 404 from the app.
                 * If the redirect doesn't exist, then `storefrontRedirect`
                 * will pass through the 404 response.
                 */
                return storefrontRedirect({
                    request,
                    response,
                    storefront: hydrogenContext.storefront,
                });
            }

            return response;
        } catch (error) {
            console.error(error);
            return new Response("An unexpected error occurred", {
                status: 500,
            });
        }
    },
};
