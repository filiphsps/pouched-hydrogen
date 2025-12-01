import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn utility", () => {
    it("merges class names correctly", () => {
        expect(cn("c-1", "c-2")).toBe("c-1 c-2");
    });

    it("handles conditional classes", () => {
        // biome-ignore lint/suspicious/noConstantBinaryExpressions: Intentional.
        expect(cn("c-1", true && "c-2", false && "c-3")).toBe("c-1 c-2");
    });

    it("merges tailwind classes using tailwind-merge", () => {
        expect(cn("px-2 py-1", "p-4")).toBe("p-4");
        expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
    });

    it("handles arrays and objects", () => {
        expect(cn(["c-1", "c-2"], { "c-3": true, "c-4": false })).toBe(
            "c-1 c-2 c-3",
        );
    });
});
