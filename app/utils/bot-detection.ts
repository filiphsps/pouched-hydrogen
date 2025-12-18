/**
 * Bot Detection Utility.
 * Detects web crawlers and bots using the `isbot` library.
 *
 * Used to exclude compliance overlays (age verification, cookie consent) from
 * bot/crawler requests for better SEO - prevents indexing of modal content.
 *
 * @module utils/bot-detection
 * @see https://github.com/omrilotan/isbot
 */

import { isbot } from "isbot";

/**
 * Determines if a User-Agent string belongs to a known bot or crawler.
 *
 * Uses the `isbot` library which maintains a comprehensive and regularly
 * updated list of bot user agents including:
 * - Search engine crawlers (Google, Bing, Yahoo, Baidu, etc.)
 * - Social media crawlers (Facebook, Twitter, LinkedIn, etc.)
 * - SEO tools (Ahrefs, SEMrush, Moz, etc.)
 * - Monitoring tools (Pingdom, UptimeRobot, etc.)
 * - And many more...
 *
 * @param userAgent - The User-Agent header string from the request
 * @returns `true` if the User-Agent matches a known bot pattern, `false` otherwise
 *
 * @example
 * ```ts
 * isBot("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")
 * // => true
 *
 * isBot("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
 * // => false
 *
 * isBot(null)
 * // => false
 * ```
 */
export function isBot(userAgent: string | null | undefined): boolean {
    return isbot(userAgent);
}

/**
 * Extracts User-Agent from a Request object and checks if it's a bot.
 *
 * @param request - The incoming HTTP request
 * @returns `true` if the request is from a known bot, `false` otherwise
 *
 * @example
 * ```ts
 * // In a loader function
 * export async function loader({ request }: LoaderFunctionArgs) {
 *   const isBotReq = isBotRequest(request);
 *   // ...
 * }
 * ```
 */
export function isBotRequest(request: Request): boolean {
    const userAgent = request.headers.get("user-agent");
    return isBot(userAgent);
}
