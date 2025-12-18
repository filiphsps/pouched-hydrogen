/**
 * Google Consent Mode v2 utility functions.
 * Manages consent state for GDPR compliance and Google Tag Manager integration.
 *
 * @see https://developers.google.com/tag-platform/security/guides/consent
 * @see https://support.google.com/analytics/answer/9976101
 *
 * @example
 * ```ts
 * import { initConsentMode, updateConsentMode } from '~/utils/consent-mode';
 *
 * // Initialize with defaults (denied)
 * initConsentMode();
 *
 * // Update consent after user selection
 * updateConsentMode({
 *   analytics: true,
 *   marketing: false,
 *   functional: true,
 * });
 * ```
 */

/**
 * Cookie consent categories available to users.
 */
export type ConsentCategory = "analytics" | "marketing" | "functional";

/**
 * Consent state for all categories.
 */
export interface ConsentState {
    /** Analytics cookies (e.g., Google Analytics) */
    analytics: boolean;
    /** Marketing cookies (e.g., Google Ads, Facebook Pixel) */
    marketing: boolean;
    /** Functional cookies (e.g., preferences, language) */
    functional: boolean;
}

/**
 * Google Consent Mode v2 parameter mapping.
 * Maps our consent categories to Google's consent parameters.
 */
interface GoogleConsentParams {
    /** Required for Google Analytics */
    analytics_storage: "granted" | "denied";
    /** Required for Google Ads conversion tracking */
    ad_storage: "granted" | "denied";
    /** Required for personalized advertising */
    ad_user_data: "granted" | "denied";
    /** Required for personalization features */
    ad_personalization: "granted" | "denied";
    /** For preferences and functional features */
    functionality_storage: "granted" | "denied";
    /** For personalization without ads */
    personalization_storage: "granted" | "denied";
    /** For security features (always granted) */
    security_storage: "granted";
}

/**
 * Declare gtag on window for TypeScript.
 */
declare global {
    interface Window {
        dataLayer: unknown[];
        gtag: (...args: unknown[]) => void;
    }
}

/**
 * Default consent state - all denied for GDPR compliance.
 */
export const DEFAULT_CONSENT_STATE: ConsentState = {
    analytics: false,
    marketing: false,
    functional: false,
};

/**
 * Convert our consent state to Google Consent Mode v2 parameters.
 *
 * @param consent - Current consent state
 * @returns Google Consent Mode parameters
 */
export function mapConsentToGoogle(consent: ConsentState): GoogleConsentParams {
    return {
        // Analytics cookies
        analytics_storage: consent.analytics ? "granted" : "denied",

        // Marketing cookies - requires both marketing consent
        ad_storage: consent.marketing ? "granted" : "denied",
        ad_user_data: consent.marketing ? "granted" : "denied",
        ad_personalization: consent.marketing ? "granted" : "denied",

        // Functional cookies
        functionality_storage: consent.functional ? "granted" : "denied",
        personalization_storage: consent.functional ? "granted" : "denied",

        // Security is always granted as it's required for basic functionality
        security_storage: "granted",
    };
}

/**
 * Initialize Google Consent Mode v2 with default denied state.
 * Should be called as early as possible in the page lifecycle.
 *
 * @param waitForUpdate - Time in milliseconds to wait for consent update (default: 500)
 */
export function initConsentMode(waitForUpdate = 500): void {
    if (typeof window === "undefined") {
        return;
    }

    // Initialize dataLayer if not exists
    window.dataLayer = window.dataLayer || [];

    // Define gtag function if not exists
    if (!window.gtag) {
        window.gtag = function gtag() {
            // biome-ignore lint/complexity/noArguments: Required for Google's gtag implementation
            window.dataLayer.push(arguments);
        };
    }

    // Set default consent to denied
    const defaultParams = mapConsentToGoogle(DEFAULT_CONSENT_STATE);

    window.gtag("consent", "default", {
        ...defaultParams,
        wait_for_update: waitForUpdate,
    });
}

/**
 * Update Google Consent Mode v2 with user's consent choices.
 *
 * @param consent - User's consent state
 */
export function updateConsentMode(consent: ConsentState): void {
    if (typeof window === "undefined" || !window.gtag) {
        return;
    }

    const params = mapConsentToGoogle(consent);
    window.gtag("consent", "update", params);
}

/**
 * Push a consent event to the dataLayer for GTM.
 * Useful for triggering tags based on consent changes.
 *
 * @param consent - Current consent state
 */
export function pushConsentEvent(consent: ConsentState): void {
    if (typeof window === "undefined") {
        return;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: "consent_update",
        consent_analytics: consent.analytics,
        consent_marketing: consent.marketing,
        consent_functional: consent.functional,
    });
}

/**
 * Check if all consent categories are granted.
 *
 * @param consent - Consent state to check
 * @returns Whether all categories are granted
 */
export function hasFullConsent(consent: ConsentState): boolean {
    return consent.analytics && consent.marketing && consent.functional;
}

/**
 * Check if any consent category is granted.
 *
 * @param consent - Consent state to check
 * @returns Whether any category is granted
 */
export function hasAnyConsent(consent: ConsentState): boolean {
    return consent.analytics || consent.marketing || consent.functional;
}
