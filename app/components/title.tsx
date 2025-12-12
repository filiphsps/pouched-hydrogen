import { cva, type VariantProps } from "class-variance-authority";
import type { ElementType, HTMLAttributes, Ref } from "react";
import { cn } from "~/utils/cn";

const titleVariants = cva("font-bold font-semibold tracking-tight", {
    variants: {
        size: {
            xs: "text-xs",
            sm: "text-sm",
            base: "text-base",
            lg: "text-lg",
            xl: "text-xl",
            "2xl": "text-2xl",
            "3xl": "text-3xl",
            "4xl": "text-4xl",
            "5xl": "text-5xl",
            "6xl": "text-6xl",
            "7xl": "text-7xl",
            "8xl": "text-8xl",
            "9xl": "text-9xl",
        },
        variant: {
            default: "text-body-primary",
            primary: "text-primary",
            secondary: "text-secondary",
            muted: "font-bold text-muted-foreground uppercase",
        },
    },
    defaultVariants: {
        size: "base",
        variant: "default",
    },
});

export interface TitleProps
    extends HTMLAttributes<HTMLHeadingElement>,
        VariantProps<typeof titleVariants> {
    as?: ElementType;
    ref?: Ref<HTMLHeadingElement>;
    uppercase?: boolean;
}

export function Title({
    as: Tag = "h2",
    className,
    size,
    variant,
    ref,
    children,
    uppercase = false,
    ...props
}: TitleProps) {
    return (
        <Tag
            ref={ref}
            className={cn(
                titleVariants({ size, variant }),
                uppercase && "uppercase",
                className,
            )}
            {...props}
        >
            {children}
        </Tag>
    );
}
