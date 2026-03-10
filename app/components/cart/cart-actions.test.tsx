/**
 * Tests for CartActions component.
 * Tests checkout link, ShopPayButton, and view cart link.
 */
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { CartActions } from "./cart-actions";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock("react-router", async () => {
    const actual = await vi.importActual("react-router");
    return {
        ...actual,
        useRouteLoaderData: () => ({
            layout: {
                shop: {
                    primaryDomain: { url: "https://test.myshopify.com" },
                },
            },
        }),
    };
});

vi.mock("~/components/button", () => ({
    Button: ({
        children,
        className,
    }: {
        children: React.ReactNode;
        className?: string;
    }) => <button className={className}>{children}</button>,
}));

vi.mock("~/components/link", () => ({
    Link: ({
        children,
        to,
        variant,
        className,
    }: {
        children: React.ReactNode;
        to: string;
        variant?: string;
        className?: string;
    }) => (
        <a href={to} data-variant={variant} className={className}>
            {children}
        </a>
    ),
}));

vi.mock("~/components/product/styled-shop-pay-button", () => ({
    StyledShopPayButton: ({
        variantIds,
        className,
    }: {
        variantIds: string[];
        className?: string;
    }) => (
        <div
            data-testid="shop-pay-button"
            data-variant-count={variantIds.length}
            className={className}
        >
            ShopPay
        </div>
    ),
}));

function renderWithRouter(ui: React.ReactElement) {
    const router = createMemoryRouter([{ path: "/", element: ui }], {
        initialEntries: ["/"],
    });
    return render(<RouterProvider router={router} />);
}

const mockCart: any = {
    checkoutUrl: "https://checkout.shopify.com/cart",
    lines: {
        nodes: [
            { merchandise: { id: "variant-1" } },
            { merchandise: { id: "variant-2" } },
        ],
    },
};

describe("CartActions", () => {
    it("renders checkout button with correct URL", () => {
        renderWithRouter(<CartActions cart={mockCart} layout="drawer" />);
        const checkoutLink = screen
            .getByText("cart.continueToCheckout")
            .closest("a");
        expect(checkoutLink).toHaveAttribute(
            "href",
            "https://checkout.shopify.com/cart",
        );
    });

    it("renders Shop Pay button with variant IDs", () => {
        renderWithRouter(<CartActions cart={mockCart} layout="drawer" />);
        const shopPay = screen.getByTestId("shop-pay-button");
        expect(shopPay).toBeInTheDocument();
        expect(shopPay).toHaveAttribute("data-variant-count", "2");
    });

    it("renders view cart link in drawer layout", () => {
        renderWithRouter(<CartActions cart={mockCart} layout="drawer" />);
        expect(screen.getByText("cart.viewCart")).toBeInTheDocument();
    });

    it("does not render view cart link in page layout", () => {
        renderWithRouter(<CartActions cart={mockCart} layout="page" />);
        expect(screen.queryByText("cart.viewCart")).not.toBeInTheDocument();
    });

    it("returns null when no checkoutUrl", () => {
        const cartWithoutCheckout: any = {
            checkoutUrl: null,
            lines: { nodes: [] },
        };
        const { container } = renderWithRouter(
            <CartActions cart={cartWithoutCheckout} layout="drawer" />,
        );
        expect(container.firstChild).toBeNull();
    });

    it("does not render Shop Pay when no variant IDs", () => {
        const emptyCart: any = {
            checkoutUrl: "https://checkout.shopify.com/cart",
            lines: { nodes: [] },
        };
        renderWithRouter(<CartActions cart={emptyCart} layout="drawer" />);
        expect(screen.queryByTestId("shop-pay-button")).not.toBeInTheDocument();
    });
});
