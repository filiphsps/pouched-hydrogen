import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import ProductStockUrgency, { schema } from "./product-stock-urgency";

// Mock react-router useLoaderData
const mockLoaderData = vi.fn();
vi.mock("react-router", () => ({
    useLoaderData: () => mockLoaderData(),
}));

// Mock @shopify/hydrogen
vi.mock("@shopify/hydrogen", () => ({
    useOptimisticVariant: vi.fn((variant) => variant),
    getAdjacentAndFirstAvailableVariants: vi.fn(() => []),
}));

// Type helper for tests - Weaverse components have extra props we don't need in unit tests
type TestProps = Partial<ComponentProps<typeof ProductStockUrgency>> & {
    ref?: React.Ref<HTMLDivElement>;
    "data-testid"?: string;
};

/**
 * Render helper that provides required Weaverse props with sensible defaults.
 */
function renderSection(props: TestProps = {}) {
    return render(
        <ProductStockUrgency
            ref={props.ref ?? null}
            Component={"div" as any}
            type="mp--stock-urgency"
            data-wv-id="test-id"
            data-wv-type="mp--stock-urgency"
            {...props}
        />,
    );
}

/**
 * Creates a mock product with a variant that has specific quantity available.
 */
function createMockProduct(quantityAvailable: number | null) {
    return {
        id: "gid://shopify/Product/1",
        title: "Test Product",
        handle: "test-product",
        selectedOrFirstAvailableVariant: {
            id: "gid://shopify/ProductVariant/1",
            availableForSale:
                quantityAvailable !== null && quantityAvailable > 0,
            quantityAvailable,
            selectedOptions: [],
            price: { amount: "10.00", currencyCode: "EUR" },
        },
    };
}

describe("ProductStockUrgency Section", () => {
    describe("rendering", () => {
        it("renders stock urgency when product has low stock", () => {
            mockLoaderData.mockReturnValue({
                product: createMockProduct(5),
            });

            renderSection();
            expect(screen.getByRole("status")).toBeInTheDocument();
        });

        it("does not render when product has adequate stock", () => {
            mockLoaderData.mockReturnValue({
                product: createMockProduct(50),
            });

            const { container } = renderSection();
            expect(container.querySelector("output")).toBeNull();
        });

        it("does not render when product is null", () => {
            mockLoaderData.mockReturnValue({
                product: null,
            });

            const { container } = renderSection();
            expect(container.firstChild).toBeNull();
        });

        it("does not render when variant has no quantity data", () => {
            mockLoaderData.mockReturnValue({
                product: createMockProduct(null),
            });

            const { container } = renderSection();
            expect(container.querySelector("output")).toBeNull();
        });

        it("does not render for untracked inventory (quantityAvailable = -1)", () => {
            mockLoaderData.mockReturnValue({
                product: createMockProduct(-1),
            });

            const { container } = renderSection();
            expect(container.querySelector("output")).toBeNull();
        });

        it("renders with very low stock (pulse animation)", () => {
            mockLoaderData.mockReturnValue({
                product: createMockProduct(2),
            });

            renderSection();
            const urgencyElement = screen.getByRole("status");
            expect(urgencyElement).toHaveClass("animate-pulse");
        });

        it("forwards ref to container div", () => {
            mockLoaderData.mockReturnValue({
                product: createMockProduct(5),
            });

            const ref = { current: null };
            renderSection({ ref });
            expect(ref.current).toBeInstanceOf(HTMLDivElement);
        });

        it("applies additional data attributes to container", () => {
            mockLoaderData.mockReturnValue({
                product: createMockProduct(5),
            });

            renderSection({ "data-testid": "custom-test-id" });
            const container = screen.getByTestId("custom-test-id");
            expect(container).toBeInTheDocument();
            expect(container).toHaveClass("empty:hidden");
        });
    });

    describe("schema", () => {
        it("has correct type", () => {
            expect(schema.type).toBe("mp--stock-urgency");
        });

        it("has correct title", () => {
            expect(schema.title).toBe("Stock Urgency");
        });

        it("is limited to 1 instance", () => {
            expect(schema.limit).toBe(1);
        });

        it("is enabled only on PRODUCT pages", () => {
            expect(schema.enabledOn).toEqual({
                pages: ["PRODUCT"],
            });
        });

        it("has settings with help text pointing to theme settings", () => {
            const generalGroup = schema.settings.find(
                (s: { group: string }) => s.group === "General",
            );
            expect(generalGroup).toBeDefined();
            expect(generalGroup.inputs[0].type).toBe("heading");
            expect(generalGroup.inputs[0].helpText).toContain("Theme Settings");
        });
    });
});
