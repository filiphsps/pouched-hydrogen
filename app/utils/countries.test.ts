import { describe, expect, it } from "vitest";
import {
    COUNTRY_CODES,
    getCountryCodesWithPriority,
    isPriorityCountry,
    isValidCountryCode,
    PRIORITY_COUNTRY_CODES,
} from "./countries";

describe("countries utility", () => {
    describe("COUNTRY_CODES", () => {
        it("should contain Germany as the first country", () => {
            expect(COUNTRY_CODES[0]).toBe("DE");
        });

        it("should have priority countries first", () => {
            expect(COUNTRY_CODES[0]).toBe("DE");
            expect(COUNTRY_CODES[1]).toBe("AT");
            expect(COUNTRY_CODES[2]).toBe("CH");
        });

        it("should have unique country codes", () => {
            const uniqueCodes = new Set(COUNTRY_CODES);
            expect(uniqueCodes.size).toBe(COUNTRY_CODES.length);
        });

        it("should have valid country codes (2 uppercase letters)", () => {
            for (const code of COUNTRY_CODES) {
                expect(code).toMatch(/^[A-Z]{2}$/);
            }
        });

        it("should contain common European countries", () => {
            expect(COUNTRY_CODES).toContain("DE");
            expect(COUNTRY_CODES).toContain("FR");
            expect(COUNTRY_CODES).toContain("GB");
            expect(COUNTRY_CODES).toContain("IT");
            expect(COUNTRY_CODES).toContain("ES");
        });

        it("should contain common non-European countries", () => {
            expect(COUNTRY_CODES).toContain("US");
            expect(COUNTRY_CODES).toContain("CA");
            expect(COUNTRY_CODES).toContain("AU");
            expect(COUNTRY_CODES).toContain("JP");
        });
    });

    describe("PRIORITY_COUNTRY_CODES", () => {
        it("should contain DE, AT, CH", () => {
            expect(PRIORITY_COUNTRY_CODES).toEqual(["DE", "AT", "CH"]);
        });

        it("should have exactly 3 priority countries", () => {
            expect(PRIORITY_COUNTRY_CODES.length).toBe(3);
        });
    });

    describe("isValidCountryCode", () => {
        it("should return true for valid codes", () => {
            expect(isValidCountryCode("DE")).toBe(true);
            expect(isValidCountryCode("FR")).toBe(true);
            expect(isValidCountryCode("US")).toBe(true);
        });

        it("should be case-insensitive", () => {
            expect(isValidCountryCode("de")).toBe(true);
            expect(isValidCountryCode("De")).toBe(true);
            expect(isValidCountryCode("dE")).toBe(true);
        });

        it("should return false for invalid codes", () => {
            expect(isValidCountryCode("XX")).toBe(false);
            expect(isValidCountryCode("ZZ")).toBe(false);
            expect(isValidCountryCode("")).toBe(false);
            expect(isValidCountryCode("GERMANY")).toBe(false);
        });
    });

    describe("isPriorityCountry", () => {
        it("should return true for priority countries", () => {
            expect(isPriorityCountry("DE")).toBe(true);
            expect(isPriorityCountry("AT")).toBe(true);
            expect(isPriorityCountry("CH")).toBe(true);
        });

        it("should be case-insensitive", () => {
            expect(isPriorityCountry("de")).toBe(true);
            expect(isPriorityCountry("at")).toBe(true);
            expect(isPriorityCountry("ch")).toBe(true);
        });

        it("should return false for non-priority countries", () => {
            expect(isPriorityCountry("FR")).toBe(false);
            expect(isPriorityCountry("US")).toBe(false);
            expect(isPriorityCountry("GB")).toBe(false);
        });

        it("should return false for invalid codes", () => {
            expect(isPriorityCountry("XX")).toBe(false);
            expect(isPriorityCountry("")).toBe(false);
        });
    });

    describe("getCountryCodesWithPriority", () => {
        it("should return all country codes", () => {
            const codes = getCountryCodesWithPriority();
            expect(codes.length).toBe(COUNTRY_CODES.length);
        });

        it("should have priority countries first", () => {
            const codes = getCountryCodesWithPriority();
            expect(codes[0]).toBe("DE");
            expect(codes[1]).toBe("AT");
            expect(codes[2]).toBe("CH");
        });

        it("should return a readonly array", () => {
            const codes = getCountryCodesWithPriority();
            // TypeScript will enforce readonly, but we can verify it's the same reference
            expect(codes).toBe(COUNTRY_CODES);
        });
    });
});
