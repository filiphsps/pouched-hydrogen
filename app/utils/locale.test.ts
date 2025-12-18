import type { I18nBase } from "@shopify/hydrogen";
import { describe, expect, it } from "vitest";
import { getWeaverseLocale } from "./locale";

/**
 * Helper to create typed i18n objects for testing.
 * Uses type assertion since we're testing with various valid ISO codes.
 */
function createI18n(language: string, country: string): I18nBase {
    return { language, country } as I18nBase;
}

describe("getWeaverseLocale", () => {
    describe("standard locale formatting", () => {
        it("should format German locale correctly", () => {
            const i18n = createI18n("DE", "DE");
            const result = getWeaverseLocale(i18n);
            expect(result).toBe("de-DE");
        });

        it("should format English US locale correctly", () => {
            const i18n = createI18n("EN", "US");
            const result = getWeaverseLocale(i18n);
            expect(result).toBe("en-US");
        });

        it("should format English UK locale correctly", () => {
            const i18n = createI18n("EN", "GB");
            const result = getWeaverseLocale(i18n);
            expect(result).toBe("en-GB");
        });

        it("should format French locale correctly", () => {
            const i18n = createI18n("FR", "FR");
            const result = getWeaverseLocale(i18n);
            expect(result).toBe("fr-FR");
        });

        it("should format Spanish locale correctly", () => {
            const i18n = createI18n("ES", "ES");
            const result = getWeaverseLocale(i18n);
            expect(result).toBe("es-ES");
        });
    });

    describe("case handling", () => {
        it("should lowercase the language code", () => {
            const i18n = createI18n("EN", "US");
            const result = getWeaverseLocale(i18n);
            expect(result).toMatch(/^[a-z]{2}-/);
        });

        it("should uppercase the country code", () => {
            const i18n = createI18n("en", "us");
            const result = getWeaverseLocale(i18n);
            expect(result).toMatch(/-[A-Z]{2}$/);
        });

        it("should normalize mixed case language", () => {
            const i18n = createI18n("En", "US");
            const result = getWeaverseLocale(i18n);
            expect(result).toBe("en-US");
        });

        it("should normalize mixed case country", () => {
            const i18n = createI18n("EN", "uS");
            const result = getWeaverseLocale(i18n);
            expect(result).toBe("en-US");
        });

        it("should handle already lowercase language", () => {
            const i18n = createI18n("de", "DE");
            const result = getWeaverseLocale(i18n);
            expect(result).toBe("de-DE");
        });

        it("should handle already lowercase country", () => {
            const i18n = createI18n("DE", "de");
            const result = getWeaverseLocale(i18n);
            expect(result).toBe("de-DE");
        });
    });

    describe("cross-country locales", () => {
        it("should format German language in Austria", () => {
            const i18n = createI18n("DE", "AT");
            const result = getWeaverseLocale(i18n);
            expect(result).toBe("de-AT");
        });

        it("should format German language in Switzerland", () => {
            const i18n = createI18n("DE", "CH");
            const result = getWeaverseLocale(i18n);
            expect(result).toBe("de-CH");
        });

        it("should format English language in Germany", () => {
            const i18n = createI18n("EN", "DE");
            const result = getWeaverseLocale(i18n);
            expect(result).toBe("en-DE");
        });

        it("should format French language in Canada", () => {
            const i18n = createI18n("FR", "CA");
            const result = getWeaverseLocale(i18n);
            expect(result).toBe("fr-CA");
        });

        it("should format Portuguese language in Brazil", () => {
            const i18n = createI18n("PT", "BR");
            const result = getWeaverseLocale(i18n);
            expect(result).toBe("pt-BR");
        });
    });

    describe("Shopify common locales", () => {
        it("should handle Japanese locale", () => {
            const i18n = createI18n("JA", "JP");
            const result = getWeaverseLocale(i18n);
            expect(result).toBe("ja-JP");
        });

        it("should handle Korean locale", () => {
            const i18n = createI18n("KO", "KR");
            const result = getWeaverseLocale(i18n);
            expect(result).toBe("ko-KR");
        });

        it("should handle Chinese locale", () => {
            const i18n = createI18n("ZH", "CN");
            const result = getWeaverseLocale(i18n);
            expect(result).toBe("zh-CN");
        });

        it("should handle Chinese Taiwan locale", () => {
            const i18n = createI18n("ZH", "TW");
            const result = getWeaverseLocale(i18n);
            expect(result).toBe("zh-TW");
        });

        it("should handle Dutch locale", () => {
            const i18n = createI18n("NL", "NL");
            const result = getWeaverseLocale(i18n);
            expect(result).toBe("nl-NL");
        });

        it("should handle Italian locale", () => {
            const i18n = createI18n("IT", "IT");
            const result = getWeaverseLocale(i18n);
            expect(result).toBe("it-IT");
        });
    });

    describe("format consistency", () => {
        it("should always return a hyphen-separated string", () => {
            const i18n = createI18n("EN", "US");
            const result = getWeaverseLocale(i18n);
            expect(result).toContain("-");
            expect(result.split("-")).toHaveLength(2);
        });

        it("should return format matching BCP 47 language tag pattern", () => {
            const i18n = createI18n("EN", "US");
            const result = getWeaverseLocale(i18n);
            // BCP 47: lowercase language, uppercase country
            expect(result).toMatch(/^[a-z]{2}-[A-Z]{2}$/);
        });

        it("should produce consistent output for same input", () => {
            const i18n = createI18n("DE", "DE");
            const result1 = getWeaverseLocale(i18n);
            const result2 = getWeaverseLocale(i18n);
            expect(result1).toBe(result2);
        });
    });
});
