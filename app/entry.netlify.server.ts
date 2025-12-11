/**
 * Netlify Edge Function Entry
 *
 * This file adapts the Oxygen-style server export for Netlify Edge Functions.
 * It imports the unified server logic and exposes it as a default function export
 * which is what Netlify expects.
 */
import { Buffer } from "node:buffer";

if (!globalThis.Buffer) {
    globalThis.Buffer = Buffer;
}

if (!globalThis.setImmediate) {
    // @ts-expect-error - Typescript might complain about window/global mismatch
    globalThis.setImmediate = (
        // biome-ignore lint/nursery/noShadow: need to use args.
        callback: (...args: any[]) => void,
        ...args: any[]
    ) => {
        return setTimeout(callback, 0, ...args);
    };
}
if (!globalThis.clearImmediate) {
    globalThis.clearImmediate = (id: any) => {
        clearTimeout(id);
    };
}

import { buildEnvFromNetlify } from "~/lib/env.server";
import server from "../server";

/**
 * Netlify Edge Function Handler
 */
export default async function (request: Request, context: any) {
    // server.fetch expects (request, env, executionContext)

    // Build environment from Netlify globals
    const env = buildEnvFromNetlify();

    // We explicitly recreate a minimal ExecutionContext for waitUntil
    const executionContext = {
        waitUntil: (promise: Promise<any>) => {
            if (context.waitUntil) {
                context.waitUntil(promise);
            }
        },
        passThroughOnException: () => {
            // no-op for Netlify
        },
    } as unknown as ExecutionContext;

    return server.fetch(request, env, executionContext);
}

/**
 * Netlify Edge Function Configuration
 */
export const config = {
    path: "/*",
    excludedPath: [
        "/.netlify/*",
        "/assets/*",
        "/favicon.ico",
        "/robots.txt",
        "/sitemap.xml",
        "/manifest.json",
    ],
};
