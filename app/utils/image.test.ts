import { describe, expect, it } from "vitest";
import { calculateAspectRatio, getImageLoadingPriority } from "./image";

describe("image utility", () => {
    describe("getImageLoadingPriority", () => {
        it("returns 'eager' for first few images", () => {
            expect(getImageLoadingPriority(0)).toBe("eager");
            expect(getImageLoadingPriority(3)).toBe("eager");
        });

        it("returns 'lazy' for later images", () => {
            expect(getImageLoadingPriority(4)).toBe("lazy");
            expect(getImageLoadingPriority(10)).toBe("lazy");
        });

        it("respects custom maxEagerLoadCount", () => {
            expect(getImageLoadingPriority(1, 2)).toBe("eager");
            expect(getImageLoadingPriority(2, 2)).toBe("lazy");
        });
    });

    describe("calculateAspectRatio", () => {
        it("returns '1/1' when aspect ratio is 'adapt' but no dimensions provided", () => {
            expect(calculateAspectRatio({}, "adapt")).toBe("1/1");
        });

        it("calculates ratio from dimensions when 'adapt' is used", () => {
            expect(
                calculateAspectRatio({ width: 800, height: 600 }, "adapt"),
            ).toBe("800/600");
        });

        it("returns provided aspect ratio if not 'adapt'", () => {
            expect(
                calculateAspectRatio({ width: 800, height: 600 }, "16/9"),
            ).toBe("16/9");
            expect(calculateAspectRatio({}, "4/3")).toBe("4/3");
        });
    });
});
