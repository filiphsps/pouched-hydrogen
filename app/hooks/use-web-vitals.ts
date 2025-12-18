import { useCallback, useEffect, useRef, useState } from "react";
import type {
    MetricHandlerOptions,
    WebVitalMetric,
    WebVitalsReport,
} from "~/utils/web-vitals";
import {
    createMetricHandler,
    getWebVitalsSummary,
    isPassingCoreWebVitals,
} from "~/utils/web-vitals";

/**
 * Options for the useWebVitals hook.
 */
export interface UseWebVitalsOptions extends MetricHandlerOptions {
    /** Enable or disable monitoring (default: true in browser, false on server) */
    enabled?: boolean;
    /** Report all metrics on page unload */
    reportOnUnload?: boolean;
}

/**
 * Return type for the useWebVitals hook.
 */
export interface UseWebVitalsReturn {
    /** Current Core Web Vitals report */
    report: WebVitalsReport;
    /** Whether all Core Web Vitals meet "good" thresholds */
    isPassing: boolean;
    /** Summary of all metrics with overall rating */
    summary: ReturnType<typeof getWebVitalsSummary>;
    /** Whether metrics are still being collected */
    isCollecting: boolean;
}

/**
 * React hook for monitoring Core Web Vitals.
 *
 * This hook initializes the web-vitals library and collects metrics as they become available.
 * It provides real-time access to CLS, INP, LCP, FCP, and TTFB metrics.
 *
 * @example
 * ```tsx
 * function PerformanceMonitor() {
 *   const { report, isPassing, summary } = useWebVitals({
 *     sendToAnalytics: true,
 *     debug: process.env.NODE_ENV === 'development'
 *   });
 *
 *   return (
 *     <div>
 *       <p>CWV Status: {isPassing ? 'Passing' : 'Needs Work'}</p>
 *       <p>LCP: {report.LCP?.formattedValue ?? 'Measuring...'}</p>
 *       <p>INP: {report.INP?.formattedValue ?? 'Measuring...'}</p>
 *       <p>CLS: {report.CLS?.formattedValue ?? 'Measuring...'}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @param options - Configuration options for the hook
 * @returns Object containing the current metrics report and helper functions
 */
export function useWebVitals(
    options: UseWebVitalsOptions = {},
): UseWebVitalsReturn {
    const {
        enabled = true,
        sendToAnalytics = false,
        debug = false,
        onMetric,
        reportOnUnload = false,
    } = options;

    const [report, setReport] = useState<WebVitalsReport>({});
    const [isCollecting, setIsCollecting] = useState(true);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    /**
     * Updates the report with a new metric value.
     */
    const updateReport = useCallback((metric: WebVitalMetric) => {
        setReport((prev) => ({
            ...prev,
            [metric.name]: metric,
            url:
                typeof window !== "undefined"
                    ? window.location.href
                    : undefined,
            timestamp: prev.timestamp ?? Date.now(),
        }));
    }, []);

    useEffect(() => {
        // Only run in browser and when enabled
        if (typeof window === "undefined" || !enabled) {
            setIsCollecting(false);
            return;
        }

        let mounted = true;

        /**
         * Initializes web-vitals monitoring.
         * Uses dynamic import for tree-shaking and to avoid SSR issues.
         */
        async function initWebVitals() {
            try {
                const { onCLS, onINP, onLCP, onFCP, onTTFB } = await import(
                    "web-vitals"
                );

                if (!mounted) {
                    return;
                }

                const handler = createMetricHandler(updateReport, {
                    sendToAnalytics,
                    debug,
                    onMetric,
                });

                // Initialize all metric collectors with reportAllChanges for real-time updates
                // CLS, INP, and LCP are Core Web Vitals
                // FCP and TTFB are supplementary metrics
                onCLS(handler, { reportAllChanges: true });
                onINP(handler, { reportAllChanges: true });
                onLCP(handler, { reportAllChanges: true });
                onFCP(handler, { reportAllChanges: true });
                onTTFB(handler, { reportAllChanges: true });

                // Set up unload reporter if requested
                if (reportOnUnload) {
                    const reportFinal = () => {
                        // Send final metrics on page unload using sendBeacon if available
                        if (navigator.sendBeacon && sendToAnalytics) {
                            const currentReport = report;
                            const beacon = JSON.stringify({
                                event: "web_vitals_final",
                                metrics: currentReport,
                            });
                            navigator.sendBeacon("/api/analytics", beacon);
                        }
                    };

                    window.addEventListener("pagehide", reportFinal);
                    unsubscribeRef.current = () => {
                        window.removeEventListener("pagehide", reportFinal);
                    };
                }
            } catch (error) {
                console.error("[Web Vitals] Failed to initialize:", error);
                setIsCollecting(false);
            }
        }

        initWebVitals();

        return () => {
            mounted = false;
            unsubscribeRef.current?.();
        };
    }, [
        enabled,
        sendToAnalytics,
        debug,
        onMetric,
        reportOnUnload,
        updateReport,
        report,
    ]);

    // Calculate derived values
    const isPassing = isPassingCoreWebVitals(report);
    const summary = getWebVitalsSummary(report);

    return {
        report,
        isPassing,
        summary,
        isCollecting,
    };
}
