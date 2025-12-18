import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ButtonHTMLAttributes, RefObject } from "react";
import { cn } from "~/utils/cn";

export const iconButtonVariants = cva(
    [
        "inline-flex items-center justify-center",
        "transition-colors duration-200",
        "focus-visible:outline-0",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    ],
    {
        variants: {
            variant: {
                default: ["hover:bg-gray-100", "rounded-full"],
                ghost: ["bg-transparent", "hover:bg-gray-100", "rounded-full"],
                close: [
                    "rounded-full bg-white/80 backdrop-blur",
                    "hover:bg-gray-100",
                ],
                subtle: ["text-body-subtle", "hover:text-body"],
            },
            size: {
                xs: "h-5 w-5",
                sm: "h-6 w-6",
                md: "h-8 w-8",
                lg: "h-10 w-10",
            },
            position: {
                default: "",
                "top-right": "absolute top-2 right-2 z-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
            position: "default",
        },
    },
);

export interface IconButtonProps
    extends VariantProps<typeof iconButtonVariants>,
        Omit<ButtonHTMLAttributes<HTMLButtonElement>, "ref"> {
    className?: string;
}

export function IconButton({
    ref,
    variant,
    size,
    position,
    className,
    type = "button",
    children,
    ...props
}: IconButtonProps & { ref?: RefObject<HTMLButtonElement | null> }) {
    return (
        <button
            ref={ref}
            type={type}
            className={cn(
                iconButtonVariants({ variant, size, position }),
                className,
            )}
            {...props}
        >
            {children}
        </button>
    );
}
IconButton.displayName = "IconButton";
