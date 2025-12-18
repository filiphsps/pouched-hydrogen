import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    constructURL,
    formatDate,
    formDataToObject,
    isLightColor,
    isValidColor,
} from "./misc";

describe("constructURL", () => {
    beforeEach(() => {
        // Mock window.location for relative URL tests
        vi.stubGlobal("window", {
            location: {
                origin: "https://pouched.de",
            },
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    describe("absolute URLs", () => {
        it("should return absolute URL unchanged when no queries", () => {
            const url = constructURL("https://example.com/path");
            expect(url).toBe("https://example.com/path");
        });

        it("should add query parameters to absolute URL", () => {
            const url = constructURL("https://example.com/path", {
                foo: "bar",
            });
            expect(url).toBe("https://example.com/path?foo=bar");
        });

        it("should handle multiple query parameters", () => {
            const url = constructURL("https://example.com/path", {
                foo: "bar",
                baz: "qux",
            });
            const parsedUrl = new URL(url);
            expect(parsedUrl.searchParams.get("foo")).toBe("bar");
            expect(parsedUrl.searchParams.get("baz")).toBe("qux");
        });
    });

    describe("relative URLs", () => {
        it("should convert relative URL to absolute using window.location.origin", () => {
            const url = constructURL("/products");
            expect(url).toBe("https://pouched.de/products");
        });

        it("should add query parameters to relative URL", () => {
            const url = constructURL("/search", { q: "test" });
            expect(url).toBe("https://pouched.de/search?q=test");
        });
    });

    describe("query parameter types", () => {
        it("should handle string query parameters", () => {
            const url = constructURL("https://example.com", { name: "John" });
            expect(url).toContain("name=John");
        });

        it("should handle number query parameters", () => {
            const url = constructURL("https://example.com", { page: 5 });
            expect(url).toContain("page=5");
        });

        it("should handle boolean query parameters", () => {
            const url = constructURL("https://example.com", { active: true });
            expect(url).toContain("active=true");
        });

        it("should skip undefined query parameters", () => {
            const url = constructURL("https://example.com", {
                defined: "yes",
                undef: undefined as unknown as string,
            });
            expect(url).toContain("defined=yes");
            expect(url).not.toContain("undef");
        });

        it("should skip null query parameters", () => {
            const url = constructURL("https://example.com", {
                defined: "yes",
                nullVal: null as unknown as string,
            });
            expect(url).toContain("defined=yes");
            expect(url).not.toContain("nullVal");
        });
    });

    describe("URL encoding", () => {
        it("should encode special characters in query values", () => {
            const url = constructURL("https://example.com", {
                query: "hello world",
            });
            expect(url).toContain("query=hello+world");
        });

        it("should encode special characters properly", () => {
            const url = constructURL("https://example.com", {
                special: "foo&bar=baz",
            });
            const parsedUrl = new URL(url);
            expect(parsedUrl.searchParams.get("special")).toBe("foo&bar=baz");
        });
    });

    describe("empty queries", () => {
        it("should handle empty queries object", () => {
            const url = constructURL("https://example.com/path", {});
            expect(url).toBe("https://example.com/path");
        });

        it("should handle undefined queries", () => {
            const url = constructURL("https://example.com/path");
            expect(url).toBe("https://example.com/path");
        });
    });
});

describe("formDataToObject", () => {
    it("should convert empty FormData to empty object", () => {
        const formData = new FormData();
        const result = formDataToObject(formData);
        expect(result).toEqual({});
    });

    it("should convert single field FormData", () => {
        const formData = new FormData();
        formData.append("name", "John");
        const result = formDataToObject(formData);
        expect(result).toEqual({ name: "John" });
    });

    it("should convert multiple fields FormData", () => {
        const formData = new FormData();
        formData.append("firstName", "John");
        formData.append("lastName", "Doe");
        formData.append("email", "john@example.com");
        const result = formDataToObject(formData);
        expect(result).toEqual({
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
        });
    });

    it("should handle duplicate keys (last value wins)", () => {
        const formData = new FormData();
        formData.append("color", "red");
        formData.append("color", "blue");
        const result = formDataToObject(formData);
        expect(result).toEqual({ color: "blue" });
    });

    it("should handle empty string values", () => {
        const formData = new FormData();
        formData.append("empty", "");
        const result = formDataToObject(formData);
        expect(result).toEqual({ empty: "" });
    });

    it("should handle special characters in values", () => {
        const formData = new FormData();
        formData.append("message", "Hello & goodbye <script>");
        const result = formDataToObject(formData);
        expect(result).toEqual({ message: "Hello & goodbye <script>" });
    });
});

describe("formatDate", () => {
    it("should format ISO date string correctly", () => {
        const result = formatDate("2024-12-18T14:30:00Z");
        // Note: exact output depends on timezone, checking for expected parts
        expect(result).toContain("Dec");
        expect(result).toContain("18");
        expect(result).toContain("2024");
        expect(result).toContain("at");
    });

    it("should format date with different year", () => {
        const result = formatDate("2023-06-15T09:00:00Z");
        expect(result).toContain("Jun");
        expect(result).toContain("15");
        expect(result).toContain("2023");
    });

    it("should include time component", () => {
        const result = formatDate("2024-01-01T12:00:00Z");
        expect(result).toContain("at");
        // Time should be present (format varies by timezone)
        expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it("should handle date-only string", () => {
        const result = formatDate("2024-12-25");
        expect(result).toContain("Dec");
        expect(result).toContain("25");
        expect(result).toContain("2024");
    });

    it("should handle full datetime with timezone", () => {
        const result = formatDate("2024-07-04T18:00:00+02:00");
        expect(result).toContain("Jul");
        expect(result).toContain("4");
        expect(result).toContain("2024");
    });
});

describe("isValidColor", () => {
    describe("hex colors", () => {
        it("should validate 6-digit hex color", () => {
            expect(isValidColor("#ff0000")).toBe(true);
        });

        it("should validate 3-digit hex color", () => {
            expect(isValidColor("#f00")).toBe(true);
        });

        it("should validate 8-digit hex color (with alpha)", () => {
            expect(isValidColor("#ff0000ff")).toBe(true);
        });

        it("should validate lowercase hex", () => {
            expect(isValidColor("#abcdef")).toBe(true);
        });

        it("should validate uppercase hex", () => {
            expect(isValidColor("#ABCDEF")).toBe(true);
        });

        it("should validate 4-digit hex color (with alpha)", () => {
            // #ff00 is a valid 4-digit hex (shorthand with alpha)
            expect(isValidColor("#ff00")).toBe(true);
        });

        it("should invalidate 5-digit hex (invalid length)", () => {
            expect(isValidColor("#ff000")).toBe(false);
        });
    });

    describe("named colors", () => {
        // Note: colord library does not support named colors without the names plugin
        // These tests document the actual behavior
        it("should not validate named colors without plugin", () => {
            expect(isValidColor("red")).toBe(false);
            expect(isValidColor("blue")).toBe(false);
            expect(isValidColor("transparent")).toBe(false);
        });

        it("should invalidate invalid color name", () => {
            expect(isValidColor("notacolor")).toBe(false);
        });
    });

    describe("rgb/rgba colors", () => {
        it("should validate rgb color", () => {
            expect(isValidColor("rgb(255, 0, 0)")).toBe(true);
        });

        it("should validate rgba color", () => {
            expect(isValidColor("rgba(255, 0, 0, 0.5)")).toBe(true);
        });

        it("should validate rgb without spaces", () => {
            expect(isValidColor("rgb(0,0,0)")).toBe(true);
        });
    });

    describe("hsl/hsla colors", () => {
        it("should validate hsl color", () => {
            expect(isValidColor("hsl(0, 100%, 50%)")).toBe(true);
        });

        it("should validate hsla color", () => {
            expect(isValidColor("hsla(0, 100%, 50%, 0.5)")).toBe(true);
        });
    });

    describe("invalid colors", () => {
        it("should invalidate empty string", () => {
            expect(isValidColor("")).toBe(false);
        });

        it("should invalidate random string", () => {
            expect(isValidColor("not-a-color")).toBe(false);
        });

        it("should invalidate numbers", () => {
            expect(isValidColor("12345")).toBe(false);
        });
    });
});

describe("isLightColor", () => {
    describe("light colors", () => {
        it("should identify white as light", () => {
            expect(isLightColor("#ffffff")).toBe(true);
        });

        it("should identify light yellow as light", () => {
            expect(isLightColor("#ffff00")).toBe(true);
        });

        it("should identify light gray as light with default threshold", () => {
            // #e0e0e0 has brightness ~0.88
            expect(isLightColor("#e0e0e0")).toBe(true);
        });
    });

    describe("dark colors", () => {
        it("should identify black as not light", () => {
            expect(isLightColor("#000000")).toBe(false);
        });

        it("should identify dark blue as not light", () => {
            expect(isLightColor("#000080")).toBe(false);
        });

        it("should identify red as not light with default threshold", () => {
            // Red has brightness ~0.30
            expect(isLightColor("#ff0000")).toBe(false);
        });
    });

    describe("threshold customization", () => {
        it("should use custom threshold", () => {
            // Gray #808080 has brightness ~0.50
            expect(isLightColor("#808080", 0.4)).toBe(true);
            expect(isLightColor("#808080", 0.6)).toBe(false);
        });

        it("should use default threshold of 0.8", () => {
            // Color with brightness 0.85 should be light with default 0.8 threshold
            expect(isLightColor("#f0f0f0")).toBe(true);
            // Color with brightness 0.75 should not be light with default 0.8 threshold
            expect(isLightColor("#c0c0c0")).toBe(false);
        });

        it("should handle threshold of 0", () => {
            // Black has brightness 0, so brightness > 0 is false
            expect(isLightColor("#000000", 0)).toBe(false);
            // #111111 has brightness ~0.067, which is > 0
            expect(isLightColor("#111111", 0)).toBe(true);
        });

        it("should handle threshold of 1", () => {
            // White has brightness 1.0, but 1.0 > 1 is false
            expect(isLightColor("#ffffff", 1)).toBe(false);
        });
    });

    describe("invalid colors", () => {
        it("should return false for invalid color", () => {
            expect(isLightColor("not-a-color")).toBe(false);
        });

        it("should return false for empty string", () => {
            expect(isLightColor("")).toBe(false);
        });
    });

    describe("named colors", () => {
        // Note: colord library does not support named colors without the names plugin
        // These tests document the actual behavior - named colors are treated as invalid
        it("should return false for named colors without plugin", () => {
            expect(isLightColor("white")).toBe(false);
            expect(isLightColor("black")).toBe(false);
            expect(isLightColor("yellow")).toBe(false);
        });
    });
});
