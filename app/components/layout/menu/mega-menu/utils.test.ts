import { describe, expect, it } from "vitest";
import type { MegaMenuMetaobject } from "./types";
import {
    getField,
    getReference,
    getReferenceList,
    resolveImageFromResource,
    resolveUrlFromResource,
} from "./utils";

describe("mega-menu utils", () => {
    describe("getField", () => {
        it("returns value when field exists", () => {
            const node: MegaMenuMetaobject = {
                id: "1",
                fields: [{ key: "title", value: "Test Title" }],
            };
            expect(getField(node, "title")).toBe("Test Title");
        });

        it("returns undefined when field does not exist", () => {
            const node: MegaMenuMetaobject = {
                id: "1",
                fields: [],
            };
            expect(getField(node, "title")).toBeUndefined();
        });

        it("returns undefined when fields array is missing", () => {
            // @ts-expect-error - Testing runtime safety
            const node: MegaMenuMetaobject = { id: "1" };
            expect(getField(node, "title")).toBeUndefined();
        });
    });

    describe("getReference", () => {
        it("returns reference when field exists", () => {
            const ref = { id: "ref1" };
            const node: MegaMenuMetaobject = {
                id: "1",
                fields: [{ key: "link", reference: ref }],
            };
            expect(getReference(node, "link")).toBe(ref);
        });

        it("returns undefined when reference field is missing", () => {
            const node: MegaMenuMetaobject = {
                id: "1",
                fields: [{ key: "link", value: "not a ref" }],
            };
            expect(getReference(node, "link")).toBeUndefined();
        });
    });

    describe("getReferenceList", () => {
        it("returns nodes array when references exist", () => {
            const refs = [{ id: "ref1" }, { id: "ref2" }];
            const node: MegaMenuMetaobject = {
                id: "1",
                fields: [
                    {
                        key: "items",
                        references: { nodes: [{ id: "ref1" }, { id: "ref2" }] },
                    },
                ],
            };
            // Mock data structure
            expect(getReferenceList(node, "items")).toEqual(refs);
        });

        it("returns empty array when references are missing", () => {
            const node: MegaMenuMetaobject = {
                id: "1",
                fields: [{ key: "items", value: "no refs" }],
            };
            expect(getReferenceList(node, "items")).toEqual([]);
        });
    });

    describe("resolveUrlFromResource", () => {
        it("returns undefined for null resource", () => {
            expect(resolveUrlFromResource(null)).toBeUndefined();
        });

        it("returns undefined when handle is missing", () => {
            expect(resolveUrlFromResource({ type: "Product" })).toBeUndefined();
        });

        it("resolves Product URL", () => {
            expect(
                resolveUrlFromResource({
                    type: "Product",
                    handle: "my-product",
                }),
            ).toBe("/products/my-product");
            expect(
                resolveUrlFromResource({
                    __typename: "Product",
                    handle: "my-product",
                }),
            ).toBe("/products/my-product");
        });

        it("resolves Collection URL", () => {
            expect(
                resolveUrlFromResource({
                    type: "Collection",
                    handle: "my-collection",
                }),
            ).toBe("/collections/my-collection");
        });

        it("resolves Page URL", () => {
            expect(
                resolveUrlFromResource({ type: "Page", handle: "my-page" }),
            ).toBe("/pages/my-page");
        });

        it("resolves Blog URL", () => {
            expect(
                resolveUrlFromResource({ type: "Blog", handle: "my-blog" }),
            ).toBe("/blogs/my-blog");
        });

        it("resolves Article URL", () => {
            expect(
                resolveUrlFromResource({
                    type: "Article",
                    handle: "my-article",
                    blog: { handle: "news" },
                }),
            ).toBe("/blogs/news/my-article");
        });

        it("returns undefined for Article without blog handle", () => {
            expect(
                resolveUrlFromResource({
                    type: "Article",
                    handle: "my-article",
                }),
            ).toBeUndefined();
        });

        it("returns undefined for unknown type", () => {
            expect(
                resolveUrlFromResource({
                    type: "Unknown",
                    handle: "something",
                }),
            ).toBeUndefined();
        });
    });

    describe("resolveImageFromResource", () => {
        it("resolves image property", () => {
            const img = { url: "test.jpg" };
            expect(resolveImageFromResource({ image: img })).toBe(img);
        });

        it("resolves featuredImage property", () => {
            const img = { url: "test.jpg" };
            expect(resolveImageFromResource({ featuredImage: img })).toBe(img);
        });

        it("returns undefined if no image found", () => {
            expect(resolveImageFromResource({})).toBeUndefined();
        });
    });
});
