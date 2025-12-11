/// <reference types="vite/client" />
/// <reference types="@shopify/oxygen-workers-types" />

/**
 * TypeScript declaration for Netlify virtual server entry module.
 * Used when deploying to Netlify Edge Functions with edge: true.
 */
declare module "virtual:netlify-server-entry" {
    import type { ServerEntryModule } from "react-router";
    const entry: ServerEntryModule;
    export default entry;
}

/**
 * TypeScript declaration for Netlify Edge Functions global.
 */
declare const Netlify:
    | {
          env: {
              get(key: string): string | undefined;
              has(key: string): boolean;
              toObject(): Record<string, string>;
          };
          context: {
              geo?: {
                  city?: string;
                  country?: { code?: string; name?: string };
                  subdivision?: { code?: string; name?: string };
              };
          };
      }
    | undefined;

// Enhance TypeScript's built-in typings.
import "@total-typescript/ts-reset";
import type { HydrogenEnv, HydrogenSessionData } from "@shopify/hydrogen";
import type { WeaverseClient } from "@weaverse/hydrogen";
import type { createHydrogenRouterContext } from "./app/.server/context";
import type { I18nLocale } from "./app/types/others";

declare global {
    /**
     * A global `process` object is only available during build to access NODE_ENV.
     */
    const process: { env: { NODE_ENV: "production" | "development" } };

    interface Env extends HydrogenEnv {
        // declare additional Env parameter use in the fetch handler and Remix loader context here
        /** Deployment target: 'oxygen' (default) or 'netlify' */
        DEPLOY_TARGET?: "oxygen" | "netlify";
        PUBLIC_GOOGLE_GTM_ID: string;
        JUDGEME_PRIVATE_API_TOKEN: string;
        CUSTOM_COLLECTION_BANNER_METAFIELD: string;
        METAOBJECT_COLORS_TYPE: string;
        KLAVIYO_PRIVATE_API_TOKEN: string;
        PUBLIC_SHOPIFY_INBOX_SHOP_ID: string;
        WEAVERSE_HOST?: string;
        // Metaobject keys for color swatches
        METAOBJECT_COLOR_NAME_KEY: string;
        METAOBJECT_COLOR_VALUE_KEY: string;
    }
}

declare module "react-router" {
    import type { Storefront as StorefrontBase } from "@shopify/hydrogen";

    interface AppLoadContext
        extends Awaited<ReturnType<typeof createHydrogenRouterContext>> {
        // to change context type, change the return of createHydrogenRouterContext() instead
        // Override storefront type to use I18nLocale instead of I18nBase
        storefront: Omit<StorefrontBase, "i18n"> & {
            i18n: I18nLocale;
        };
        weaverse: WeaverseClient;
        additionalContext: HydrogenAdditionalContext;
    }

    interface SessionData extends HydrogenSessionData {
        // declare local additions to the Remix session data here
    }
}

declare global {
    interface Window {
        dataLayer: any[];
    }
}
