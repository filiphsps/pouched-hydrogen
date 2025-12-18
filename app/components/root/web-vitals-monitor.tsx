/** biome-ignore-all lint/suspicious/noConsole: use console.debug for debugging */
import { useAnalytics } from "@shopify/hydrogen";
import { useEffect, useRef } from "react";
import { useWebVitals } from "~/hooks/use-web-vitals";

/**
 * Props for the WebVitalsMonitor component.
 */
export interface WebVitalsMonitorProps {
    /** Enable debug logging to console (default: false) */
    debug?: boolean;
    /** Send metrics to GTM dataLayer (default: true when GTM is configured) */
    sendToAnalytics?: boolean;
}

/**
 * Web Vitals monitoring component.
 *
 * This component initializes Core Web Vitals monitoring and integrates with:
 * - Google Tag Manager dataLayer for analytics
 * - Console logging for debugging
 * - Shopify Analytics consent tracking
 *
 * Core Web Vitals measured:
 * - **LCP (Largest Contentful Paint)**: Measures loading performance
 *   - Good: ≤ 2.5s | Needs Improvement: ≤ 4s | Poor: > 4s
 * - **INP (Interaction to Next Paint)**: Measures interactivity
 *   - Good: ≤ 200ms | Needs Improvement: ≤ 500ms | Poor: > 500ms
 * - **CLS (Cumulative Layout Shift)**: Measures visual stability
 *   - Good: ≤ 0.1 | Needs Improvement: ≤ 0.25 | Poor: > 0.25
 *
 * Additional metrics:
 * - **FCP (First Contentful Paint)**: Time to first content render
 * - **TTFB (Time to First Byte)**: Server response time
 *
 * @example
 * ```tsx
 * // In your root layout
 * <WebVitalsMonitor debug={process.env.NODE_ENV === 'development'} />
 * ```
 */
export function WebVitalsMonitor({
    debug = false,
    sendToAnalytics = true,
}: WebVitalsMonitorProps) {
    const { canTrack } = useAnalytics();
    const hasLoggedSummary = useRef(false);

    // Check if analytics tracking is allowed (respects cookie consent)
    const isTrackingAllowed = canTrack();

    const { report, isPassing, summary } = useWebVitals({
        enabled: true,
        sendToAnalytics: sendToAnalytics && isTrackingAllowed,
        debug,
        reportOnUnload: isTrackingAllowed,
    });

    // Log summary when all Core Web Vitals are collected (debug mode only)
    useEffect(() => {
        if (!debug || hasLoggedSummary.current) {
            return;
        }

        // Check if we have all three Core Web Vitals
        const hasCoreMetrics = report.LCP && report.INP && report.CLS;

        if (hasCoreMetrics) {
            hasLoggedSummary.current = true;

            const statusColor = isPassing ? "color: #0cce6b" : "color: #ff4e42";
            const statusEmoji = isPassing ? "✅" : "⚠️";

            console.debug(
                `%c[Web Vitals] ${statusEmoji} Core Web Vitals Summary`,
                "font-weight: bold; font-size: 14px",
            );
            console.debug(
                `%cOverall Status: ${summary.overall.toUpperCase()}`,
                statusColor,
            );
            console.debug("Metrics:", {
                LCP: report.LCP?.formattedValue,
                INP: report.INP?.formattedValue,
                CLS: report.CLS?.formattedValue,
                FCP: report.FCP?.formattedValue,
                TTFB: report.TTFB?.formattedValue,
            });

            // Log recommendations if not passing
            if (!isPassing) {
                console.debug("[Web Vitals] Recommendations:");
                if (report.LCP?.rating !== "good") {
                    console.debug(
                        "  - LCP: Optimize hero images, use preload for critical images, reduce server response time",
                    );
                }
                if (report.INP?.rating !== "good") {
                    console.debug(
                        "  - INP: Reduce JavaScript execution time, optimize event handlers, use debouncing",
                    );
                }
                if (report.CLS?.rating !== "good") {
                    console.debug(
                        "  - CLS: Set explicit width/height on images, avoid inserting content above existing content",
                    );
                }
            }
        }
    }, [debug, report, isPassing, summary]);

    // This component doesn't render anything visible
    return null;
}
