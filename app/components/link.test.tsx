import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { Link } from "./link";

// Mock useThemeSettings
vi.mock("@weaverse/hydrogen", () => ({
  useThemeSettings: () => ({
    enableViewTransition: false,
  }),
  createSchema: (schema: any) => schema,
}));

// Helper to render with Router context since Link uses Remix/React Router Link
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

describe("Link component", () => {
  it("renders correctly with to prop", () => {
    renderWithRouter(<Link to="/about">About Us</Link>);
    const link = screen.getByRole("link", { name: /about us/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/about");
  });

  it("renders as external link when to starts with http", () => {
    renderWithRouter(<Link to="https://google.com">Google</Link>);
    const link = screen.getByRole("link", { name: /google/i });
    expect(link).toHaveAttribute("href", "https://google.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer noopener");
  });

  it("applies variant classes", () => {
    // We can't easily check exact classes without implementation details,
    // but we can verify it renders successfully with a variant.
    renderWithRouter(
      <Link to="/" variant="underline">
        Home
      </Link>,
    );
    const link = screen.getByRole("link", { name: /home/i });
    expect(link).toBeInTheDocument();
  });
});
