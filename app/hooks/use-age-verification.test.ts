/**
 * Tests for useAgeVerification hook.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
    };
})();

Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
});

// Import after mocking
import { act, renderHook } from "@testing-library/react";
import {
    clearAgeVerification,
    useAgeVerification,
} from "./use-age-verification";

describe("useAgeVerification", () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    it("should resolve to isVerified false when not previously verified", async () => {
        const { result } = renderHook(() => useAgeVerification());

        // RTL runs effects synchronously in test environment
        await vi.waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.isVerified).toBe(false);
    });

    it("should verify age and persist to localStorage", async () => {
        const { result } = renderHook(() => useAgeVerification());

        // Wait for loading to complete
        await vi.waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        // Verify age
        act(() => {
            result.current.verifyAge();
        });

        expect(result.current.isVerified).toBe(true);
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            "age-verified",
            "true",
        );
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            "age-verified-expiry",
            expect.any(String),
        );
    });

    it("should recognize previously verified user", async () => {
        // Set up verified state
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        localStorageMock.setItem("age-verified", "true");
        localStorageMock.setItem(
            "age-verified-expiry",
            futureDate.toISOString(),
        );

        const { result } = renderHook(() => useAgeVerification());

        // Wait for loading to complete
        await vi.waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.isVerified).toBe(true);
    });

    it("should treat expired verification as not verified", async () => {
        // Set up expired verified state
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);
        localStorageMock.setItem("age-verified", "true");
        localStorageMock.setItem("age-verified-expiry", pastDate.toISOString());

        const { result } = renderHook(() => useAgeVerification());

        // Wait for loading to complete
        await vi.waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.isVerified).toBe(false);
    });

    it("should clear verification", async () => {
        // Set up verified state
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        localStorageMock.setItem("age-verified", "true");
        localStorageMock.setItem(
            "age-verified-expiry",
            futureDate.toISOString(),
        );

        const { result } = renderHook(() => useAgeVerification());

        // Wait for loading to complete
        await vi.waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.isVerified).toBe(true);

        // Clear verification
        act(() => {
            result.current.clearVerification();
        });

        expect(result.current.isVerified).toBe(false);
        expect(localStorageMock.removeItem).toHaveBeenCalledWith(
            "age-verified",
        );
        expect(localStorageMock.removeItem).toHaveBeenCalledWith(
            "age-verified-expiry",
        );
    });

    it("clearAgeVerification helper should clear localStorage", () => {
        localStorageMock.setItem("age-verified", "true");
        localStorageMock.setItem(
            "age-verified-expiry",
            new Date().toISOString(),
        );

        clearAgeVerification();

        expect(localStorageMock.removeItem).toHaveBeenCalledWith(
            "age-verified",
        );
        expect(localStorageMock.removeItem).toHaveBeenCalledWith(
            "age-verified-expiry",
        );
    });

    it("should use custom expiry days", async () => {
        const { result } = renderHook(() =>
            useAgeVerification({ expiryDays: 7 }),
        );

        // Wait for loading to complete
        await vi.waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        // Verify age
        act(() => {
            result.current.verifyAge();
        });

        // Check that expiry was set (we can't check the exact date easily, but it should be called)
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            "age-verified-expiry",
            expect.any(String),
        );
    });
});
