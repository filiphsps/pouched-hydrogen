import { List as ListIcon } from "@phosphor-icons/react";
import type * as Dialog from "@radix-ui/react-dialog";
import type { RefObject } from "react";

/**
 * Mobile menu trigger button (hamburger icon).
 * Should be positioned on the left side of the header on mobile.
 */
export function MegaMenuTrigger({
    ref,
    ...props
}: Dialog.DialogTriggerProps & {
    ref?: RefObject<HTMLButtonElement | null>;
}) {
    return (
        <button ref={ref} type="button" {...props}>
            <ListIcon className="h-6 w-6" />
        </button>
    );
}
