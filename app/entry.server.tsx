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
import { getWeaverseCsp } from "~/weaverse/csp";
import i18n from "./i18n";
import i18next from "./i18n.server";

/**
 * Build Env object from Netlify.env global.
 * In Netlify Edge Functions, env vars are accessed via Netlify.env.get()
 */
function buildEnvFromNetlify(): Env {
    const netlifyEnv = Netlify?.env;

    if (!netlifyEnv) {
        throw new Error(
            "Netlify.env is not available. Are you running in Netlify Edge Functions?",
        );
    }

    return {
        SESSION_SECRET: netlifyEnv.get("SESSION_SECRET") || "",
        PUBLIC_STOREFRONT_API_TOKEN:
            netlifyEnv.get("PUBLIC_STOREFRONT_API_TOKEN") || "",
        PRIVATE_STOREFRONT_API_TOKEN:
            netlifyEnv.get("PRIVATE_STOREFRONT_API_TOKEN") || "",
        PUBLIC_STORE_DOMAIN: netlifyEnv.get("PUBLIC_STORE_DOMAIN") || "",
        PUBLIC_STOREFRONT_ID: netlifyEnv.get("PUBLIC_STOREFRONT_ID") || "",
        PUBLIC_CHECKOUT_DOMAIN: netlifyEnv.get("PUBLIC_CHECKOUT_DOMAIN") || "",
        PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID:
            netlifyEnv.get("PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID") || "",
        PUBLIC_CUSTOMER_ACCOUNT_API_URL:
            netlifyEnv.get("PUBLIC_CUSTOMER_ACCOUNT_API_URL") || "",
        SHOP_ID: netlifyEnv.get("SHOP_ID") || "",
        // Weaverse
        WEAVERSE_PROJECT_ID: netlifyEnv.get("WEAVERSE_PROJECT_ID") || "",
        WEAVERSE_HOST: netlifyEnv.get("WEAVERSE_HOST") || "",
        WEAVERSE_API_KEY: netlifyEnv.get("WEAVERSE_API_KEY") || "",
        // Custom environment variables
        DEPLOY_TARGET: "netlify",
        PUBLIC_GOOGLE_GTM_ID: netlifyEnv.get("PUBLIC_GOOGLE_GTM_ID") || "",
        JUDGEME_PRIVATE_API_TOKEN:
            netlifyEnv.get("JUDGEME_PRIVATE_API_TOKEN") || "",
        CUSTOM_COLLECTION_BANNER_METAFIELD:
            netlifyEnv.get("CUSTOM_COLLECTION_BANNER_METAFIELD") || "",
        METAOBJECT_COLORS_TYPE: netlifyEnv.get("METAOBJECT_COLORS_TYPE") || "",
        KLAVIYO_PRIVATE_API_TOKEN:
            netlifyEnv.get("KLAVIYO_PRIVATE_API_TOKEN") || "",
        PUBLIC_SHOPIFY_INBOX_SHOP_ID:
            netlifyEnv.get("PUBLIC_SHOPIFY_INBOX_SHOP_ID") || "",
        METAOBJECT_COLOR_NAME_KEY:
            netlifyEnv.get("METAOBJECT_COLOR_NAME_KEY") || "",
        METAOBJECT_COLOR_VALUE_KEY:
            netlifyEnv.get("METAOBJECT_COLOR_VALUE_KEY") || "",
    };
}

/**
 * Get load context for Netlify Edge Functions.
 * This function is called by the Edge Function handler to create
 * the Hydrogen router context for each request.
 *
 * @param request - The incoming request
 * @returns The Hydrogen router context for use in loaders/actions
 */
export async function getLoadContext(request: Request) {
    const env = buildEnvFromNetlify();
    return createHydrogenRouterContext(request, env);
}

/**
 * Netlify Edge Function handler export.
 * This is the main entry point for Netlify Edge Functions.
 */
export async function netlifyEdgeHandler(request: Request): Promise<Response> {
    try {
        const hydrogenContext = await getLoadContext(request);

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
