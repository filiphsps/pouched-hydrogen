import { describe, expect, it } from "vitest";
import { normalizeTextEnding } from "./text";

describe("normalizeTextEnding", () => {
    it("returns undefined for null or undefined input", () => {
        expect(normalizeTextEnding(null)).toBeUndefined();
        expect(normalizeTextEnding(undefined)).toBeUndefined();
    });

    it("returns undefined for empty or whitespace-only strings", () => {
        expect(normalizeTextEnding("")).toBeUndefined();
        expect(normalizeTextEnding("   ")).toBeUndefined();
    });

    describe('mode: "as_is" (default)', () => {
        it("returns text as is when no punctuation is present", () => {
            expect(normalizeTextEnding("Hello world")).toBe("Hello world");
        });

        it("returns text as is when punctuation is present", () => {
            expect(normalizeTextEnding("Hello world.")).toBe("Hello world.");
            expect(normalizeTextEnding("Hello world!")).toBe("Hello world!");
        });

        it("defaults to as_is mode if not specified", () => {
            expect(normalizeTextEnding("Hello world")).toBe("Hello world");
        });
    });

    describe('mode: "force_punctuation"', () => {
        it("adds default period if no ending punctuation exists", () => {
            expect(
                normalizeTextEnding("Hello world", "force_punctuation"),
            ).toBe("Hello world.");
        });

        it("does not add period if text already ends with a period", () => {
            expect(
                normalizeTextEnding("Hello world.", "force_punctuation"),
            ).toBe("Hello world.");
        });

        it("does not add period if text ends with an exclamation mark", () => {
            expect(
                normalizeTextEnding("Hello world!", "force_punctuation"),
            ).toBe("Hello world!");
        });

        it("does not add period if text ends with a question mark", () => {
            expect(
                normalizeTextEnding("Hello world?", "force_punctuation"),
            ).toBe("Hello world?");
        });

        it("uses custom preferred ending if provided", () => {
            expect(
                normalizeTextEnding("Hello world", "force_punctuation", "!"),
            ).toBe("Hello world!");
        });
    });

    describe('mode: "remove_period"', () => {
        it("removes trailing period", () => {
            expect(normalizeTextEnding("Hello world.", "remove_period")).toBe(
                "Hello world",
            );
        });

        it("does not remove other punctuation", () => {
            expect(normalizeTextEnding("Hello world!", "remove_period")).toBe(
                "Hello world!",
            );
            expect(normalizeTextEnding("Hello world?", "remove_period")).toBe(
                "Hello world?",
            );
        });

        it("returns text as is if no period exists", () => {
            expect(normalizeTextEnding("Hello world", "remove_period")).toBe(
                "Hello world",
            );
        });
    });
});
