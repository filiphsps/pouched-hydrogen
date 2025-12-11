export function buildEnvFromNetlify(): Env {
    console.log("[Env] buildEnvFromNetlify called");
    const netlifyEnv = globalThis.Netlify?.env;

    if (!netlifyEnv) {
        console.error("[Env] Netlify.env missing!");
        throw new Error(
            "Netlify.env is not available. Are you running in Netlify Edge Functions?",
        );
    }

    console.log("[Env] Netlify.env available. Getting keys...");

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
