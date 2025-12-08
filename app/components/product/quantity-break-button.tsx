import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/utils/cn";

/**
 * CVA variant definition for quantity break button styling.
 * Matches reference design with solid black selected state and discount badges.
 */
const quantityBreakButtonVariants = cva(
    "relative flex flex-col items-center justify-center transition-all duration-200 rounded-lg px-4 py-3 min-w-14 border text-sm font-medium cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    {
        variants: {
            selected: {
                true: "bg-body text-background border-body",
                false: "bg-transparent text-body border-line hover:border-body",
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
                    className="mb-1 whitespace-nowrap rounded-full bg-teal-400 px-2 py-0.5 font-medium text-white text-xs"
                    data-testid={`discount-badge-${quantity}`}
                >
                    -{discountPercentage}%
                </span>
            )}
            <ToggleGroup.Item
                value={value}
                className={cn(
                    quantityBreakButtonVariants({ selected, className }),
                )}
                data-testid={`quantity-break-${quantity}`}
            >
                <span>{quantity}x</span>
            </ToggleGroup.Item>
        </div>
    );
}

export { quantityBreakButtonVariants };
