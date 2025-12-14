import { XIcon } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import { useTranslation } from "react-i18next";
import { Title } from "~/components/title";
import type { CartLayoutType } from "~/types/others";
import { cn } from "~/utils/cn";

/**
 * Props for the CartHeader component.
 */
interface CartHeaderProps {
    /** Total number of items in the cart */
    totalQuantity: number;
    /** Layout variant affecting styling */
    layout: Exclude<CartLayoutType, "page">;
}

/**
 * Shared cart header component with title and close button.
 * Used by both CartDrawer and CartModal for consistent UI.
 *
 * @example
 * ```tsx
 * <CartHeader totalQuantity={3} layout="drawer" />
 * ```
 */
export function CartHeader({ totalQuantity, layout }: CartHeaderProps) {
    const { t } = useTranslation();

    return (
        <div
            className={cn(
                "flex items-center justify-between gap-2",
                layout === "drawer" && "px-4",
                layout === "modal" && "border-line-subtle border-b px-6 py-4",
            )}
        >
            <Dialog.Title asChild className="text-base">
                <div className="flex items-center justify-start gap-1">
                    <Title as="span" size="2xl">
                        {t("cart.title")}
                    </Title>
                    <Title as="span" size="base" variant="muted">
                        ({totalQuantity || 0})
                    </Title>
                </div>
            </Dialog.Title>
            <Dialog.Close asChild>
                <button
                    type="button"
                    className={cn(
                        "p-2",
                        layout === "drawer" && "translate-x-2",
                        layout === "modal" &&
                            "rounded-full transition-colors hover:bg-gray-100",
                    )}
                    aria-label={t("cart.closeDrawer")}
                >
                    <XIcon className="h-4 w-4" />
                </button>
            </Dialog.Close>
        </div>
    );
}
