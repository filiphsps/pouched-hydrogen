import { ShopPayButton } from "@shopify/hydrogen";
import type { ComponentProps } from "react";
import { cn } from "~/utils/cn";

/**
 * Props for the StyledShopPayButton component.
 * Extends the base ShopPayButton props.
 */
export type StyledShopPayButtonProps = ComponentProps<typeof ShopPayButton> & {
    /** Additional CSS class names */
    className?: string;
};

/**
 * A styled wrapper around Shopify's ShopPayButton that applies consistent
 * design matching the primary button style (pill-shaped, shadows, etc.).
 *
 * @param props - The component props
 * @returns A styled ShopPayButton
 */
export function StyledShopPayButton({
    className,
    ...props
}: StyledShopPayButtonProps) {
    return (
        <ShopPayButton
            {...props}
            className={cn(
                "h-12 overflow-hidden rounded-full shadow-xs",
                className,
            )}
        />
    );
}
