/**
 * Hydrogen server entry point.
 * This file handles both Oxygen and Netlify Edge Functions deployments.
 *
 * For Netlify Edge Functions, we provide a custom handleRequest that uses
 * our Hydrogen context (storefront, session, weaverse).
 */
import {
    createContentSecurityPolicy,
    type HydrogenRouterContextProvider,
    storefrontRedirect,
} from "@shopify/hydrogen";
import { createInstance } from "i18next";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import { I18nextProvider, initReactI18next } from "react-i18next";
import type { AppLoadContext, EntryContext } from "react-router";
import { ServerRouter } from "react-router";
import { getWeaverseCsp } from "~/weaverse/csp";
import i18n from "./i18n";
import i18next from "./i18n.server";

/**
 * Default export handles the actual rendering of the application.
 * This is called by both Oxygen and Netlify Edge Functions once the
 * context has been created.
 *
 * @param request - The incoming HTTP request
 * @param responseStatusCode - Initial status code (may be changed on error)
 * @param responseHeaders - Headers to include in the response
 * @param reactRouterContext - React Router entry context
 * @param context - Hydrogen context (storefront, session, weaverse, etc.)
 */
export default async function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    reactRouterContext: EntryContext,
    context: AppLoadContext,
) {
    console.log("[Entry] handleRequest called");

    // Cast to Hydrogen context type for proper typing
    const hydrogenContext = context as HydrogenRouterContextProvider;

    console.log(
        "[Entry] handleRequest context keys:",
        Object.keys(context || {}),
    );
    if (hydrogenContext?.storefront) {
        console.log(
            "[Entry] handleRequest storefront.i18n:",
            hydrogenContext.storefront.i18n,
        );
    } else {
        console.error("[Entry] handleRequest MISSING STOREFRONT IN CONTEXT");
    }

    const { nonce, header, NonceProvider } = createContentSecurityPolicy({
        ...getWeaverseCsp(request, hydrogenContext),
        shop: {
            checkoutDomain:
                hydrogenContext.env?.PUBLIC_CHECKOUT_DOMAIN ||
                hydrogenContext.env?.PUBLIC_STORE_DOMAIN,
            storeDomain: hydrogenContext.env?.PUBLIC_STORE_DOMAIN,
        },
    });

    const instance = createInstance();
    const lng = hydrogenContext.storefront.i18n.language.toLowerCase();
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
