/**
 * Tests for FreeShippingProgress component utility functions.
 */
import { describe, expect, it } from "vitest";
import {
    formatCurrency,
    normalizeCurrencyCode,
} from "./free-shipping-progress";

/**
 * Note: The main FreeShippingProgress component requires Weaverse context
 * and i18n, so we test the utility functions independently here.
 * Component integration is tested via E2E tests.
 */

/**
 * Calculate progress percentage toward free shipping threshold.
 * Extracted logic for testing (not exported from component).
 */
function calculateProgress(currentAmount: number, threshold: number): number {
    if (threshold <= 0) return 100;
    const progress = (currentAmount / threshold) * 100;
    return Math.min(progress, 100);
}

describe("FreeShippingProgress utilities", () => {
    describe("calculateProgress", () => {
        it("should return 0% when cart is empty", () => {
            expect(calculateProgress(0, 75)).toBe(0);
        });

        it("should return correct percentage when below threshold", () => {
            expect(calculateProgress(25, 75)).toBeCloseTo(33.33, 1);
            expect(calculateProgress(50, 75)).toBeCloseTo(66.67, 1);
        });

        it("should return 100% when at threshold", () => {
            expect(calculateProgress(75, 75)).toBe(100);
        });

        it("should cap at 100% when above threshold", () => {
            expect(calculateProgress(100, 75)).toBe(100);
            expect(calculateProgress(200, 75)).toBe(100);
        });

        it("should return 100% when threshold is 0", () => {
            expect(calculateProgress(50, 0)).toBe(100);
        });

        it("should return 100% when threshold is negative", () => {
            expect(calculateProgress(50, -10)).toBe(100);
        });
    });

    describe("normalizeCurrencyCode", () => {
        it("should return valid ISO codes unchanged", () => {
            expect(normalizeCurrencyCode("EUR")).toBe("EUR");
            expect(normalizeCurrencyCode("USD")).toBe("USD");
            expect(normalizeCurrencyCode("GBP")).toBe("GBP");
            expect(normalizeCurrencyCode("SEK")).toBe("SEK");
            expect(normalizeCurrencyCode("CHF")).toBe("CHF");
        });

        it("should convert € symbol to EUR", () => {
            expect(normalizeCurrencyCode("€")).toBe("EUR");
        });

        it("should convert $ symbol to USD", () => {
            expect(normalizeCurrencyCode("$")).toBe("USD");
        });

        it("should convert £ symbol to GBP", () => {
            expect(normalizeCurrencyCode("£")).toBe("GBP");
        });

        it("should convert kr symbol to SEK", () => {
            expect(normalizeCurrencyCode("kr")).toBe("SEK");
        });

        it("should return EUR as fallback for unknown values", () => {
            expect(normalizeCurrencyCode("¥")).toBe("EUR");
            expect(normalizeCurrencyCode("unknown")).toBe("EUR");
            expect(normalizeCurrencyCode("")).toBe("EUR");
        });

        it("should not match lowercase ISO codes", () => {
            // Lowercase codes should fall back to EUR since regex requires uppercase
            expect(normalizeCurrencyCode("eur")).toBe("EUR");
            expect(normalizeCurrencyCode("usd")).toBe("EUR");
        });
    });

    describe("formatCurrency", () => {
        it("should format EUR with German locale", () => {
            const formatted = formatCurrency(75, "EUR", "de-DE");
            // German uses comma as decimal separator and € symbol
            expect(formatted).toContain("€");
            expect(formatted).toContain("75");
        });

        it("should format USD with US locale", () => {
            const formatted = formatCurrency(75, "USD", "en-US");
            expect(formatted).toContain("$");
            expect(formatted).toContain("75");
        });

        it("should handle decimal amounts", () => {
            const formatted = formatCurrency(74.5, "EUR", "de-DE");
            expect(formatted).toContain("€");
        });

        it("should handle zero amount", () => {
            const formatted = formatCurrency(0, "EUR", "de-DE");
            expect(formatted).toContain("€");
            expect(formatted).toContain("0");
        });

        it("should normalize € symbol to EUR before formatting", () => {
            const formatted = formatCurrency(50, "€", "de-DE");
            expect(formatted).toContain("€");
            expect(formatted).toContain("50");
        });

        it("should normalize $ symbol to USD before formatting", () => {
            const formatted = formatCurrency(50, "$", "en-US");
            expect(formatted).toContain("$");
            expect(formatted).toContain("50");
        });

        it("should normalize £ symbol to GBP before formatting", () => {
            const formatted = formatCurrency(50, "£", "en-GB");
            expect(formatted).toContain("£");
            expect(formatted).toContain("50");
        });

        it("should format GBP correctly", () => {
            const formatted = formatCurrency(75, "GBP", "en-GB");
            expect(formatted).toContain("£");
            expect(formatted).toContain("75");
        });

        it("should format SEK correctly", () => {
            const formatted = formatCurrency(750, "SEK", "sv-SE");
            expect(formatted).toContain("kr");
            expect(formatted).toContain("750");
        });

        it("should format CHF correctly", () => {
            const formatted = formatCurrency(75, "CHF", "de-CH");
            expect(formatted).toContain("CHF");
            expect(formatted).toContain("75");
        });

        it("should fallback to EUR for unknown currency symbols", () => {
            // Unknown symbol should be normalized to EUR
            const formatted = formatCurrency(50, "¥", "de-DE");
            expect(formatted).toContain("€");
            expect(formatted).toContain("50");
        });
    });
});
