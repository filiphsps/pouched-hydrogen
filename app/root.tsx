// Supports weights 400-700
import "@fontsource-variable/inter";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import type { SeoConfig } from "@shopify/hydrogen";
import { Analytics, getSeoMeta, useNonce } from "@shopify/hydrogen";
import { useThemeSettings, withWeaverse } from "@weaverse/hydrogen";

import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import type {
    AppLoadContext,
    LinksFunction,
    MetaArgs,
    ShouldRevalidateFunction,
} from "react-router";
import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLocation,
    useRouteError,
    useRouteLoaderData,
} from "react-router";
import { useChangeLanguage } from "remix-i18next/react";
import { CartProvider } from "~/lib/cart";
import {
    loadCartData,
    loadCriticalData,
    loadDeferredData,
} from "./.server/root";
import type { Route } from "./+types/root";
import { AgeVerificationGate } from "./components/compliance/age-verification-gate";
import { CookieConsentBanner } from "./components/compliance/cookie-consent-banner";
import { Footer } from "./components/layout/footer";
import { Header } from "./components/layout/header";
import { ScrollingAnnouncement } from "./components/layout/scrolling-announcement";
import { CustomAnalytics } from "./components/root/custom-analytics";
import { GenericError } from "./components/root/generic-error";
import { GlobalLoading } from "./components/root/global-loading";
import {
    NewsletterPopup,
    useShouldRenderNewsletterPopup,
} from "./components/root/newsletter-popup";
import { NotFound } from "./components/root/not-found";
import { JsonLd } from "./components/seo/json-ld";
import styles from "./styles/app.css?url";
import { DEFAULT_LOCALE } from "./utils/const";
import { GlobalStyle } from "./weaverse/style";

export type RootLoader = typeof loader;

export const links: LinksFunction = () => {
    return [
        // Preconnect to critical third-party origins for faster resource fetching
        {
            rel: "preconnect",
            href: "https://cdn.shopify.com",
        },
        {
            rel: "preconnect",
            href: "https://shop.app",
        },
        // Preload the main stylesheet for faster LCP
        {
            rel: "preload",
            href: styles,
            as: "style",
        },
        { rel: "icon", type: "image/svg+xml", href: "/favicon.ico" },
    ];
};

export async function loader(args: Route.LoaderArgs) {
    const context = args.context as AppLoadContext;
    // Start fetching non-critical data without blocking time to first byte
    const deferredData = loadDeferredData({ context });

    // Await critical data and cart in parallel
    // Cart is fetched with critical data to ensure it's always fresh after mutations
    // (deferred cart data can get stuck due to React Router Promise handling issues)
    const [criticalData, cart] = await Promise.all([
        loadCriticalData({
            request: args.request,
            context,
        }),
        loadCartData({ context }),
    ]);

    return {
        ...deferredData,
        ...criticalData,
        cart,
        publicDoNotIndex: Boolean(context.env.PUBLIC_DO_NOT_INDEX),
    };
}

