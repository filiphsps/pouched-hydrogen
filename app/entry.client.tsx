import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import "swiper/css";
import "swiper/css/pagination";
import i18next from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { getInitialNamespaces } from "remix-i18next/client";
import i18n from "./i18n";

/**
 * Hydrates the React application on the client side.
 * Initializes i18n with the language from the server-rendered HTML lang attribute
 * to ensure hydration consistency.
 */
async function hydrate() {
    // Get the language synchronously from the HTML lang attribute
    // This MUST match what the server rendered to avoid hydration mismatch
    const lang = document.documentElement.lang || i18n.fallbackLng;

    await i18next.use(initReactI18next).init({
        ...i18n,
        lng: lang, // Explicitly set the language to match server
        ns: getInitialNamespaces(),
        // Don't use language detector - use explicit lang from server
    });

    startTransition(() => {
        hydrateRoot(
            document,
            <I18nextProvider i18n={i18next}>
                <StrictMode>
                    <HydratedRouter />
                </StrictMode>
            </I18nextProvider>,
        );
    });
}

// Prevent hydration on Googlebot
if (!window.location.origin.includes("webcache.googleusercontent.com")) {
    hydrate();
}
