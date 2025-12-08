import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { type ProductFact, ProductFactsTable } from "./product-facts-table";

const mockFacts: ProductFact[] = [
    { label: "Brand", value: "Dope" },
    { label: "Strength", value: "Ultra Strong" },
    { label: "Nicotine content per gram", value: "50 mg/g" },
    { label: "Format", value: "Slim" },
];

describe("ProductFactsTable component", () => {
    it("renders all facts correctly", () => {
        render(<ProductFactsTable facts={mockFacts} />);

        expect(screen.getByText("Brand")).toBeInTheDocument();
        expect(screen.getByText("Dope")).toBeInTheDocument();
        expect(screen.getByText("Strength")).toBeInTheDocument();
        expect(screen.getByText("Ultra Strong")).toBeInTheDocument();
    });

    it("renders title when provided", () => {
        render(<ProductFactsTable facts={mockFacts} title="Facts" />);

        expect(screen.getByTestId("facts-title")).toBeInTheDocument();
        expect(screen.getByText("Facts")).toBeInTheDocument();
    });

    it("does not render title when not provided", () => {
        render(<ProductFactsTable facts={mockFacts} />);

        expect(screen.queryByTestId("facts-title")).not.toBeInTheDocument();
    });

    it("returns null when facts array is empty", () => {
        const { container } = render(<ProductFactsTable facts={[]} />);

        expect(container.firstChild).toBeNull();
    });

    it("generates correct test ids for fact rows", () => {
        render(<ProductFactsTable facts={mockFacts} />);

        expect(screen.getByTestId("fact-row-brand")).toBeInTheDocument();
        expect(screen.getByTestId("fact-row-strength")).toBeInTheDocument();
        expect(
            screen.getByTestId("fact-row-nicotine-content-per-gram"),
        ).toBeInTheDocument();
        expect(screen.getByTestId("fact-row-format")).toBeInTheDocument();
    });

    it("has correct test id for the table container", () => {
        render(<ProductFactsTable facts={mockFacts} />);

        expect(screen.getByTestId("product-facts-table")).toBeInTheDocument();
    });

    it("applies custom className", () => {
        render(
            <ProductFactsTable facts={mockFacts} className="custom-class" />,
        );

        expect(screen.getByTestId("product-facts-table")).toHaveClass(
            "custom-class",
        );
    });
});
