import { useEffect, useState } from "react";
import { cn } from "~/utils/cn";

/**
 * Props for the Quantity component.
 */
interface QuantityProps {
    /** The current quantity value */
    value: number;
    /** Callback when quantity changes (fires on blur or Enter) */
    onChange: (value: number) => void;
    /** Label for the quantity input, or false to hide it */
    label?: string | false;
    /** Additional CSS class names */
    className?: string;
}

/**
 * A quantity input component with increment/decrement buttons.
 * Only fires onChange on blur, Enter key, or button clicks to prevent
 * intermediate state updates while typing.
 *
 * @param props - The component props
 * @returns A quantity input with +/- buttons
 */
export function Quantity(props: QuantityProps) {
    const { value, onChange, label, className } = props;

    // Local state for the input value while typing
    const [localValue, setLocalValue] = useState(String(value));

    // Sync local value when prop value changes (e.g., from button clicks)
    useEffect(() => {
        setLocalValue(String(value));
    }, [value]);

    /**
     * Commits the local value to the parent via onChange.
     * Ensures the value is at least 1.
     */
    const commitValue = () => {
        const numValue = Number(localValue);
        if (!Number.isNaN(numValue) && numValue >= 1) {
            onChange(numValue);
        } else {
            // Reset to current value if invalid
            setLocalValue(String(value));
        }
    };

    /**
     * Handles keydown events on the quantity input.
     * Allows keyboard shortcuts (Cmd+A, Ctrl+C, etc.) while preventing
     * non-numeric character entry. Commits value on Enter.
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Commit value on Enter
        if (e.key === "Enter") {
            e.preventDefault();
            commitValue();
            e.currentTarget.blur();
            return;
        }

        // Allow keyboard shortcuts (Cmd+A, Ctrl+C, etc.)
        if (e.metaKey || e.ctrlKey) {
            return;
        }

        // Allow navigation and editing keys
        const allowedKeys = [
            "Backspace",
            "Delete",
            "ArrowLeft",
            "ArrowRight",
            "Tab",
            "Home",
            "End",
        ];

        // Prevent the user from entering non-numeric characters
        if (!allowedKeys.includes(e.key) && Number.isNaN(Number(e.key))) {
            e.preventDefault();
        }
    };

    return (
        <div className="space-y-1.5" data-motion="fade-up">
            {label !== false && (
                <legend className="font-bold leading-tight">
                    {label || "Quantity"}
                </legend>
            )}
            <div
                className={cn(
                    "flex w-full items-center rounded-full border border-line",
                    className,
                )}
            >
                <button
                    type="button"
                    name="decrease-quantity"
                    aria-label="Decrease quantity"
                    className="h-10 w-10 shrink-0 transition disabled:opacity-50"
                    disabled={value <= 1}
                    onClick={() => onChange(value - 1)}
                >
                    <span>&#8722;</span>
                </button>
                <input
                    className="min-w-0 flex-1 border-none bg-transparent px-1 py-2.5 text-center focus:outline-hidden focus:ring-0"
                    value={localValue}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => setLocalValue(e.currentTarget.value)}
                    onBlur={commitValue}
                />
                <button
                    type="button"
                    className="h-10 w-10 shrink-0 text-body transition hover:text-body"
                    name="increase-quantity"
                    aria-label="Increase quantity"
                    onClick={() => onChange(value + 1)}
                >
                    <span>&#43;</span>
                </button>
            </div>
        </div>
    );
}
