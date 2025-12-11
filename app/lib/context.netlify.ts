/**
 * Netlify-specific context provider for Hydrogen.
 * Creates the app load context for Netlify Edge Functions.
 *
 * @see https://github.com/netlify/hydrogen-template/blob/main/app/lib/context.ts
 */
import {
    createHydrogenContext,
    type HydrogenContext,
    type HydrogenSession,
    InMemoryCache,
} from "@shopify/hydrogen";
import { WeaverseClient } from "@weaverse/hydrogen";
import {
    createCookieSessionStorage,
    type Session,
    type SessionStorage,
} from "react-router";
import { CART_QUERY_FRAGMENT } from "~/graphql/fragments";
import type { I18nLocale } from "~/types/others";
import { COUNTRIES } from "~/utils/const";
import { components } from "~/weaverse/components";
import { themeSchema } from "~/weaverse/schema.server";

/**
 * Creates the app load context for Netlify Edge Functions.
 * This is called by `createHydrogenAppLoadContext` from the edge adapter.
 */
export async function createAppLoadContext(
    request: Request,
    env: Record<string, string>,
    executionContext: ExecutionContext,
): Promise<HydrogenContext & { weaverse: WeaverseClient }> {
    const typedEnv = env as unknown as Env;

    if (!typedEnv?.SESSION_SECRET) {
        throw new Error("SESSION_SECRET environment variable is not set");
    }

    if (!typedEnv?.WEAVERSE_PROJECT_ID) {
        throw new Error("WEAVERSE_PROJECT_ID environment variable is not set");
    }

    const session = await NetlifySession.init(request, [
        typedEnv.SESSION_SECRET,
    ]);
    const i18n = getLocaleFromRequest(request);

    const hydrogenContext = createHydrogenContext({
        env: typedEnv,
        request,
        cache: new InMemoryCache(),
        waitUntil: executionContext.waitUntil.bind(executionContext),
        session,
        i18n,
        cart: { queryFragment: CART_QUERY_FRAGMENT },
    });

    const weaverse = new WeaverseClient({
        ...hydrogenContext,
        env: typedEnv,
        request,
        cache: new InMemoryCache(),
        themeSchema,
        components,
    });

    return {
        ...hydrogenContext,
        weaverse,
    };
}

/**
 * Session implementation for Netlify Edge Functions.
 */
class NetlifySession implements HydrogenSession {
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

        return new NetlifySession(storage, session);
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

/**
 * Extracts locale information from the request URL path.
 */
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
