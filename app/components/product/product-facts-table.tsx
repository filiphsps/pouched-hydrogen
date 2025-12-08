import { cn } from "~/utils/cn";

/**
 * Represents a single fact/specification with label and value.
 */
export interface ProductFact {
    /** The label/name of the specification */
    label: string;
    /** The value of the specification */
    value: string;
}

/**
 * Props for the ProductFactsTable component.
 */
export interface ProductFactsTableProps {
    /** Array of facts to display */
    facts: ProductFact[];
    /** Optional title for the table */
    title?: string;
    /** Additional CSS class names */
    className?: string;
}

/**
 * A component that displays product facts/specifications in a key-value table format.
 * Styled to match reference design with clean rows and subtle dividers.
 *
 * @param props - The component props
 * @returns A table of product facts, or null if no facts are provided
 */
export function ProductFactsTable({
    facts,
    title,
    className,
}: ProductFactsTableProps) {
    if (!facts || facts.length === 0) {
        return null;
    }

    return (
        <div
            className={cn("space-y-3", className)}
            data-testid="product-facts-table"
        >
            {title && (
                <h3
                    className="font-medium text-body-subtle text-sm"
                    data-testid="facts-title"
                >
                    {title}
                </h3>
            )}
            <div className="divide-y divide-line">
                {facts.map((fact) => (
                    <div
                        key={fact.label}
                        className="flex items-center justify-between py-3 text-sm"
                        data-testid={`fact-row-${fact.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                        <span className="text-body-subtle">{fact.label}</span>
                        <span className="font-medium">{fact.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
