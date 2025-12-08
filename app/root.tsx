// Supports weights 400-700
import "@fontsource-variable/inter";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import type { SeoConfig } from "@shopify/hydrogen";
import { Analytics, getSeoMeta, useNonce } from "@shopify/hydrogen";
import { useThemeSettings, withWeaverse } from "@weaverse/hydrogen";
import { AnimatePresence, motion } from "framer-motion";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import type { AppLoadContext, LinksFunction, MetaArgs } from "react-router";
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
import { loadCriticalData, loadDeferredData } from "./.server/root";
import type { Route } from "./+types/root";
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
import styles from "./styles/app.css?url";
import { DEFAULT_LOCALE } from "./utils/const";
import { GlobalStyle } from "./weaverse/style";

export type RootLoader = typeof loader;

export const links: LinksFunction = () => {
    return [
        {
            rel: "preconnect",
            href: "https://cdn.shopify.com",
        },
        {
            rel: "preconnect",
            href: "https://shop.app",
        },
        { rel: "icon", type: "image/svg+xml", href: "/favicon.ico" },
    ];
};

export async function loader(args: Route.LoaderArgs) {
    const context = args.context as AppLoadContext;
    // Start fetching non-critical data without blocking time to first byte
    const deferredData = loadDeferredData({ context });

    // Await the critical data required to render initial state of the page
    const criticalData = await loadCriticalData({
        request: args.request,
        context,
    });

    return {
        ...deferredData,
        ...criticalData,
    };
}

export const meta = ({ data }: MetaArgs<typeof loader>) => {
    return getSeoMeta(data?.seo as SeoConfig);
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
                <ScrollRestoration nonce={nonce} />
                <Scripts nonce={nonce} />
            </body>
        </html>
    );
}

function App() {
    const location = useLocation();

    return (
        <AnimatePresence mode="sync" initial={true}>
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, pointerEvents: "none" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                <Outlet />
            </motion.div>
        </AnimatePresence>
    );
}

export default withWeaverse(App);
