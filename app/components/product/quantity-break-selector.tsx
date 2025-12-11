import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { useState } from "react";
import { cn } from "~/utils/cn";
import { Quantity } from "./quantity";
import { QuantityBreakButton } from "./quantity-break-button";

/**
 * Represents a single quantity break option with its discount.
 */
export interface QuantityBreak {
    /** The quantity for this break */
    quantity: number;
    /** The discount percentage for this quantity */
    discountPercentage: number;
}

/**
 * Props for the QuantityBreakSelector component.
 */
export interface QuantityBreakSelectorProps {
    /** Array of quantity break options */
    breaks: QuantityBreak[];
    /** Currently selected quantity */
    selectedQuantity: number;
    /** Callback when quantity changes */
    onQuantityChange: (quantity: number) => void;
    /** Whether to show a custom quantity input */
    showCustomInput?: boolean;
    /** Label for the component, or false to hide it */
    label?: string | false;
    /** Additional CSS class names */
    className?: string;
}

/**
 * A component for selecting quantity with predefined break options.
 * Uses Radix ToggleGroup for accessible keyboard navigation and selection.
 * Discount badges are displayed above each button matching reference design.
 *
 * @param props - The component props
 * @returns A quantity break selector with optional custom input
 */
export function QuantityBreakSelector({
    breaks,
    selectedQuantity,
    onQuantityChange,
    showCustomInput = true,
    label,
    className,
}: QuantityBreakSelectorProps) {
    const [isCustomMode, setIsCustomMode] = useState(false);

    /**
     * Handles selection change from the toggle group.
     * Switches to custom mode if "custom" is selected, otherwise updates quantity.
     */
    const handleValueChange = (value: string) => {
        if (!value) return;

        if (value === "custom") {
            setIsCustomMode(true);
        } else {
            setIsCustomMode(false);
            onQuantityChange(Number(value));
        }
    };

    /**
     * Handles custom quantity input changes.
     */
    const handleCustomQuantityChange = (value: number) => {
        if (value >= 1) {
            onQuantityChange(value);
        }
    };

    // Determine if current quantity matches any break (only relevant when not in custom mode)
    const isPresetQuantity =
        !isCustomMode && breaks.some((b) => b.quantity === selectedQuantity);
    const currentValue = isCustomMode
        ? "custom"
        : isPresetQuantity
          ? String(selectedQuantity)
          : showCustomInput
            ? "custom"
            : String(breaks[0]?.quantity || 1);

    return (
        <div className={cn("space-y-2", className)} data-motion="fade-up">
            {label !== false && (
                <span className="block text-body-subtle text-sm">
                    {label || "Quantity"}
                </span>
            )}
            <div className="flex flex-wrap items-end justify-between gap-2">
                <ToggleGroup.Root
                    type="single"
                    value={currentValue}
                    onValueChange={handleValueChange}
                    className="flex shrink-0 flex-wrap items-end gap-2"
                    data-testid="quantity-break-selector"
                >
                    {breaks.map((breakOption) => (
                        <QuantityBreakButton
                            key={breakOption.quantity}
                            quantity={breakOption.quantity}
                            discountPercentage={breakOption.discountPercentage}
                            value={String(breakOption.quantity)}
                            selected={
                                !isCustomMode &&
                                selectedQuantity === breakOption.quantity
                            }
                            className="h-14"
                        />
                    ))}
                </ToggleGroup.Root>
                {/* Custom quantity input - grows to fill space, wraps with min-width */}
                <div className="min-w-32 flex-1">
                    <Quantity
                        value={selectedQuantity}
                        onChange={handleCustomQuantityChange}
                        className="h-14 w-full"
                        label={false}
                    />
                </div>
            </div>
        </div>
    );
}
