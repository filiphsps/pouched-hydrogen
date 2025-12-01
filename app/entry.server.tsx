import {
    createContentSecurityPolicy,
    type HydrogenRouterContextProvider,
} from "@shopify/hydrogen";
import { createInstance } from "i18next";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import { I18nextProvider, initReactI18next } from "react-i18next";
import type { EntryContext } from "react-router";
import { ServerRouter } from "react-router";
import { getWeaverseCsp } from "~/weaverse/csp";
import i18n from "./i18n";
import i18next from "./i18n.server";

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
