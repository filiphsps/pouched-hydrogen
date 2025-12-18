/**
 * Tests for Google Consent Mode v2 utility functions.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    DEFAULT_CONSENT_STATE,
    DENIED_CONSENT_STATE,
    hasAnyConsent,
    hasFullConsent,
    initConsentMode,
    mapConsentToGoogle,
    pushConsentEvent,
    updateConsentMode,
} from "./consent-mode";

// Mock window.gtag and dataLayer
const mockGtag = vi.fn();
let mockDataLayer: unknown[] = [];

describe("consent-mode", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockDataLayer = [];

        // Reset window mocks
        Object.defineProperty(window, "dataLayer", {
            value: mockDataLayer,
            writable: true,
            configurable: true,
        });

        Object.defineProperty(window, "gtag", {
            value: mockGtag,
            writable: true,
            configurable: true,
        });
    });

    describe("DEFAULT_CONSENT_STATE", () => {
        it("should have all consents granted by default (no interaction = accept all)", () => {
            expect(DEFAULT_CONSENT_STATE).toEqual({
                analytics: true,
                marketing: true,
                functional: true,
            });
        });
    });

    describe("DENIED_CONSENT_STATE", () => {
        it("should have all consents denied", () => {
            expect(DENIED_CONSENT_STATE).toEqual({
                analytics: false,
                marketing: false,
                functional: false,
            });
        });
    });

    describe("mapConsentToGoogle", () => {
        it("should map all denied consent correctly", () => {
            const result = mapConsentToGoogle({
                analytics: false,
                marketing: false,
                functional: false,
            });

            expect(result).toEqual({
                analytics_storage: "denied",
                ad_storage: "denied",
                ad_user_data: "denied",
                ad_personalization: "denied",
                functionality_storage: "denied",
                personalization_storage: "denied",
                security_storage: "granted",
            });
        });

        it("should map all granted consent correctly", () => {
            const result = mapConsentToGoogle({
                analytics: true,
                marketing: true,
                functional: true,
            });

            expect(result).toEqual({
                analytics_storage: "granted",
                ad_storage: "granted",
                ad_user_data: "granted",
                ad_personalization: "granted",
                functionality_storage: "granted",
                personalization_storage: "granted",
                security_storage: "granted",
            });
        });

        it("should map partial consent correctly", () => {
            const result = mapConsentToGoogle({
                analytics: true,
                marketing: false,
                functional: true,
            });

            expect(result).toEqual({
                analytics_storage: "granted",
                ad_storage: "denied",
                ad_user_data: "denied",
                ad_personalization: "denied",
                functionality_storage: "granted",
                personalization_storage: "granted",
                security_storage: "granted",
            });
        });

        it("should always grant security_storage", () => {
            const deniedResult = mapConsentToGoogle(DEFAULT_CONSENT_STATE);
            expect(deniedResult.security_storage).toBe("granted");

            const grantedResult = mapConsentToGoogle({
                analytics: true,
                marketing: true,
                functional: true,
            });
            expect(grantedResult.security_storage).toBe("granted");
        });
    });

    describe("initConsentMode", () => {
        it("should initialize dataLayer if not exists", () => {
            (window as any).dataLayer = undefined;
            (window as any).gtag = undefined;

            initConsentMode();

            expect(window.dataLayer).toBeDefined();
            expect(Array.isArray(window.dataLayer)).toBe(true);
        });

        it("should define gtag function if not exists", () => {
            (window as any).gtag = undefined;
            window.dataLayer = [];

            initConsentMode();

            expect(window.gtag).toBeDefined();
            expect(typeof window.gtag).toBe("function");
        });

        it("should call gtag with default granted consent (no interaction = accept all)", () => {
            window.gtag = mockGtag;
            window.dataLayer = [];

            initConsentMode();

            expect(mockGtag).toHaveBeenCalledWith("consent", "default", {
                analytics_storage: "granted",
                ad_storage: "granted",
                ad_user_data: "granted",
                ad_personalization: "granted",
                functionality_storage: "granted",
                personalization_storage: "granted",
                security_storage: "granted",
                wait_for_update: 500,
            });
        });

        it("should use custom wait_for_update value", () => {
            window.gtag = mockGtag;
            window.dataLayer = [];

            initConsentMode(1000);

            expect(mockGtag).toHaveBeenCalledWith(
                "consent",
                "default",
                expect.objectContaining({
                    wait_for_update: 1000,
                }),
            );
        });
    });

    describe("updateConsentMode", () => {
        it("should call gtag with consent update", () => {
            window.gtag = mockGtag;

            updateConsentMode({
                analytics: true,
                marketing: false,
                functional: true,
            });

            expect(mockGtag).toHaveBeenCalledWith("consent", "update", {
                analytics_storage: "granted",
                ad_storage: "denied",
                ad_user_data: "denied",
                ad_personalization: "denied",
                functionality_storage: "granted",
                personalization_storage: "granted",
                security_storage: "granted",
            });
        });

        it("should not throw if gtag is not defined", () => {
            (window as any).gtag = undefined;

            expect(() => {
                updateConsentMode({
                    analytics: true,
                    marketing: true,
                    functional: true,
                });
            }).not.toThrow();
        });
    });

    describe("pushConsentEvent", () => {
        it("should push consent event to dataLayer", () => {
            window.dataLayer = mockDataLayer;

            pushConsentEvent({
                analytics: true,
                marketing: false,
                functional: true,
            });

            expect(mockDataLayer).toContainEqual({
                event: "consent_update",
                consent_analytics: true,
                consent_marketing: false,
                consent_functional: true,
            });
        });

        it("should initialize dataLayer if not exists", () => {
            (window as any).dataLayer = undefined;

            pushConsentEvent({
                analytics: true,
                marketing: true,
                functional: true,
            });

            expect(window.dataLayer).toBeDefined();
            expect(Array.isArray(window.dataLayer)).toBe(true);
        });
    });

    describe("hasFullConsent", () => {
        it("should return true when all consents granted", () => {
            expect(
                hasFullConsent({
                    analytics: true,
                    marketing: true,
                    functional: true,
                }),
            ).toBe(true);
        });

        it("should return false when any consent denied", () => {
            expect(
                hasFullConsent({
                    analytics: true,
                    marketing: false,
                    functional: true,
                }),
            ).toBe(false);

            expect(
                hasFullConsent({
                    analytics: false,
                    marketing: true,
                    functional: true,
                }),
            ).toBe(false);

            expect(
                hasFullConsent({
                    analytics: true,
                    marketing: true,
                    functional: false,
                }),
            ).toBe(false);
        });

        it("should return false when all consents denied", () => {
            expect(hasFullConsent(DENIED_CONSENT_STATE)).toBe(false);
        });

        it("should return true for DEFAULT_CONSENT_STATE (all granted)", () => {
            expect(hasFullConsent(DEFAULT_CONSENT_STATE)).toBe(true);
        });
    });

    describe("hasAnyConsent", () => {
        it("should return true when any consent granted", () => {
            expect(
                hasAnyConsent({
                    analytics: true,
                    marketing: false,
                    functional: false,
                }),
            ).toBe(true);

            expect(
                hasAnyConsent({
                    analytics: false,
                    marketing: true,
                    functional: false,
                }),
            ).toBe(true);

            expect(
                hasAnyConsent({
                    analytics: false,
                    marketing: false,
                    functional: true,
                }),
            ).toBe(true);
        });

        it("should return false when all consents denied", () => {
            expect(hasAnyConsent(DENIED_CONSENT_STATE)).toBe(false);
        });

        it("should return true when all consents granted", () => {
            expect(
                hasAnyConsent({
                    analytics: true,
                    marketing: true,
                    functional: true,
                }),
            ).toBe(true);
        });

        it("should return true for DEFAULT_CONSENT_STATE (all granted)", () => {
            expect(hasAnyConsent(DEFAULT_CONSENT_STATE)).toBe(true);
        });
    });
});
