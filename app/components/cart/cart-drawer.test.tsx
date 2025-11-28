import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { CartDrawer } from "./cart-drawer";

// Mock dependencies
vi.mock("@shopify/hydrogen", () => ({
  useAnalytics: () => ({ publish: vi.fn() }),
  Await: ({ children, resolve }: any) => children(resolve),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("~/components/cart/cart-main", () => ({
  CartMain: () => <div data-testid="cart-main">Cart Main Content</div>,
}));

vi.mock("~/components/link", () => ({
  default: ({ children, to, className }: any) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

// Mock useRouteLoaderData to return cart data
const mockCart = {
  id: "cart-1",
  totalQuantity: 3,
  lines: { nodes: [] },
};

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useRouteLoaderData: () => ({
      cart: mockCart,
    }),
  };
});

function renderWithRouter(ui: React.ReactElement) {
  const router = createMemoryRouter(
    [
      {
        path: "/",
        element: ui,
      },
    ],
    {
      initialEntries: ["/"],
    },
  );

  return render(<RouterProvider router={router} />);
}

describe("CartDrawer Integration", () => {
  it("renders trigger button with cart count", async () => {
    renderWithRouter(<CartDrawer />);

    // Check for cart count
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("opens drawer when trigger is clicked", async () => {
    renderWithRouter(<CartDrawer />);

    // Click trigger
    const trigger = screen.getByRole("button"); // The trigger is the button with HandbagIcon
    fireEvent.click(trigger);

    // Check if drawer content appears
    // Radix Dialog renders content in a Portal, so it should be in the document
    await waitFor(() => {
      expect(screen.getByText("cart.title (3)")).toBeInTheDocument();
      expect(screen.getByTestId("cart-main")).toBeInTheDocument();
    });
  });
});
