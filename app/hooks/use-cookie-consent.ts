/**
 * Cookie consent hook for managing user consent preferences.
 * Persists consent state in localStorage and integrates with Google Consent Mode v2.
 *
 * @example
 * ```tsx
 * const {
 *   consent,
 *   hasConsented,
 *   isLoading,
 *   acceptAll,
 *   rejectAll,
 *   updateConsent,
 *   openPreferences,
 * } = useCookieConsent();
 *
 * if (!hasConsented && !isLoading) {
 *   return <CookieConsentBanner />;
 * }
 * ```
 */
import { useCallback, useEffect, useState } from "react";
import {
    type ConsentState,
    DEFAULT_CONSENT_STATE,
    DENIED_CONSENT_STATE,
    initConsentMode,
    pushConsentEvent,
    updateConsentMode,
} from "~/utils/consent-mode";

/** LocalStorage keys for consent persistence */
const CONSENT_KEY = "cookie-consent";
const CONSENT_EXPIRY_KEY = "cookie-consent-expiry";
const CONSENT_VERSION_KEY = "cookie-consent-version";

/** Current consent version - bump when consent requirements change */
const CURRENT_CONSENT_VERSION = 1;

/** Default expiry in days for consent persistence (1 year as recommended by GDPR) */
const DEFAULT_EXPIRY_DAYS = 365;

/**
 * Stored consent data structure.
 */
interface StoredConsent {
    state: ConsentState;
    timestamp: string;
    version: number;
}

/**
 * Check if stored consent is valid and not expired.
 */
function getStoredConsent(): StoredConsent | null {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        const stored = localStorage.getItem(CONSENT_KEY);
        const expiry = localStorage.getItem(CONSENT_EXPIRY_KEY);
        const version = localStorage.getItem(CONSENT_VERSION_KEY);

        if (!stored || !expiry) {
            return null;
        }

        // Check expiry
        const expiryDate = new Date(expiry);
        if (expiryDate <= new Date()) {
            clearStoredConsent();
            return null;
        }

        // Check version - if outdated, require new consent
        const storedVersion = Number(version);
        if (storedVersion !== CURRENT_CONSENT_VERSION) {
            clearStoredConsent();
            return null;
        }

        const parsed = JSON.parse(stored) as ConsentState;

        return {
            state: parsed,
            timestamp: expiry,
            version: storedVersion,
        };
    } catch {
        clearStoredConsent();
        return null;
    }
}

/**
 * Store consent with expiry.
 */
function storeConsent(
    consent: ConsentState,
    expiryDays: number = DEFAULT_EXPIRY_DAYS,
): void {
    if (typeof window === "undefined") {
        return;
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    localStorage.setItem(CONSENT_EXPIRY_KEY, expiryDate.toISOString());
    localStorage.setItem(
        CONSENT_VERSION_KEY,
        CURRENT_CONSENT_VERSION.toString(),
    );
}

/**
 * Clear stored consent (for testing or when user wants to reset).
 */
export function clearStoredConsent(): void {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.removeItem(CONSENT_KEY);
    localStorage.removeItem(CONSENT_EXPIRY_KEY);
    localStorage.removeItem(CONSENT_VERSION_KEY);
}

/**
 * Hook options.
 */
export interface UseCookieConsentOptions {
    /** Number of days until consent expires (default: 365) */
    expiryDays?: number;
    /** Whether to initialize Google Consent Mode (default: true) */
    enableGoogleConsent?: boolean;
}

/**
 * Hook return type.
 */
export interface UseCookieConsentReturn {
    /** Current consent state */
    consent: ConsentState;
    /** Whether user has made any consent choice */
    hasConsented: boolean;
    /** Whether consent state is still loading from localStorage */
    isLoading: boolean;
    /** Whether preferences panel is open */
    isPreferencesOpen: boolean;
    /** Accept all cookie categories */
    acceptAll: () => void;
    /** Reject all optional cookies (only essential allowed) */
    rejectAll: () => void;
    /** Update specific consent categories */
    updateConsent: (consent: ConsentState) => void;
    /** Open preferences panel */
    openPreferences: () => void;
    /** Close preferences panel */
    closePreferences: () => void;
    /** Clear consent (for testing) */
    clearConsent: () => void;
}

/**
 * Hook for managing cookie consent state.
 * Persists consent in localStorage and syncs with Google Consent Mode v2.
 *
 * @param options - Configuration options
 * @returns Consent state and control functions
 */
export function useCookieConsent(
    options: UseCookieConsentOptions = {},
): UseCookieConsentReturn {
    const { expiryDays = DEFAULT_EXPIRY_DAYS, enableGoogleConsent = true } =
        options;

    const [isLoading, setIsLoading] = useState(true);
    const [hasConsented, setHasConsented] = useState(false);
    const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT_STATE);
    const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

    // Initialize on mount
    useEffect(() => {
        // Initialize Google Consent Mode with defaults
        if (enableGoogleConsent) {
            initConsentMode();
        }

        // Load stored consent
        const stored = getStoredConsent();

        if (stored) {
            setConsent(stored.state);
            setHasConsented(true);

            // Update Google Consent Mode with stored preferences
            if (enableGoogleConsent) {
                updateConsentMode(stored.state);
            }
        }

        setIsLoading(false);
    }, [enableGoogleConsent]);

    /**
     * Internal function to save consent and update Google.
     */
    const saveConsent = useCallback(
        (newConsent: ConsentState) => {
            storeConsent(newConsent, expiryDays);
            setConsent(newConsent);
            setHasConsented(true);
            setIsPreferencesOpen(false);

            if (enableGoogleConsent) {
                updateConsentMode(newConsent);
                pushConsentEvent(newConsent);
            }
        },
        [expiryDays, enableGoogleConsent],
    );

    /**
     * Accept all cookie categories.
     */
    const acceptAll = useCallback(() => {
        saveConsent({
            analytics: true,
            marketing: true,
            functional: true,
        });
    }, [saveConsent]);

    /**
     * Reject all optional cookies.
     * Note: Essential cookies are always allowed and don't require consent.
     */
    const rejectAll = useCallback(() => {
        saveConsent(DENIED_CONSENT_STATE);
    }, [saveConsent]);

    /**
     * Update consent with custom selections.
     */
    const updateConsent = useCallback(
        (newConsent: ConsentState) => {
            saveConsent(newConsent);
        },
        [saveConsent],
    );

    /**
     * Open preferences panel.
     */
    const openPreferences = useCallback(() => {
        setIsPreferencesOpen(true);
    }, []);

    /**
     * Close preferences panel.
     */
    const closePreferences = useCallback(() => {
        setIsPreferencesOpen(false);
    }, []);

    /**
     * Clear consent (for testing/debugging).
     * Resets to default granted state since no-interaction = accept all.
     */
    const clearConsent = useCallback(() => {
        clearStoredConsent();
        setConsent(DEFAULT_CONSENT_STATE);
        setHasConsented(false);

        // Keep granted state when cleared since no-interaction = accept all
        if (enableGoogleConsent) {
            updateConsentMode(DEFAULT_CONSENT_STATE);
        }
    }, [enableGoogleConsent]);

    return {
        consent,
        hasConsented,
        isLoading,
        isPreferencesOpen,
        acceptAll,
        rejectAll,
        updateConsent,
        openPreferences,
        closePreferences,
        clearConsent,
    };
}
