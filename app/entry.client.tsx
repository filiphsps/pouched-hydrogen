import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import "swiper/css";
import "swiper/css/pagination";
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { getInitialNamespaces } from "remix-i18next/client";
import i18n from "./i18n";

async function hydrate() {
    await i18next
        .use(initReactI18next)
        .use(LanguageDetector)
        .init({
            ...i18n,
            ns: getInitialNamespaces(),
            detection: {
                order: ["htmlTag"],
                caches: [],
            },
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

if (!window.location.origin.includes("webcache.googleusercontent.com")) {
    hydrate();
}
