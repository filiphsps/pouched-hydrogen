import { XIcon } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import { useTranslation } from "react-i18next";
import { Title } from "~/components/title";

/**
 * Props for the CartHeader component.
 */
interface CartHeaderProps {
    /** Total number of items in the cart */
    totalQuantity: number;
}

/**
 * Cart header component with title and close button.
 * Used by the CartDrawer for consistent UI.
 *
 * @example
 * ```tsx
 * <CartHeader totalQuantity={3} />
 * ```
 */
export function CartHeader({ totalQuantity }: CartHeaderProps) {
    const { t } = useTranslation();

    return (
        <div className="flex items-center justify-between gap-2 px-4">
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
                    className="translate-x-2 rounded-full p-2 transition-colors hover:bg-gray-100"
                    aria-label={t("cart.closeDrawer")}
                >
                    <XIcon className="h-4 w-4" />
                </button>
            </Dialog.Close>
        </div>
    );
}