/**
 * Controls when the root loader should revalidate.
 *
 * IMPORTANT: Cart mutations (fetcher POSTs to /cart) do NOT trigger root
 * revalidation. Cart state after mutations is handled client-side via
 * `useCartData()` which reads the mutation response directly from the
 * fetcher — this avoids Shopify Storefront API eventual consistency issues
 * where `cart.get()` returns stale data from a read replica.
 *
 * The root loader's cart data refreshes on the next navigation instead.
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
    formMethod,
    formAction,
    currentUrl,
    nextUrl,
    defaultShouldRevalidate,
}) => {
    // Skip revalidation for cart mutations — cart state is managed client-side
    // via useCartData which uses the fetcher's mutation response directly.
    // Revalidating here would call cart.get() which often returns stale data
    // due to Shopify's eventual consistency, causing UI flicker.
    if (
        formMethod &&
        formMethod !== "GET" &&
        formAction &&
        (formAction.endsWith("/cart") || formAction.endsWith("/cart.data"))
    ) {
        return false;
    }

    // Revalidate for non-cart mutations (e.g., login, account updates)
    if (formMethod && formMethod !== "GET") {
        return true;
    }

    // Revalidate when manually revalidating via useRevalidator
    if (currentUrl.toString() === nextUrl.toString()) {
        return true;
    }

    // Fall back to React Router's default behavior for other cases
    return defaultShouldRevalidate;
};

export const meta = ({ data }: MetaArgs<typeof loader>) => {
    const loaderData = data as Awaited<ReturnType<typeof loader>> | undefined;
    const baseMeta = getSeoMeta(loaderData?.seo as SeoConfig);

    if (loaderData?.publicDoNotIndex) {
        return [...baseMeta, { name: "robots", content: "noindex, nofollow" }];
    }

    return baseMeta;
};

export function ErrorBoundary({ error }: { error: Error }) {
    const routeError = useRouteError();
    const isRouteError = isRouteErrorResponse(routeError);

    let pageType = "page";

    if (isRouteError && routeError.status === 404) {
        pageType = routeError.data || pageType;
    }

    return isRouteError ? (
        routeError.status === 404 ? (
            <NotFound type={pageType} />
        ) : (
            <GenericError
                error={{ message: `${routeError.status} ${routeError.data}` }}
            />
        )
    ) : (
        <GenericError error={error instanceof Error ? error : undefined} />
    );
}

/**
 * Global layout component that wraps all pages.
 *
 * This component provides the global header and footer that appear on every page.
 * Theme settings from Weaverse schema control the appearance and behavior.
 *
 * IMPORTANT: Do NOT add Header or Footer sections to individual Weaverse pages
 * in the Studio, as this will create duplicate headers/footers. The global
 * Header and Footer components below will automatically appear on all pages.
 *
 * @param {React.ReactNode} children - The page content to render between header and footer
 */
export function Layout({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const nonce = useNonce();
    const data = useRouteLoaderData<RootLoader>("root");

    const locale = data?.selectedLocale ?? DEFAULT_LOCALE;
    useChangeLanguage(locale.language.toLowerCase());

    const { t } = useTranslation();
    const { topbarHeight, topbarText } = useThemeSettings();
    const shouldShowNewsletterPopup = useShouldRenderNewsletterPopup();

    if (
        location.pathname === "/subrequest-profiler" ||
        location.pathname === "/graphiql"
    ) {
        return children;
    }

    return (
        <html lang={locale.language.toLowerCase()}>
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width,initial-scale=1"
                />
                <link rel="stylesheet" href={styles} />
                <Meta />
                <Links />
                <GlobalStyle />
                <JsonLd
                    data={{
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        name: data?.layout?.shop?.name,
                        url: data?.layout?.shop?.primaryDomain?.url,
                    }}
                />
            </head>
            <body
                style={
                    {
                        opacity: 0,
                        "--initial-topbar-height": `${topbarText ? topbarHeight : 0}px`,
                    } as CSSProperties
                }
                className="bg-background text-body antialiased opacity-100! transition-opacity duration-300"
            >
                {data ? (
                    <Analytics.Provider
                        cart={data.cart}
                        shop={data.shop}
                        consent={data.consent}
                    >
                        <CartProvider cart={data.cart} />
                        <TooltipProvider disableHoverableContent>
                            <div
                                className="flex min-h-screen flex-col"
                                key={`${locale.language}-${locale.country}`}
                            >
                                {/* Global scrolling announcement bar */}
                                <ScrollingAnnouncement />
                                {/* Global header - appears on all pages */}
                                <Header />

                                <main id="mainContent" className="grow">
                                    {children}
                                </main>

                                {/* Global footer - appears on all pages */}
                                <Footer />
                            </div>
                            {shouldShowNewsletterPopup && <NewsletterPopup />}
                        </TooltipProvider>

                        <CustomAnalytics />
                    </Analytics.Provider>
                ) : (
                    children
                )}
                <GlobalLoading />
                {/* Age verification gate - blocks all content until verified */}
                <AgeVerificationGate />
                {/* Cookie consent banner - GDPR/DSGVO compliant */}
                <CookieConsentBanner />
                <ScrollRestoration nonce={nonce} />
                <Scripts nonce={nonce} />
            </body>
        </html>
    );
}

/**
 * App component that renders the current route.
 * Previously wrapped in AnimatePresence for page transitions, but this caused
 * significant performance overhead (~160ms DOM mutation time on route changes).
 * Removed animation for better performance - navigation is now instant.
 */
function App() {
    return <Outlet />;
}

export default withWeaverse(App);
