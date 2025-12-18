import type {
    CLSMetric,
    FCPMetric,
    INPMetric,
    LCPMetric,
    Metric,
    TTFBMetric,
} from "web-vitals";

/**
 * Core Web Vitals metric names.
 */
export type MetricName = "CLS" | "INP" | "LCP" | "FCP" | "TTFB";

/**
 * Rating classification for Core Web Vitals.
 */
export type MetricRating = "good" | "needs-improvement" | "poor";

/**
 * Extended metric data with additional context.
 */
export interface WebVitalMetric {
    /** Metric name */
    name: MetricName;
    /** Metric value */
    value: number;
    /** Rating based on Google's thresholds */
    rating: MetricRating;
    /** Navigation type (navigate, reload, back_forward, prerender) */
    navigationType?: string;
    /** Unique metric ID */
    id: string;
    /** Delta since last measurement (for cumulative metrics like CLS) */
    delta: number;
    /** Formatted value with unit */
    formattedValue: string;
    /** Target thresholds for this metric */
    thresholds: {
        good: number;
        needsImprovement: number;
    };
}

/**
 * Collected Core Web Vitals for a page session.
 */
export interface WebVitalsReport {
    /** Cumulative Layout Shift - measures visual stability */
    CLS?: WebVitalMetric;
    /** Interaction to Next Paint - measures interactivity responsiveness */
    INP?: WebVitalMetric;
    /** Largest Contentful Paint - measures loading performance */
    LCP?: WebVitalMetric;
    /** First Contentful Paint - measures initial render */
    FCP?: WebVitalMetric;
    /** Time to First Byte - measures server response time */
    TTFB?: WebVitalMetric;
    /** Page URL when metrics were collected */
    url?: string;
    /** Timestamp when metrics collection started */
    timestamp?: number;
}

/**
 * Google's Core Web Vitals thresholds for each metric.
 * @see https://web.dev/articles/vitals
 */
export const METRIC_THRESHOLDS: Record<
    MetricName,
    { good: number; needsImprovement: number }
> = {
    CLS: { good: 0.1, needsImprovement: 0.25 },
    INP: { good: 200, needsImprovement: 500 },
    LCP: { good: 2500, needsImprovement: 4000 },
    FCP: { good: 1800, needsImprovement: 3000 },
    TTFB: { good: 800, needsImprovement: 1800 },
};

/**
 * Formats a metric value with its appropriate unit.
 *
 * @param name - The metric name
 * @param value - The raw metric value
 * @returns Formatted string with unit (e.g., "2.5s" for LCP, "0.05" for CLS)
 */
export function formatMetricValue(name: MetricName, value: number): string {
    switch (name) {
        case "CLS":
            return value.toFixed(3);
        case "INP":
        case "LCP":
        case "FCP":
        case "TTFB":
            return value < 1000
                ? `${Math.round(value)}ms`
                : `${(value / 1000).toFixed(2)}s`;
        default:
            return String(value);
    }
}

/**
 * Determines the rating for a metric based on Google's thresholds.
 *
 * @param name - The metric name
 * @param value - The metric value
 * @returns Rating classification
 */
export function getMetricRating(name: MetricName, value: number): MetricRating {
    const thresholds = METRIC_THRESHOLDS[name];
    if (value <= thresholds.good) {
        return "good";
    }
    if (value <= thresholds.needsImprovement) {
        return "needs-improvement";
    }
    return "poor";
}

/**
 * Transforms a raw web-vitals metric into our extended format.
 *
 * @param metric - Raw metric from web-vitals library
 * @returns Extended WebVitalMetric with additional context
 */
export function transformMetric(
    metric: Metric | CLSMetric | INPMetric | LCPMetric | FCPMetric | TTFBMetric,
): WebVitalMetric {
    const name = metric.name as MetricName;
    const rating = getMetricRating(name, metric.value);

    return {
        name,
        value: metric.value,
        rating,
        navigationType: metric.navigationType,
        id: metric.id,
        delta: metric.delta,
        formattedValue: formatMetricValue(name, metric.value),
        thresholds: METRIC_THRESHOLDS[name],
    };
}

