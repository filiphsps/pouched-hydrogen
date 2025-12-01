import { describe, expect, it } from "vitest";
import { removeVendorFromTitle } from "./product";

describe("removeVendorFromTitle", () => {
    it("removes vendor from title when it starts with vendor", () => {
        expect(removeVendorFromTitle("Acme Product", "Acme")).toBe("Product");
    });

    it("removes vendor from title with extra spaces", () => {
        expect(removeVendorFromTitle("Acme  Product", "Acme")).toBe("Product");
    });

    it("does not remove vendor if title does not start with it", () => {
        expect(removeVendorFromTitle("Product by Acme", "Acme")).toBe(
            "Product by Acme",
        );
    });

    it("is case sensitive (based on current implementation)", () => {
        expect(removeVendorFromTitle("acme Product", "Acme")).toBe(
            "acme Product",
        );
    });

    it("handles empty title or vendor", () => {
        expect(removeVendorFromTitle("", "Acme")).toBe("");
        expect(removeVendorFromTitle("Product", "")).toBe("Product");
    });
});
