/**
 * Netlify Edge Functions server entry point for Hydrogen.
 * This file is used when DEPLOY_TARGET=netlify.
 *
 * @see https://github.com/netlify/hydrogen-template/blob/main/server.ts
 */
import * as remixBuild from "virtual:react-router/server-build";
import type { Context } from "@netlify/edge-functions";
import {
    createHydrogenAppLoadContext,
    createRequestHandler,
} from "@netlify/remix-edge-adapter";
import { storefrontRedirect } from "@shopify/hydrogen";
import { createAppLoadContext } from "./app/lib/context.netlify";

/**
 * Netlify Edge Function handler for Hydrogen SSR.
 *
 * @param request - Incoming HTTP request
 * @param netlifyContext - Netlify edge function context
 * @returns Response or undefined
 */
export default async function (
    request: Request,
    netlifyContext: Context,
): Promise<Response | undefined> {
    try {
        const appLoadContext = await createHydrogenAppLoadContext(
            request,
            netlifyContext,
            createAppLoadContext,
        );

        // Type assertion needed because @netlify/remix-edge-adapter expects Remix's
        // ServerBuild type, but React Router 7 uses a slightly different structure.
        // The runtime behavior is compatible.
        const handleRequest = createRequestHandler({
            build: remixBuild as unknown as Parameters<
                typeof createRequestHandler
            >[0]["build"],
            mode: process.env.NODE_ENV,
        });

        const response = await handleRequest(request, appLoadContext);

        if (!response) {
            return;
        }

        if (appLoadContext.session.isPending) {
            response.headers.set(
                "Set-Cookie",
                await appLoadContext.session.commit(),
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
                storefront: appLoadContext.storefront,
            });
        }

        return response;
    } catch (error) {
        console.error(error);
        return new Response("An unexpected error occurred", { status: 500 });
    }
}
