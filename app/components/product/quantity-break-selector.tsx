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
    /** Label for the component */
    label?: string;
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
    label = "Quantity",
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

    // Determine if current quantity matches any break
    const isPresetQuantity = breaks.some(
        (b) => b.quantity === selectedQuantity,
    );
    const currentValue = isCustomMode
        ? "custom"
        : isPresetQuantity
          ? String(selectedQuantity)
          : showCustomInput
            ? "custom"
            : String(breaks[0]?.quantity || 1);

    return (
        <div className={cn("space-y-2", className)} data-motion="fade-up">
            <span className="block text-body-subtle text-sm">{label}</span>
            <div className="flex flex-wrap items-end gap-2">
                <ToggleGroup.Root
                    type="single"
                    value={currentValue}
                    onValueChange={handleValueChange}
                    className="flex flex-wrap items-end gap-2"
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
                        />
                    ))}
                    {showCustomInput && (
                        <div className="relative flex flex-col items-center">
                            <ToggleGroup.Item
                                value="custom"
                                className={cn(
                                    "flex min-w-14 cursor-pointer items-center justify-center rounded-lg border px-4 py-3 font-medium text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                                    isCustomMode ||
                                        (!isPresetQuantity && !isCustomMode)
                                        ? "border-body bg-body text-background"
                                        : "border-line bg-transparent text-body hover:border-body",
                                )}
                                data-testid="quantity-break-custom"
                            >
                                <span>...</span>
                            </ToggleGroup.Item>
                        </div>
                    )}
                </ToggleGroup.Root>

                {/* Custom quantity input - shown when custom is selected */}
                {showCustomInput && (isCustomMode || !isPresetQuantity) && (
                    <div className="min-w-24">
                        <Quantity
                            value={selectedQuantity}
                            onChange={handleCustomQuantityChange}
                            label=""
                            className="w-full"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
