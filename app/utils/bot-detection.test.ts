/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { isBot, isBotRequest } from "./bot-detection";

describe("bot-detection", () => {
    describe("isBot", () => {
        describe("returns true for search engine crawlers", () => {
            it.each([
                [
                    "Googlebot",
                    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
                ],
                [
                    "Bingbot",
                    "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
                ],
                [
                    "Yahoo! Slurp",
                    "Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)",
                ],
                [
                    "Baiduspider",
                    "Baiduspider+(+http://www.baidu.com/search/spider.htm)",
                ],
                [
                    "YandexBot",
                    "Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)",
                ],
                [
                    "DuckDuckBot",
                    "DuckDuckBot/1.0; (+http://duckduckgo.com/duckduckbot.html)",
                ],
            ])("detects %s", (_name, userAgent) => {
                expect(isBot(userAgent)).toBe(true);
            });
        });

        describe("returns true for social media crawlers", () => {
            it.each([
                [
                    "Facebook",
                    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
                ],
                ["Twitter", "Twitterbot/1.0"],
                [
                    "LinkedIn",
                    "LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)",
                ],
                ["Pinterest", "Pinterest/0.2 (+http://www.pinterest.com/)"],
                [
                    "Slack",
                    "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
                ],
                ["Telegram", "TelegramBot (like TwitterBot)"],
                ["WhatsApp", "WhatsApp/2.19.81 A"],
                ["Discord", "Discordbot/2.0"],
            ])("detects %s bot", (_name, userAgent) => {
                expect(isBot(userAgent)).toBe(true);
            });
        });

        describe("returns true for SEO/monitoring tools", () => {
            it.each([
                [
                    "SEMrush",
                    "Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)",
                ],
                [
                    "Ahrefs",
                    "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)",
                ],
                [
                    "Lighthouse",
                    "Mozilla/5.0 (Linux; Android 6.0.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Mobile Safari/537.36 Chrome-Lighthouse",
                ],
            ])("detects %s", (_name, userAgent) => {
                expect(isBot(userAgent)).toBe(true);
            });
        });

        describe("returns false for regular browsers", () => {
            it.each([
                [
                    "Chrome on Windows",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                ],
                [
                    "Firefox on macOS",
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
                ],
                [
                    "Safari on iOS",
                    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
                ],
                [
                    "Edge on Windows",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
                ],
                [
                    "Chrome on Android",
                    "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.43 Mobile Safari/537.36",
                ],
            ])("returns false for %s", (_name, userAgent) => {
                expect(isBot(userAgent)).toBe(false);
            });
        });

        describe("handles edge cases", () => {
            it("returns false for null", () => {
                expect(isBot(null)).toBe(false);
            });

            it("returns false for undefined", () => {
                expect(isBot(undefined)).toBe(false);
            });

            it("returns false for empty string", () => {
                expect(isBot("")).toBe(false);
            });
        });
    });

    describe("isBotRequest", () => {
        it("extracts User-Agent from request and detects bot", () => {
            const request = new Request("https://example.com", {
                headers: {
                    "user-agent":
                        "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
                },
            });

            expect(isBotRequest(request)).toBe(true);
        });

        it("extracts User-Agent from request and detects regular browser", () => {
            const request = new Request("https://example.com", {
                headers: {
                    "user-agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                },
            });

            expect(isBotRequest(request)).toBe(false);
        });

        it("returns false when User-Agent header is missing", () => {
            const request = new Request("https://example.com");

            expect(isBotRequest(request)).toBe(false);
        });
    });
});
