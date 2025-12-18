import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StockUrgency } from "./stock-urgency";

/**
 * Mock the Weaverse hook to provide theme settings
 */
const mockThemeSettings = vi.fn(() => ({
    lowStockBadgeEnabled: true,
    lowStockThreshold: 10,
    lowStockBadgeColor: "#FEF3C7",
}));

vi.mock("@weaverse/hydrogen", () => ({
    useThemeSettings: () => mockThemeSettings(),
}));

describe("StockUrgency", () => {
    describe("rendering conditions", () => {
        it("renders nothing when quantity is above threshold", () => {
            const { container } = render(
                <StockUrgency quantityAvailable={15} />,
            );
            expect(container.firstChild).toBeNull();
        });

        it("renders nothing when quantity is null", () => {
            const { container } = render(
                <StockUrgency quantityAvailable={null} />,
            );
            expect(container.firstChild).toBeNull();
        });

        it("renders nothing when quantity is undefined", () => {
            const { container } = render(
                <StockUrgency quantityAvailable={undefined} />,
            );
            expect(container.firstChild).toBeNull();
        });

        it("renders nothing when quantity is -1 (untracked inventory)", () => {
            const { container } = render(
                <StockUrgency quantityAvailable={-1} />,
            );
            expect(container.firstChild).toBeNull();
        });

        it("renders nothing for any negative quantity", () => {
            const { container } = render(
                <StockUrgency quantityAvailable={-5} />,
            );
            expect(container.firstChild).toBeNull();
        });

        it("renders nothing when badge is disabled in settings", () => {
            mockThemeSettings.mockReturnValueOnce({
                lowStockBadgeEnabled: false,
                lowStockThreshold: 10,
                lowStockBadgeColor: "#FEF3C7",
            });
            const { container } = render(
                <StockUrgency quantityAvailable={5} />,
            );
            expect(container.firstChild).toBeNull();
        });

        it("renders when quantity equals threshold", () => {
            render(<StockUrgency quantityAvailable={10} />);
            expect(screen.getByText(/product\.onlyXLeft/)).toBeInTheDocument();
        });

        it("renders when quantity is below threshold", () => {
            render(<StockUrgency quantityAvailable={5} />);
            expect(screen.getByText(/product\.onlyXLeft/)).toBeInTheDocument();
        });

        it("renders when quantity is 0 (out of stock)", () => {
            render(<StockUrgency quantityAvailable={0} />);
            expect(screen.getByText(/product\.onlyXLeft/)).toBeInTheDocument();
        });
    });

    describe("visual treatments", () => {
        it("applies very low stock style when quantity <= 3", () => {
            render(<StockUrgency quantityAvailable={3} />);
            const badge = screen.getByText(/product\.onlyXLeft/);
            expect(badge.closest("output")).toHaveClass("animate-pulse");
        });

        it("does not apply very low stock style when quantity > 3", () => {
            render(<StockUrgency quantityAvailable={5} />);
            const badge = screen.getByText(/product\.onlyXLeft/);
            expect(badge.closest("output")).not.toHaveClass("animate-pulse");
        });
    });

    describe("size variants", () => {
        it("renders small size correctly", () => {
            render(<StockUrgency quantityAvailable={5} size="sm" />);
            const container = screen.getByRole("status");
            expect(container).toHaveClass("text-xs");
        });

        it("renders medium size correctly", () => {
            render(<StockUrgency quantityAvailable={5} size="md" />);
            const container = screen.getByRole("status");
            expect(container).toHaveClass("text-sm");
        });

        it("renders large size correctly", () => {
            render(<StockUrgency quantityAvailable={5} size="lg" />);
            const container = screen.getByRole("status");
            expect(container).toHaveClass("text-base");
        });
    });

    describe("accessibility", () => {
        it("has appropriate ARIA role", () => {
            render(<StockUrgency quantityAvailable={5} />);
            expect(screen.getByRole("status")).toBeInTheDocument();
        });

        it("has aria-live for screen readers", () => {
            render(<StockUrgency quantityAvailable={5} />);
            expect(screen.getByRole("status")).toHaveAttribute(
                "aria-live",
                "polite",
            );
        });
    });

    describe("className prop", () => {
        it("accepts custom className", () => {
            render(
                <StockUrgency quantityAvailable={5} className="custom-class" />,
            );
            const container = screen.getByRole("status");
            expect(container).toHaveClass("custom-class");
        });
    });

    describe("showIcon prop", () => {
        it("shows icon by default", () => {
            render(<StockUrgency quantityAvailable={5} />);
            expect(
                screen.getByTestId("stock-urgency-icon"),
            ).toBeInTheDocument();
        });

        it("hides icon when showIcon is false", () => {
            render(<StockUrgency quantityAvailable={5} showIcon={false} />);
            expect(
                screen.queryByTestId("stock-urgency-icon"),
            ).not.toBeInTheDocument();
        });
    });
});
