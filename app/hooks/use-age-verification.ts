/**
 * Age verification hook for managing user age verification state.
 * Persists verification status in localStorage with configurable expiry.
 *
 * @example
 * ```tsx
 * const { isVerified, verifyAge } = useAgeVerification();
 *
 * if (!isVerified) {
 *   return <AgeVerificationGate onVerify={verifyAge} />;
 * }
 * ```
 */
import { useCallback, useEffect, useState } from "react";

const AGE_VERIFIED_KEY = "age-verified";
const AGE_VERIFIED_EXPIRY_KEY = "age-verified-expiry";

/** Default expiry in days for age verification persistence */
const DEFAULT_EXPIRY_DAYS = 30;

/**
 * Check if age verification is valid and not expired.
 * @returns {boolean} Whether the user has a valid age verification
 */
function isAgeVerificationValid(): boolean {
    if (typeof window === "undefined") {
        return false;
    }

    const verified = localStorage.getItem(AGE_VERIFIED_KEY);
    const expiry = localStorage.getItem(AGE_VERIFIED_EXPIRY_KEY);

    if (verified !== "true" || !expiry) {
        return false;
    }

    const expiryDate = new Date(expiry);
    return expiryDate > new Date();
}

/**
 * Set age verification with expiry.
 * @param {number} expiryDays - Number of days until verification expires
 */
function setAgeVerification(expiryDays: number = DEFAULT_EXPIRY_DAYS): void {
    if (typeof window === "undefined") {
        return;
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    localStorage.setItem(AGE_VERIFIED_KEY, "true");
    localStorage.setItem(AGE_VERIFIED_EXPIRY_KEY, expiryDate.toISOString());
}

/**
 * Clear age verification (for testing/debugging).
 */
export function clearAgeVerification(): void {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.removeItem(AGE_VERIFIED_KEY);
    localStorage.removeItem(AGE_VERIFIED_EXPIRY_KEY);
}

export interface UseAgeVerificationOptions {
    /** Number of days until verification expires (default: 30) */
    expiryDays?: number;
}

export interface UseAgeVerificationReturn {
    /** Whether the user has verified their age */
    isVerified: boolean;
    /** Whether the verification state is still loading */
    isLoading: boolean;
    /** Function to verify age */
    verifyAge: () => void;
    /** Function to clear verification (for testing) */
    clearVerification: () => void;
}

/**
 * Hook for managing age verification state.
 * Persists verification in localStorage for the specified expiry period.
 *
 * @param {UseAgeVerificationOptions} options - Configuration options
 * @returns {UseAgeVerificationReturn} Age verification state and actions
 */
export function useAgeVerification(
    options: UseAgeVerificationOptions = {},
): UseAgeVerificationReturn {
    const { expiryDays = DEFAULT_EXPIRY_DAYS } = options;

    // Start with loading state to prevent flash of age gate
    const [isLoading, setIsLoading] = useState(true);
    const [isVerified, setIsVerified] = useState(false);

    // Check verification on mount
    useEffect(() => {
        const verified = isAgeVerificationValid();
        setIsVerified(verified);
        setIsLoading(false);
    }, []);

    const verifyAge = useCallback(() => {
        setAgeVerification(expiryDays);
        setIsVerified(true);
    }, [expiryDays]);

    const clearVerification = useCallback(() => {
        clearAgeVerification();
        setIsVerified(false);
    }, []);

    return {
        isVerified,
        isLoading,
        verifyAge,
        clearVerification,
    };
}
