import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { filterDOMProps, resolveWeaverseString } from "./weaverse";

describe("filterDOMProps", () => {
    describe("known Weaverse non-DOM props removal", () => {
        it("should remove maxDays prop", () => {
            const props = { maxDays: 5, className: "test" };
            const filtered = filterDOMProps(props);
            expect(filtered.maxDays).toBeUndefined();
            expect(filtered.className).toBe("test");
        });

        it("should remove minDays prop", () => {
            const props = { minDays: 2, id: "my-id" };
            const filtered = filterDOMProps(props);
            expect(filtered.minDays).toBeUndefined();
            expect(filtered.id).toBe("my-id");
        });

        it("should remove cutoffHour prop", () => {
            const props = { cutoffHour: 14, title: "Title" };
            const filtered = filterDOMProps(props);
            expect(filtered.cutoffHour).toBeUndefined();
            expect(filtered.title).toBe("Title");
        });

        it("should remove freeShippingThreshold prop", () => {
            const props = { freeShippingThreshold: 50, hidden: true };
            const filtered = filterDOMProps(props);
            expect(filtered.freeShippingThreshold).toBeUndefined();
            expect(filtered.hidden).toBe(true);
        });

        it("should remove loaderData prop", () => {
            const props = { loaderData: { foo: "bar" }, lang: "en" };
            const filtered = filterDOMProps(props);
            expect(filtered.loaderData).toBeUndefined();
            expect(filtered.lang).toBe("en");
        });

        it("should remove weaverseData prop", () => {
            const props = { weaverseData: { settings: {} }, dir: "ltr" };
            const filtered = filterDOMProps(props);
            expect(filtered.weaverseData).toBeUndefined();
            expect(filtered.dir).toBe("ltr");
        });

        it("should remove multiple Weaverse props at once", () => {
            const props = {
                maxDays: 5,
                minDays: 2,
                cutoffHour: 14,
                loaderData: {},
                className: "keep-me",
            };
            const filtered = filterDOMProps(props);
            expect(filtered.maxDays).toBeUndefined();
            expect(filtered.minDays).toBeUndefined();
            expect(filtered.cutoffHour).toBeUndefined();
            expect(filtered.loaderData).toBeUndefined();
            expect(filtered.className).toBe("keep-me");
        });
    });

    describe("data-* and aria-* attributes", () => {
        it("should keep data-* attributes", () => {
            const props = {
                "data-testid": "my-component",
                "data-value": 123,
                "data-active": true,
            };
            const filtered = filterDOMProps(props);
            expect(filtered["data-testid"]).toBe("my-component");
            expect(filtered["data-value"]).toBe(123);
            expect(filtered["data-active"]).toBe(true);
        });

        it("should keep aria-* attributes", () => {
            const props = {
                "aria-label": "Close button",
                "aria-hidden": true,
                "aria-describedby": "description",
            };
            const filtered = filterDOMProps(props);
            expect(filtered["aria-label"]).toBe("Close button");
            expect(filtered["aria-hidden"]).toBe(true);
            expect(filtered["aria-describedby"]).toBe("description");
        });
    });

    describe("event handlers", () => {
        it("should keep onClick handler", () => {
            const handler = vi.fn();
            const props = { onClick: handler };
            const filtered = filterDOMProps(props);
            expect(filtered.onClick).toBe(handler);
        });

        it("should keep onChange handler", () => {
            const handler = vi.fn();
            const props = { onChange: handler };
            const filtered = filterDOMProps(props);
            expect(filtered.onChange).toBe(handler);
        });

        it("should keep onSubmit handler", () => {
            const handler = vi.fn();
            const props = { onSubmit: handler };
            const filtered = filterDOMProps(props);
            expect(filtered.onSubmit).toBe(handler);
        });

        it("should not keep non-function on* properties", () => {
            const props = { onSomething: "string value" };
            const filtered = filterDOMProps(props);
            expect(filtered.onSomething).toBeUndefined();
        });
    });

    describe("standard DOM props", () => {
        it("should keep className", () => {
            const props = { className: "my-class" };
            const filtered = filterDOMProps(props);
            expect(filtered.className).toBe("my-class");
        });

        it("should keep style", () => {
            const style = { color: "red" };
            const props = { style };
            const filtered = filterDOMProps(props);
            expect(filtered.style).toBe(style);
        });

        it("should keep id", () => {
            const props = { id: "my-id" };
            const filtered = filterDOMProps(props);
            expect(filtered.id).toBe("my-id");
        });

        it("should keep ref", () => {
            const ref = { current: null };
            const props = { ref };
            const filtered = filterDOMProps(props);
            expect(filtered.ref).toBe(ref);
        });

        it("should keep form attributes", () => {
            const props = {
                name: "email",
                value: "test@example.com",
                disabled: false,
                required: true,
                placeholder: "Enter email",
            };
            const filtered = filterDOMProps(props);
            expect(filtered.name).toBe("email");
            expect(filtered.value).toBe("test@example.com");
            expect(filtered.disabled).toBe(false);
            expect(filtered.required).toBe(true);
            expect(filtered.placeholder).toBe("Enter email");
        });

        it("should keep link/media attributes", () => {
            const props = {
                href: "https://example.com",
                target: "_blank",
                rel: "noopener",
                src: "image.jpg",
                alt: "An image",
            };
            const filtered = filterDOMProps(props);
            expect(filtered.href).toBe("https://example.com");
            expect(filtered.target).toBe("_blank");
            expect(filtered.rel).toBe("noopener");
            expect(filtered.src).toBe("image.jpg");
            expect(filtered.alt).toBe("An image");
        });

        it("should keep table attributes", () => {
            const props = { colSpan: 2, rowSpan: 3, scope: "col" };
            const filtered = filterDOMProps(props);
            expect(filtered.colSpan).toBe(2);
            expect(filtered.rowSpan).toBe(3);
            expect(filtered.scope).toBe("col");
        });
    });

    describe("unknown props removal", () => {
        it("should remove unknown custom props", () => {
            const props = {
                customProp: "value",
                anotherCustom: 123,
                className: "keep",
            };
            const filtered = filterDOMProps(props);
            expect(filtered.customProp).toBeUndefined();
            expect(filtered.anotherCustom).toBeUndefined();
            expect(filtered.className).toBe("keep");
        });
    });

    describe("empty and edge cases", () => {
        it("should handle empty props object", () => {
            const filtered = filterDOMProps({});
            expect(filtered).toEqual({});
        });

        it("should handle props with only Weaverse-specific values", () => {
            const props = { maxDays: 5, minDays: 2 };
            const filtered = filterDOMProps(props);
            expect(filtered).toEqual({});
        });
    });
});

