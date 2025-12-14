import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CartUpsells } from "./cart-upsells";

// Mock dependencies
vi.mock("@weaverse/hydrogen", () => ({
    useThemeSettings: () => ({
        cartUpsellsEnabled: true,
        cartUpsellsHeading: "Pairs well with",
    }),
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("~/hooks/use-prefix-path-with-locale", () => ({
    usePrefixPathWithLocale: (path: string) => path,
}));

vi.mock("react-router", async () => {
    const actual = await vi.importActual("react-router");
    return {
        ...actual,
        useFetcher: () => ({
            load: vi.fn(),
            data: {
                products: [
                    {
                        id: "p1",
                        title: "Upsell Product 1",
                        variants: { nodes: [] },
                        images: { nodes: [] },
                    },
                    {
                        id: "p2",
                        title: "Upsell Product 2",
                        variants: { nodes: [] },
                        images: { nodes: [] },
                    },
                ],
            },
            state: "idle",
        }),
    };
});

// Mock ProductCard to check props
vi.mock("~/components/product/product-card", () => ({
    ProductCard: ({ variant }: { variant: string }) => (
        <div data-testid="product-card" data-variant={variant}>
            Product Card
        </div>
    ),
}));

describe("CartUpsells", () => {
    it("renders upsell products with list variant", () => {
        const cartLineItems = [{ merchandise: { product: { id: "p0" } } }];

        render(<CartUpsells cartLineItems={cartLineItems as any} />);

        expect(screen.getByText("Pairs well with")).toBeInTheDocument();
        const cards = screen.getAllByTestId("product-card");
        expect(cards).toHaveLength(2);
        expect(cards[0]).toHaveAttribute("data-variant", "list");
    });
});
