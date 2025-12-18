/**
 * Tests for VendorBadge component.
 * Tests rendering, size variants, inline mode, and Schema.org markup.
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VendorBadge } from "./vendor-badge";

describe("VendorBadge", () => {
    describe("Rendering", () => {
        it("should render vendor name", () => {
            render(<VendorBadge vendor="VELO" />);
            expect(screen.getByText("VELO")).toBeInTheDocument();
        });

        it("should return null when vendor is empty", () => {
            const { container } = render(<VendorBadge vendor="" />);
            expect(container.firstChild).toBeNull();
        });

        it("should apply uppercase styling", () => {
            render(<VendorBadge vendor="velo" />);
            const element = screen.getByText("velo");
            expect(element).toHaveClass("uppercase");
        });

        it("should apply tracking-widest styling", () => {
            render(<VendorBadge vendor="ZYN" />);
            const element = screen.getByText("ZYN");
            expect(element).toHaveClass("tracking-widest");
        });
    });

    describe("Size Variants", () => {
        it("should apply xs size class", () => {
            render(<VendorBadge vendor="VELO" size="xs" />);
            const element = screen.getByText("VELO");
            expect(element).toHaveClass("text-[9px]");
        });

        it("should apply sm size class", () => {
            render(<VendorBadge vendor="VELO" size="sm" />);
            const element = screen.getByText("VELO");
            expect(element).toHaveClass("text-[10px]");
        });

        it("should apply md size class by default", () => {
            render(<VendorBadge vendor="VELO" />);
            const element = screen.getByText("VELO");
            expect(element).toHaveClass("text-[11px]");
        });

        it("should apply lg size class", () => {
            render(<VendorBadge vendor="VELO" size="lg" />);
            const element = screen.getByText("VELO");
            expect(element).toHaveClass("text-xs");
        });
    });

    describe("Display Mode", () => {
        it("should render as block by default", () => {
            render(<VendorBadge vendor="VELO" />);
            const element = screen.getByText("VELO");
            expect(element).toHaveClass("block");
            expect(element).not.toHaveClass("inline-block");
        });

        it("should render as inline-block when inline prop is true", () => {
            render(<VendorBadge vendor="VELO" inline />);
            const element = screen.getByText("VELO");
            expect(element).toHaveClass("inline-block");
            expect(element).not.toHaveClass("block");
        });
    });

    describe("Schema.org Markup", () => {
        it("should not include itemProp by default", () => {
            render(<VendorBadge vendor="VELO" />);
            const element = screen.getByText("VELO");
            expect(element).not.toHaveAttribute("itemProp");
        });

        it("should include itemProp='brand' when withSchema is true", () => {
            render(<VendorBadge vendor="VELO" withSchema />);
            const element = screen.getByText("VELO");
            expect(element).toHaveAttribute("itemProp", "brand");
        });
    });

    describe("Custom Classes", () => {
        it("should apply custom className", () => {
            render(<VendorBadge vendor="VELO" className="custom-class" />);
            const element = screen.getByText("VELO");
            expect(element).toHaveClass("custom-class");
        });

        it("should merge custom className with default classes", () => {
            render(<VendorBadge vendor="VELO" className="mt-2" />);
            const element = screen.getByText("VELO");
            expect(element).toHaveClass("mt-2");
            expect(element).toHaveClass("uppercase");
            expect(element).toHaveClass("tracking-widest");
        });
    });
});