describe("resolveWeaverseString", () => {
    describe("template resolution", () => {
        it("should resolve simple template variable", () => {
            const content = "Hello {{name}}!";
            const context = { name: "World" };
            const result = resolveWeaverseString(content, context);
            expect(result).toBe("Hello World!");
        });

        it("should resolve nested template variables", () => {
            const content = "Shop: {{root.layout.shop.name}}";
            const context = {
                root: {
                    layout: {
                        shop: {
                            name: "Pouched",
                        },
                    },
                },
            };
            const result = resolveWeaverseString(content, context);
            expect(result).toBe("Shop: Pouched");
        });

        it("should resolve multiple template variables", () => {
            const content = "{{firstName}} {{lastName}}";
            const context = { firstName: "John", lastName: "Doe" };
            const result = resolveWeaverseString(content, context);
            expect(result).toBe("John Doe");
        });

        it("should handle whitespace in template tags", () => {
            const content = "Hello {{ name }}!";
            const context = { name: "World" };
            const result = resolveWeaverseString(content, context);
            expect(result).toBe("Hello World!");
        });
    });

    describe("array access", () => {
        it("should resolve array index access", () => {
            const content = "First item: {{items[0]}}";
            const context = { items: ["Apple", "Banana", "Cherry"] };
            const result = resolveWeaverseString(content, context);
            expect(result).toBe("First item: Apple");
        });

        it("should resolve nested array access", () => {
            const content = "Product: {{products[1].name}}";
            const context = {
                products: [{ name: "Product A" }, { name: "Product B" }],
            };
            const result = resolveWeaverseString(content, context);
            expect(result).toBe("Product: Product B");
        });

        it("should return original template for out-of-bounds array access", () => {
            const content = "Item: {{items[99]}}";
            const context = { items: ["Only one"] };
            const result = resolveWeaverseString(content, context);
            expect(result).toBe("Item: {{items[99]}}");
        });

        it("should return original template for negative array index", () => {
            const content = "Item: {{items[-1]}}";
            const context = { items: ["One", "Two"] };
            const result = resolveWeaverseString(content, context);
            expect(result).toBe("Item: {{items[-1]}}");
        });
    });

    describe("missing values", () => {
        it("should keep original template when value not found", () => {
            const content = "Hello {{missing}}!";
            const context = { name: "World" };
            const result = resolveWeaverseString(content, context);
            expect(result).toBe("Hello {{missing}}!");
        });

        it("should keep original template for deeply nested missing paths", () => {
            const content = "Value: {{a.b.c.d}}";
            const context = { a: { b: {} } };
            const result = resolveWeaverseString(content, context);
            expect(result).toBe("Value: {{a.b.c.d}}");
        });
    });

    describe("null and undefined handling", () => {
        it("should return content unchanged when context is null", () => {
            const content = "Hello {{name}}!";
            const result = resolveWeaverseString(content, null);
            expect(result).toBe("Hello {{name}}!");
        });

        it("should return content unchanged when context is undefined", () => {
            const content = "Hello {{name}}!";
            const result = resolveWeaverseString(content, undefined);
            expect(result).toBe("Hello {{name}}!");
        });

        it("should return content unchanged when content is not a string", () => {
            const result = resolveWeaverseString(123 as unknown as string, {
                name: "test",
            });
            expect(result).toBe(123);
        });

        it("should keep template when resolved value is null", () => {
            const content = "Value: {{nullValue}}";
            const context = { nullValue: null };
            const result = resolveWeaverseString(content, context);
            expect(result).toBe("Value: {{nullValue}}");
        });
    });

    describe("type coercion", () => {
        it("should convert numbers to strings", () => {
            const content = "Count: {{count}}";
            const context = { count: 42 };
            const result = resolveWeaverseString(content, context);
            expect(result).toBe("Count: 42");
        });

        it("should convert booleans to strings", () => {
            const content = "Active: {{isActive}}";
            const context = { isActive: true };
            const result = resolveWeaverseString(content, context);
            expect(result).toBe("Active: true");
        });

        it("should handle zero as a valid value", () => {
            const content = "Zero: {{zero}}";
            const context = { zero: 0 };
            const result = resolveWeaverseString(content, context);
            expect(result).toBe("Zero: 0");
        });

        it("should handle empty string as a valid value", () => {
            const content = "Empty: {{empty}}";
            const context = { empty: "" };
            const result = resolveWeaverseString(content, context);
            expect(result).toBe("Empty: ");
        });
    });

    describe("security - prototype pollution prevention", () => {
        let consoleSpy: ReturnType<typeof vi.spyOn>;

        beforeEach(() => {
            consoleSpy = vi
                .spyOn(console, "warn")
                .mockImplementation(() => undefined);
        });

        afterEach(() => {
            consoleSpy.mockRestore();
        });

        it("should block __proto__ access", () => {
            const content = "Value: {{__proto__}}";
            const context = { __proto__: "malicious" };
            const result = resolveWeaverseString(content, context);
            expect(result).toBe("Value: {{__proto__}}");
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining("Unsafe property access"),
            );
        });

        it("should block constructor access", () => {
            const content = "Value: {{constructor}}";
            const context = {};
            const result = resolveWeaverseString(content, context);
            expect(result).toBe("Value: {{constructor}}");
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining("Unsafe property access"),
            );
        });

        it("should block prototype access", () => {
            const content = "Value: {{prototype}}";
            const context = {};
            const result = resolveWeaverseString(content, context);
            expect(result).toBe("Value: {{prototype}}");
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining("Unsafe property access"),
            );
        });

        it("should block nested dangerous property access", () => {
            const content = "Value: {{obj.__proto__}}";
            const context = { obj: {} };
            const result = resolveWeaverseString(content, context);
            expect(result).toBe("Value: {{obj.__proto__}}");
        });
    });

    describe("content without templates", () => {
        it("should return content unchanged when no templates present", () => {
            const content = "Hello World!";
            const context = { name: "Test" };
            const result = resolveWeaverseString(content, context);
            expect(result).toBe("Hello World!");
        });

        it("should return empty string unchanged", () => {
            const result = resolveWeaverseString("", { name: "Test" });
            expect(result).toBe("");
        });
    });

    describe("complex real-world scenarios", () => {
        it("should resolve Weaverse shop name path", () => {
            const content = "Welcome to {{root.layout.shop.name}}!";
            const context = {
                root: {
                    layout: {
                        shop: {
                            name: "Pouched Store",
                        },
                    },
                },
            };
            const result = resolveWeaverseString(content, context);
            expect(result).toBe("Welcome to Pouched Store!");
        });

        it("should handle mixed resolved and unresolved templates", () => {
            const content = "{{resolved}} and {{unresolved}}";
            const context = { resolved: "Found" };
            const result = resolveWeaverseString(content, context);
            expect(result).toBe("Found and {{unresolved}}");
        });
    });
});
