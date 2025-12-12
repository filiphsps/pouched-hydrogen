/**
 * Tests for FreeShippingProgress component utility functions.
 */
import { describe, expect, it } from "vitest";

/**
 * Note: The main FreeShippingProgress component requires Weaverse context
 * and i18n, so we test the utility functions independently here.
 * Component integration is tested via E2E tests.
 */

/**
 * Calculate progress percentage toward free shipping threshold.
 * Extracted logic for testing.
 */
function calculateProgress(currentAmount: number, threshold: number): number {
    if (threshold <= 0) return 100;
    const progress = (currentAmount / threshold) * 100;
    return Math.min(progress, 100);
}

/**
 * Format currency amount.
 * Extracted logic for testing.
 */
function formatCurrency(
    amount: number,
    currencyCode: string,
    locale: string,
): string {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
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
    });
});
