/**
 * Hydrogen server entry point.
 * This file handles both Oxygen and Netlify Edge Functions deployments.
 *
 * For Netlify Edge Functions, we use @netlify/remix-edge-adapter which provides
 * createHydrogenAppLoadContext for proper Hydrogen integration.
 */
import * as remixBuild from "virtual:react-router/server-build";
import {
    createContentSecurityPolicy,
    type HydrogenRouterContextProvider,
    storefrontRedirect,
} from "@shopify/hydrogen";
import { createInstance } from "i18next";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import { I18nextProvider, initReactI18next } from "react-i18next";
import type { EntryContext } from "react-router";
import { ServerRouter } from "react-router";
import { createHydrogenRouterContext } from "~/.server/context";
import { buildEnvFromNetlify } from "~/lib/env.server";
import { getWeaverseCsp } from "~/weaverse/csp";
import i18n from "./i18n";
import i18next from "./i18n.server";

/**
 * Get load context for Netlify Edge Functions.
 * This function is called by the Edge Function handler to create
 * the Hydrogen router context for each request.
 */
export async function getLoadContext(request: Request) {
    console.log("[Entry] getLoadContext called");
    const env = buildEnvFromNetlify();
    return createHydrogenRouterContext(request, env);
}

/**
 * Netlify Edge Function handler export.
 * This is the main entry point for Netlify Edge Functions.
 */
export async function netlifyEdgeHandler(request: Request): Promise<Response> {
    try {
        console.log("[Entry] netlifyEdgeHandler starting");
        const hydrogenContext = await getLoadContext(request);
        console.log(
            "[Entry] Context created. Weaverse:",
            Boolean(hydrogenContext.weaverse),
        );

        // Import createRequestHandler from react-router for handling routes
        const { createRequestHandler } = await import("react-router");
        const routeHandler = createRequestHandler(
            remixBuild,
            process.env.NODE_ENV,
        );

        // Cast context to satisfy React Router's expected type
        const response = await routeHandler(
            request,
            hydrogenContext as Parameters<typeof routeHandler>[1],
        );

        // Set session cookie if pending
        if (hydrogenContext.session.isPending) {
            response.headers.set(
                "Set-Cookie",
                await hydrogenContext.session.commit(),
            );
        }

        // Handle 404s with storefront redirects
        if (response.status === 404) {
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
}

console.log("[Entry] module loaded");

/**
 * Default export handles the actual rendering of the application.
 * This is called by both Oxygen and Netlify Edge Functions once the
 * context has been created.
 */
export default async function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    reactRouterContext: EntryContext,
    context: HydrogenRouterContextProvider,
) {
    console.log("[Entry] handleRequest called");
    console.log(
        "[Entry] handleRequest context keys:",
        Object.keys(context || {}),
    );
    if (context?.storefront) {
        console.log(
            "[Entry] handleRequest storefront.i18n:",
            context.storefront.i18n,
        );
    } else {
        console.error("[Entry] handleRequest MISSING STOREFRONT IN CONTEXT");
    }

    const { nonce, header, NonceProvider } = createContentSecurityPolicy({
        ...getWeaverseCsp(request, context),
        shop: {
            checkoutDomain:
                context.env?.PUBLIC_CHECKOUT_DOMAIN ||
                context.env?.PUBLIC_STORE_DOMAIN,
            storeDomain: context.env?.PUBLIC_STORE_DOMAIN,
        },
    });

    const instance = createInstance();
    const lng = context.storefront.i18n.language.toLowerCase();
    const ns = i18next.getRouteNamespaces(reactRouterContext);

    await instance.use(initReactI18next).init({
        ...i18n,
        lng,
        ns,
    });

    const body = await renderToReadableStream(
        <I18nextProvider i18n={instance}>
            <NonceProvider>
                <ServerRouter
                    context={reactRouterContext}
                    url={request.url}
                    nonce={nonce}
                />
            </NonceProvider>
        </I18nextProvider>,
        {
            nonce,
            signal: request.signal,
            onError(error) {
                console.error(error);
                responseStatusCode = 500;
            },
        },
    );

    if (isbot(request.headers.get("user-agent"))) {
        await body.allReady;
    }

    responseHeaders.set("Content-Type", "text/html");
    // TODO: change to Content-Security-Policy when you ready with your CSP configs.
    responseHeaders.set("Content-Security-Policy-Report-Only", header);

    return new Response(body, {
        headers: responseHeaders,
        status: responseStatusCode,
    });
}
