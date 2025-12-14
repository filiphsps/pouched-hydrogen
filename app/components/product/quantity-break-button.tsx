import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/utils/cn";

/**
 * CVA variant definition for quantity break button styling.
 * Matches reference design with solid black selected state and discount badges.
 */
const quantityBreakButtonVariants = cva(
    "relative flex min-w-14 cursor-pointer flex-col items-center justify-center rounded-lg border px-4 py-3 font-medium text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    {
        variants: {
            selected: {
                true: "border-body bg-body text-background",
                false: "border-line bg-transparent text-body",
            },
        },
        defaultVariants: {
            selected: false,
        },
    },
);

/**
 * Props for the QuantityBreakButton component.
 */
export interface QuantityBreakButtonProps
    extends VariantProps<typeof quantityBreakButtonVariants> {
    /** The quantity this button represents */
    quantity: number;
    /** Optional discount percentage to display as a badge */
    discountPercentage?: number;
    /** Value for Radix ToggleGroup */
    value: string;
    /** Additional CSS class names */
    className?: string;
}

/**
 * A button component for selecting a quantity break option.
 * Shows the quantity with an optional discount badge positioned above.
 * Uses Radix ToggleGroup.Item for accessibility and keyboard navigation.
 *
 * @param props - The component props
 * @returns A styled toggle button for quantity selection
 */
export function QuantityBreakButton({
    quantity,
    discountPercentage,
    selected,
    value,
    className,
}: QuantityBreakButtonProps) {
    return (
        <div className="relative flex flex-col items-center">
            {/* Discount badge positioned above the button */}
            {discountPercentage != null && discountPercentage > 0 && (
                <span
                    className="mb-1 whitespace-nowrap rounded-full bg-body px-2 py-1 text-center font-semibold text-background text-xs"
                    data-testid={`discount-badge-${quantity}`}
                >
                    -{discountPercentage}%
                </span>
            )}

            <ToggleGroup.Item
                value={value}
                className={cn(
                    "ring-0 ring-line hover:ring-2 hover:ring-offset-2",
                    quantityBreakButtonVariants({ selected, className }),
                )}
                data-testid={`quantity-break-${quantity}`}
            >
                <div>
                    <span>{quantity}x</span>
                </div>
            </ToggleGroup.Item>
        </div>
    );
}

export { quantityBreakButtonVariants };
