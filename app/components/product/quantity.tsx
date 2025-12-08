import { cn } from "~/utils/cn";

interface QuantityProps {
    value: number;
    onChange: (value: number) => void;
    label?: string;
    className?: string;
}
export function Quantity(props: QuantityProps) {
    const { value, onChange, label = "Quantity", className } = props;
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Prevent the user from entering non-numeric characters
        if (
            e.key !== "Backspace" &&
            e.key !== "Delete" &&
            e.key !== "ArrowLeft" &&
            e.key !== "ArrowRight" &&
            Number.isNaN(Number(e.key))
        ) {
            e.preventDefault();
        }
    };
    return (
        <div className="space-y-1.5" data-motion="fade-up">
            <legend className="font-bold leading-tight">{label}</legend>
            <div
                className={cn(
                    "flex w-full items-center rounded-xl border border-line",
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
                    value={value}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => onChange(Number(e.currentTarget.value))}
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
