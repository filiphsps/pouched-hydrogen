import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { InputHTMLAttributes, RefObject } from "react";
import { cn } from "~/utils/cn";

export const inputVariants = cva(
    [
        "w-full text-body placeholder:text-body-subtle",
        "transition-colors duration-200",
        "disabled:cursor-not-allowed disabled:opacity-50",
    ],
    {
        variants: {
            variant: {
                default: [
                    "border border-border bg-background px-3 py-2",
                    "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
                ],
                outline: [
                    "border border-gray-300 px-4 py-3 text-gray-900",
                    "focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500",
                ],
                ghost: [
                    "border-none bg-transparent",
                    "focus:outline-hidden focus:ring-0",
                ],
                dialog: [
                    "border border-border bg-background p-3",
                    "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
                ],
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

export interface InputProps
    extends VariantProps<typeof inputVariants>,
        Omit<InputHTMLAttributes<HTMLInputElement>, "ref"> {
    className?: string;
}

export function Input({
    ref,
    variant,
    className,
    type = "text",
    ...props
}: InputProps & { ref?: RefObject<HTMLInputElement | null> }) {
    return (
        <input
            ref={ref}
            type={type}
            className={cn(inputVariants({ variant }), className)}
            {...props}
        />
    );
}
Input.displayName = "Input";
