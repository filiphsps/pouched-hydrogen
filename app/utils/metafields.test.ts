import type { TFunction } from "i18next";
import { describe, expect, it } from "vitest";
import {
    extractMetafieldFacts,
    formatKeyAsLabel,
    formatMetafieldValue,
    getMetafieldLabel,
    getMetafieldValue,
    type MetafieldArray,
} from "./metafields";

/**
 * Creates a mock translation function for testing.
 * Returns the translation key if no mock value is provided.
 */
function createMockT(translations: Record<string, string> = {}): TFunction {
    return ((
        key: string,
        options?: { value?: string; defaultValue?: string },
    ) => {
        if (translations[key]) {
            // Simple interpolation for {{value}}
            let result = translations[key];
            if (options?.value) {
                result = result.replace("{{value}}", options.value);
            }
            return result;
        }
        return options?.defaultValue ?? key;
    }) as TFunction;
}

const mockMetafields: MetafieldArray = [
    { key: "nicotine", namespace: "custom", value: "50" },
    { key: "strength", namespace: "custom", value: "Ultra Strong" },
    { key: "format", namespace: "custom", value: "Slim" },
    { key: "bags_per_can", namespace: "custom", value: "22" },
    null,
];

describe("getMetafieldValue", () => {
    it("returns value for existing metafield", () => {
        expect(getMetafieldValue(mockMetafields, "nicotine")).toBe("50");
        expect(getMetafieldValue(mockMetafields, "strength")).toBe(
            "Ultra Strong",
        );
    });

    it("returns undefined for non-existing metafield", () => {
        expect(
            getMetafieldValue(mockMetafields, "nonexistent"),
        ).toBeUndefined();
    });

    it("handles namespaced keys", () => {
        expect(getMetafieldValue(mockMetafields, "custom.nicotine")).toBe("50");
    });

    it("returns undefined for empty metafields array", () => {
        expect(getMetafieldValue([], "nicotine")).toBeUndefined();
        expect(getMetafieldValue(undefined, "nicotine")).toBeUndefined();
    });

    it("ignores null values in array", () => {
        expect(getMetafieldValue(mockMetafields, "nicotine")).toBe("50");
    });
});

describe("formatKeyAsLabel", () => {
    it("converts snake_case to Title Case", () => {
        expect(formatKeyAsLabel("bags_per_can")).toBe("Bags Per Can");
        expect(formatKeyAsLabel("nicotine_content")).toBe("Nicotine Content");
    });

    it("capitalizes single words", () => {
        expect(formatKeyAsLabel("nicotine")).toBe("Nicotine");
        expect(formatKeyAsLabel("strength")).toBe("Strength");
    });

    it("handles already capitalized words", () => {
        expect(formatKeyAsLabel("NICOTINE")).toBe("Nicotine");
    });
});

describe("getMetafieldLabel", () => {
    it("returns translation when available", () => {
        const t = createMockT({
            "product.metafield.label.nicotine": "Nicotine Content",
        });
        expect(getMetafieldLabel(t, "nicotine")).toBe("Nicotine Content");
    });

    it("falls back to formatted key when no translation", () => {
        const t = createMockT({});
        expect(getMetafieldLabel(t, "bags_per_can")).toBe("Bags Per Can");
    });

    it("handles namespaced keys", () => {
        const t = createMockT({
            "product.metafield.label.nicotine": "Nicotine Content",
        });
        expect(getMetafieldLabel(t, "custom.nicotine")).toBe(
            "Nicotine Content",
        );
    });
});

describe("formatMetafieldValue", () => {
    it("returns formatted value when translation available", () => {
        const t = createMockT({
            "product.metafield.format.nicotine": "{{value}} mg/g",
        });
        expect(formatMetafieldValue(t, "nicotine", "50")).toBe("50 mg/g");
    });

    it("returns raw value when no format translation", () => {
        const t = createMockT({});
        expect(formatMetafieldValue(t, "strength", "Ultra Strong")).toBe(
            "Ultra Strong",
        );
    });

    it("handles namespaced keys", () => {
        const t = createMockT({
            "product.metafield.format.nicotine": "{{value}} mg/g",
        });
        expect(formatMetafieldValue(t, "custom.nicotine", "50")).toBe(
            "50 mg/g",
        );
    });
});

describe("extractMetafieldFacts", () => {
    it("extracts multiple metafields as label-value pairs", () => {
        const t = createMockT({
            "product.metafield.label.nicotine": "Nicotine",
            "product.metafield.format.nicotine": "{{value}} mg/g",
        });

        const facts = extractMetafieldFacts(t, mockMetafields, [
            "nicotine",
            "strength",
        ]);

        expect(facts).toHaveLength(2);
        expect(facts[0]).toEqual({ label: "Nicotine", value: "50 mg/g" });
        expect(facts[1]).toEqual({ label: "Strength", value: "Ultra Strong" });
    });

    it("skips non-existing metafields", () => {
        const t = createMockT({});
        const facts = extractMetafieldFacts(t, mockMetafields, [
            "nicotine",
            "nonexistent",
        ]);

        expect(facts).toHaveLength(1);
    });

    it("returns empty array for empty keys", () => {
        const t = createMockT({});
        const facts = extractMetafieldFacts(t, mockMetafields, []);
        expect(facts).toHaveLength(0);
    });
});
