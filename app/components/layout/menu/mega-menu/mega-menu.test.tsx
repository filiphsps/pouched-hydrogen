import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MegaMenu } from "./mega-menu";

vi.mock("./navigation", () => ({
    Navigation: ({ children }: any) => (
        <nav data-testid="navigation">{children}</nav>
    ),
}));

vi.mock("./mega-menu-trigger", () => ({
    MegaMenuTrigger: ({ className }: any) => (
        <button
            type="button"
            data-testid="mega-menu-trigger"
            className={className}
        >
            Menu
        </button>
    ),
}));

describe("MegaMenu", () => {
    it("renders Navigation and Trigger", () => {
        render(<MegaMenu />);

        const nav = screen.getByTestId("navigation");
        expect(nav).toBeInTheDocument();

        const trigger = screen.getByTestId("mega-menu-trigger");
        expect(trigger).toBeInTheDocument();
        // Check if trigger is inside navigation
        expect(nav).toContainElement(trigger);
    });

    it("passes classNames to MegaMenuTrigger", () => {
        render(<MegaMenu />);
        const trigger = screen.getByTestId("mega-menu-trigger");
        expect(trigger).toHaveClass("lg:hidden");
    });
});