/**
 * Checks if all Core Web Vitals meet the "good" threshold.
 *
 * @param report - Collected web vitals report
 * @returns True if CLS, INP, and LCP are all "good"
 */
export function isPassingCoreWebVitals(report: WebVitalsReport): boolean {
    const coreMetrics: MetricName[] = ["CLS", "INP", "LCP"];
    return coreMetrics.every((name) => {
        const metric = report[name];
        return metric?.rating === "good";
    });
}

/**
 * Returns a summary of Core Web Vitals status.
 *
 * @param report - Collected web vitals report
 * @returns Summary object with overall status and individual metric statuses
 */
export function getWebVitalsSummary(report: WebVitalsReport): {
    overall: MetricRating;
    metrics: Record<
        MetricName,
        { value: number; rating: MetricRating; formatted: string } | null
    >;
} {
    const allMetrics: MetricName[] = ["CLS", "INP", "LCP", "FCP", "TTFB"];
    const metrics: Record<
        MetricName,
        { value: number; rating: MetricRating; formatted: string } | null
    > = {} as Record<
        MetricName,
        { value: number; rating: MetricRating; formatted: string } | null
    >;

    let worstRating: MetricRating = "good";

    for (const name of allMetrics) {
        const metric = report[name];
        if (metric) {
            metrics[name] = {
                value: metric.value,
                rating: metric.rating,
                formatted: metric.formattedValue,
            };

            if (metric.rating === "poor") {
                worstRating = "poor";
            } else if (
                metric.rating === "needs-improvement" &&
                worstRating !== "poor"
            ) {
                worstRating = "needs-improvement";
            }
        } else {
            metrics[name] = null;
        }
    }

    return {
        overall: worstRating,
        metrics,
    };
}

/**
 * Sends metric data to Google Tag Manager dataLayer.
 *
 * @param metric - The web vital metric to send
 */
export function sendToGTM(metric: WebVitalMetric): void {
    if (typeof window === "undefined" || !window.dataLayer) {
        return;
    }

    window.dataLayer.push({
        event: "web_vitals",
        web_vitals_metric_name: metric.name,
        web_vitals_metric_value: metric.value,
        web_vitals_metric_rating: metric.rating,
        web_vitals_metric_id: metric.id,
        web_vitals_metric_delta: metric.delta,
        web_vitals_navigation_type: metric.navigationType,
    });
}

/**
 * Logs metric data to console in a formatted way (for debugging).
 *
 * @param metric - The web vital metric to log
 */
export function logMetric(metric: WebVitalMetric): void {
    const ratingColors: Record<MetricRating, string> = {
        good: "color: #0cce6b",
        "needs-improvement": "color: #ffa400",
        poor: "color: #ff4e42",
    };

    console.debug(
        `%c[Web Vitals] ${metric.name}: ${metric.formattedValue} (${metric.rating})`,
        ratingColors[metric.rating],
        {
            value: metric.value,
            delta: metric.delta,
            id: metric.id,
            navigationType: metric.navigationType,
            thresholds: metric.thresholds,
        },
    );
}

/**
 * Options for the metric handler.
 */
export interface MetricHandlerOptions {
    /** Send metrics to GTM dataLayer */
    sendToAnalytics?: boolean;
    /** Log metrics to console */
    debug?: boolean;
    /** Custom callback for metric updates */
    onMetric?: (metric: WebVitalMetric) => void;
}

/**
 * Creates a metric handler function for the web-vitals library callbacks.
 *
 * @param updateReport - Function to update the metrics report
 * @param options - Handler options
 * @returns Handler function compatible with web-vitals callbacks
 */
export function createMetricHandler(
    updateReport: (metric: WebVitalMetric) => void,
    options: MetricHandlerOptions = {},
): (metric: Metric) => void {
    return (rawMetric: Metric) => {
        const metric = transformMetric(rawMetric);

        updateReport(metric);

        if (options.sendToAnalytics) {
            sendToGTM(metric);
        }

        if (options.debug) {
            logMetric(metric);
        }

        options.onMetric?.(metric);
    };
}

// Note: dataLayer type is declared in ~/utils/consent-mode.ts
