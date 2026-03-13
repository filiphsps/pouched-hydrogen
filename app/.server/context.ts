import type { HydrogenSession } from "@shopify/hydrogen";
import {
    cartGetIdDefault,
    cartSetIdDefault,
    createHydrogenContext,
} from "@shopify/hydrogen";
import { WeaverseClient } from "@weaverse/hydrogen";
import {
    createCookieSessionStorage,
    type Session,
    type SessionStorage,
} from "react-router";
import { CART_MUTATE_FRAGMENT, CART_QUERY_FRAGMENT } from "~/graphql/fragments";
import type { I18nLocale } from "~/types/others";
import { COUNTRIES } from "~/utils/const";
import { components } from "~/weaverse/components";
import { themeSchema } from "~/weaverse/schema.server";

const additionalContext = {
    // Additional context for custom properties, CMS clients, 3P SDKs, etc.
} as const;

type AdditionalContextType = typeof additionalContext;

declare global {
    interface HydrogenAdditionalContext extends AdditionalContextType {}
}

/**
 * Creates the Hydrogen router context for both Oxygen and Netlify runtimes.
 * ExecutionContext is optional to support Netlify Edge Functions which handle
 * waitUntil differently.
 *
 * @param request - The incoming HTTP request
 * @param env - Environment variables
 * @param executionContext - Optional Cloudflare-style execution context (Oxygen)
 */
export async function createHydrogenRouterContext(
    request: Request,
    env: Env,
    executionContext?: ExecutionContext,
) {
    if (!env?.SESSION_SECRET) {
        throw new Error("SESSION_SECRET environment variable is not set");
    }

    if (!env?.WEAVERSE_PROJECT_ID) {
        throw new Error("WEAVERSE_PROJECT_ID environment variable is not set");
    }

    // waitUntil is optional - Netlify handles background work differently
    const waitUntil =
        executionContext?.waitUntil?.bind(executionContext) ??
        (() => {
            /* no-op fallback for non-Oxygen runtimes */
        });

    // Cache API may not be available in all runtimes
    const cache =
        typeof caches !== "undefined"
            ? await caches.open("hydrogen")
            : undefined;

    const session = await AppSession.init(request, [env.SESSION_SECRET]);

    const i18n = getLocaleFromRequest(request);

    /**
     * Custom cart ID handling to fix stale cart data during same-request revalidation.
     *
     * THE PROBLEM:
     * When a cart mutation happens (add/remove/update), React Router revalidates
     * loaders in the SAME request cycle. The default `cartGetIdDefault` reads from
     * REQUEST cookies, which are unchanged until the browser processes Set-Cookie
     * headers. This causes `cart.get()` to fetch the OLD cart.
     *
     * THE SOLUTION:
     * 1. Custom `setId`: Writes cart ID to SESSION (in-memory) AND returns Set-Cookie headers
     * 2. Custom `getId`: Reads from SESSION first (for same-request), falls back to cookies
     *
     * This ensures cart.get() always uses the most recent cart ID after mutations.
     */
    const cookieCartId = cartGetIdDefault(request.headers);
    const defaultSetCartId = cartSetIdDefault();

    // Track cart ID in memory for same-request access.
    // This avoids stale cookie reads during same-request revalidation.
    let inMemoryCartId: string | undefined;

    const getCartId = () => {
        // In-memory cart ID takes precedence (set by mutations in current request)
        if (inMemoryCartId) {
            if (import.meta.env.DEV) {
                console.debug(
                    "[Cart] Using in-memory cart ID:",
                    inMemoryCartId,
                );
            }
            return inMemoryCartId;
        }
        // Fall back to cookie cart ID (for initial page loads)
        const id = cookieCartId();
        if (import.meta.env.DEV && id) {
            console.debug("[Cart] Using cookie cart ID:", id);
        }
        return id;
    };

    const setCartId = (cartId: string) => {
        // Defensive: extract the last segment as the short ID
        const shortId = cartId.split("/").pop() || "";
        if (!shortId) {
            console.warn("[Cart] setCartId received malformed ID:", cartId);
        }
        // Store in memory for same-request revalidation
        inMemoryCartId = cartId;
        // Return Set-Cookie headers for browser
        return defaultSetCartId(cartId);
    };

    const hydrogenContext = createHydrogenContext(
        {
            env,
            request,
            cache,
            waitUntil,
            session,
            i18n,
            cart: {
                queryFragment: CART_QUERY_FRAGMENT,
                mutateFragment: CART_MUTATE_FRAGMENT,
                getId: getCartId,
                setId: setCartId,
            },
        },
        additionalContext,
    );

    const weaverse = new WeaverseClient({
        ...hydrogenContext,
        env,
        request,
        cache,
        themeSchema,
        components,
    });

    // Add weaverse directly to the hydrogenContext instance
    // This preserves the RouterContextProvider class instance
    Object.assign(hydrogenContext, { weaverse });

    if (!hydrogenContext.storefront) {
        console.error("[Context] Storefront missing in context!");
        throw new Error("No storefront context found");
    }

    return hydrogenContext as typeof hydrogenContext & {
        weaverse: WeaverseClient;
    };
}

class AppSession implements HydrogenSession {
    isPending = false;
    readonly #sessionStorage: SessionStorage;
    readonly #session: Session;

    constructor(sessionStorage: SessionStorage, session: Session) {
        this.#sessionStorage = sessionStorage;
        this.#session = session;
    }

    static async init(request: Request, secrets: string[]) {
        const storage = createCookieSessionStorage({
            cookie: {
                name: "session",
                httpOnly: true,
                path: "/",
                sameSite: "lax",
                secrets,
            },
        });

        const session = await storage
            .getSession(request.headers.get("Cookie"))
            .catch(() => storage.getSession());

        return new AppSession(storage, session);
    }

    get has() {
        return this.#session.has;
    }

    get get() {
        return this.#session.get;
    }

    get flash() {
        return this.#session.flash;
    }

    get unset() {
        this.isPending = true;
        return this.#session.unset;
    }

    get set() {
        this.isPending = true;
        return this.#session.set;
    }

    destroy() {
        return this.#sessionStorage.destroySession(this.#session);
    }

    commit() {
        this.isPending = false;
        return this.#sessionStorage.commitSession(this.#session);
    }
}

function getLocaleFromRequest(request: Request): I18nLocale {
    const url = new URL(request.url);
    let firstPathPart = `/${url.pathname.substring(1).split("/")[0].toLowerCase()}`;
    firstPathPart = firstPathPart.replace(".data", "");

    return COUNTRIES[firstPathPart]
        ? {
              ...COUNTRIES[firstPathPart],
              pathPrefix: firstPathPart,
          }
        : {
              ...COUNTRIES.default,
              pathPrefix: "",
          };
}
