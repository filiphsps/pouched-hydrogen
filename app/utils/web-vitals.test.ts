import { describe, expect, it } from "vitest";
import {
    formatMetricValue,
    getMetricRating,
    getWebVitalsSummary,
    isPassingCoreWebVitals,
    METRIC_THRESHOLDS,
    transformMetric,
} from "./web-vitals";

describe("web-vitals utilities", () => {
    describe("METRIC_THRESHOLDS", () => {
        it("should have correct thresholds for CLS", () => {
            expect(METRIC_THRESHOLDS.CLS).toEqual({
                good: 0.1,
                needsImprovement: 0.25,
            });
        });

        it("should have correct thresholds for INP", () => {
            expect(METRIC_THRESHOLDS.INP).toEqual({
                good: 200,
                needsImprovement: 500,
            });
        });

        it("should have correct thresholds for LCP", () => {
            expect(METRIC_THRESHOLDS.LCP).toEqual({
                good: 2500,
                needsImprovement: 4000,
            });
        });

        it("should have correct thresholds for FCP", () => {
            expect(METRIC_THRESHOLDS.FCP).toEqual({
                good: 1800,
                needsImprovement: 3000,
            });
        });

        it("should have correct thresholds for TTFB", () => {
            expect(METRIC_THRESHOLDS.TTFB).toEqual({
                good: 800,
                needsImprovement: 1800,
            });
        });
    });

    describe("formatMetricValue", () => {
        it("should format CLS values with 3 decimal places", () => {
            expect(formatMetricValue("CLS", 0.05)).toBe("0.050");
            expect(formatMetricValue("CLS", 0.123)).toBe("0.123");
            expect(formatMetricValue("CLS", 0.1)).toBe("0.100");
        });

        it("should format time metrics under 1s in milliseconds", () => {
            expect(formatMetricValue("LCP", 500)).toBe("500ms");
            expect(formatMetricValue("INP", 100)).toBe("100ms");
            expect(formatMetricValue("FCP", 999)).toBe("999ms");
            expect(formatMetricValue("TTFB", 200)).toBe("200ms");
        });

        it("should format time metrics over 1s in seconds", () => {
            expect(formatMetricValue("LCP", 2500)).toBe("2.50s");
            expect(formatMetricValue("LCP", 1000)).toBe("1.00s");
            expect(formatMetricValue("FCP", 3456)).toBe("3.46s");
        });
    });

    describe("getMetricRating", () => {
        describe("CLS ratings", () => {
            it("should return good for values <= 0.1", () => {
                expect(getMetricRating("CLS", 0.05)).toBe("good");
                expect(getMetricRating("CLS", 0.1)).toBe("good");
            });

            it("should return needs-improvement for values > 0.1 and <= 0.25", () => {
                expect(getMetricRating("CLS", 0.15)).toBe("needs-improvement");
                expect(getMetricRating("CLS", 0.25)).toBe("needs-improvement");
            });

            it("should return poor for values > 0.25", () => {
                expect(getMetricRating("CLS", 0.3)).toBe("poor");
                expect(getMetricRating("CLS", 1)).toBe("poor");
            });
        });

        describe("INP ratings", () => {
            it("should return good for values <= 200ms", () => {
                expect(getMetricRating("INP", 100)).toBe("good");
                expect(getMetricRating("INP", 200)).toBe("good");
            });

            it("should return needs-improvement for values > 200ms and <= 500ms", () => {
                expect(getMetricRating("INP", 300)).toBe("needs-improvement");
                expect(getMetricRating("INP", 500)).toBe("needs-improvement");
            });

            it("should return poor for values > 500ms", () => {
                expect(getMetricRating("INP", 600)).toBe("poor");
            });
        });

        describe("LCP ratings", () => {
            it("should return good for values <= 2.5s", () => {
                expect(getMetricRating("LCP", 1500)).toBe("good");
                expect(getMetricRating("LCP", 2500)).toBe("good");
            });

            it("should return needs-improvement for values > 2.5s and <= 4s", () => {
                expect(getMetricRating("LCP", 3000)).toBe("needs-improvement");
                expect(getMetricRating("LCP", 4000)).toBe("needs-improvement");
            });

            it("should return poor for values > 4s", () => {
                expect(getMetricRating("LCP", 5000)).toBe("poor");
            });
        });
    });

    describe("transformMetric", () => {
        it("should transform a raw metric into extended format", () => {
            const rawMetric = {
                name: "LCP" as const,
                value: 2000,
                delta: 100,
                id: "test-id",
                navigationType: "navigate" as const,
                rating: "good" as const,
                entries: [],
            };

            const result = transformMetric(rawMetric);

            expect(result).toEqual({
                name: "LCP",
                value: 2000,
                rating: "good",
                navigationType: "navigate",
                id: "test-id",
                delta: 100,
                formattedValue: "2.00s",
                thresholds: { good: 2500, needsImprovement: 4000 },
            });
        });

        it("should calculate rating based on value, not raw rating", () => {
            const rawMetric = {
                name: "CLS" as const,
                value: 0.3,
                delta: 0.05,
                id: "test-id",
                navigationType: "navigate" as const,
                rating: "good" as const, // Raw rating might be wrong
                entries: [],
            };

            const result = transformMetric(rawMetric);
            expect(result.rating).toBe("poor"); // Should be poor based on value
        });
    });

    describe("isPassingCoreWebVitals", () => {
        it("should return true when all core metrics are good", () => {
            const report = {
                CLS: { name: "CLS", value: 0.05, rating: "good" },
                INP: { name: "INP", value: 100, rating: "good" },
                LCP: { name: "LCP", value: 2000, rating: "good" },
            } as Parameters<typeof isPassingCoreWebVitals>[0];

            expect(isPassingCoreWebVitals(report)).toBe(true);
        });

        it("should return false when any core metric is not good", () => {
            const reportWithPoorCLS = {
                CLS: { name: "CLS", value: 0.3, rating: "poor" },
                INP: { name: "INP", value: 100, rating: "good" },
                LCP: { name: "LCP", value: 2000, rating: "good" },
            } as Parameters<typeof isPassingCoreWebVitals>[0];

            expect(isPassingCoreWebVitals(reportWithPoorCLS)).toBe(false);
        });

        it("should return false when core metrics are missing", () => {
            const partialReport = {
                CLS: { name: "CLS", value: 0.05, rating: "good" },
            } as Parameters<typeof isPassingCoreWebVitals>[0];

            expect(isPassingCoreWebVitals(partialReport)).toBe(false);
        });
    });

    describe("getWebVitalsSummary", () => {
        it("should return good overall when all metrics are good", () => {
            const report = {
                CLS: {
                    name: "CLS",
                    value: 0.05,
                    rating: "good",
                    formattedValue: "0.050",
                },
                INP: {
                    name: "INP",
                    value: 100,
                    rating: "good",
                    formattedValue: "100ms",
                },
                LCP: {
                    name: "LCP",
                    value: 2000,
                    rating: "good",
                    formattedValue: "2.00s",
                },
                FCP: {
                    name: "FCP",
                    value: 1500,
                    rating: "good",
                    formattedValue: "1.50s",
                },
                TTFB: {
                    name: "TTFB",
                    value: 600,
                    rating: "good",
                    formattedValue: "600ms",
                },
            } as Parameters<typeof getWebVitalsSummary>[0];

            const summary = getWebVitalsSummary(report);

            expect(summary.overall).toBe("good");
            expect(summary.metrics.CLS?.rating).toBe("good");
            expect(summary.metrics.INP?.rating).toBe("good");
            expect(summary.metrics.LCP?.rating).toBe("good");
        });

        it("should return poor overall when any metric is poor", () => {
            const report = {
                CLS: {
                    name: "CLS",
                    value: 0.05,
                    rating: "good",
                    formattedValue: "0.050",
                },
                INP: {
                    name: "INP",
                    value: 600,
                    rating: "poor",
                    formattedValue: "600ms",
                },
                LCP: {
                    name: "LCP",
                    value: 2000,
                    rating: "good",
                    formattedValue: "2.00s",
                },
            } as Parameters<typeof getWebVitalsSummary>[0];

            const summary = getWebVitalsSummary(report);

            expect(summary.overall).toBe("poor");
        });

        it("should return needs-improvement when worst metric is needs-improvement", () => {
            const report = {
                CLS: {
                    name: "CLS",
                    value: 0.15,
                    rating: "needs-improvement",
                    formattedValue: "0.150",
                },
                INP: {
                    name: "INP",
                    value: 100,
                    rating: "good",
                    formattedValue: "100ms",
                },
                LCP: {
                    name: "LCP",
                    value: 2000,
                    rating: "good",
                    formattedValue: "2.00s",
                },
            } as Parameters<typeof getWebVitalsSummary>[0];

            const summary = getWebVitalsSummary(report);

            expect(summary.overall).toBe("needs-improvement");
        });

        it("should return null for missing metrics", () => {
            const report = {
                CLS: {
                    name: "CLS",
                    value: 0.05,
                    rating: "good",
                    formattedValue: "0.050",
                },
            } as Parameters<typeof getWebVitalsSummary>[0];

            const summary = getWebVitalsSummary(report);

            expect(summary.metrics.CLS).not.toBeNull();
            expect(summary.metrics.INP).toBeNull();
            expect(summary.metrics.LCP).toBeNull();
        });
    });
});
