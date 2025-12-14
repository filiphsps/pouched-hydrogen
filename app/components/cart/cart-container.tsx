import { useThemeSettings } from "@weaverse/hydrogen";
import { useIsDesktop } from "~/hooks/use-media-query";
import { CartDrawer } from "./cart-drawer";
import { CartModal } from "./cart-modal";

/**
 * Responsive cart container that switches between modal and drawer.
 * Shows modal on desktop (≥768px) if enabled, otherwise shows drawer.
 *
 * The display mode is controlled by:
 * - Screen size: Uses md breakpoint (768px) to determine desktop vs mobile
 * - Weaverse setting: `cartModalEnabled` allows merchants to disable modal on desktop
 *
 * @example
 * ```tsx
 * // In header component
 * <CartContainer />
 * ```
 */
export function CartContainer() {
    const isDesktop = useIsDesktop();
    const { cartModalEnabled = true } = useThemeSettings();

    // Show modal on desktop if enabled, otherwise always show drawer
    if (isDesktop && cartModalEnabled) {
        return <CartModal />;
    }

    return <CartDrawer />;
}
