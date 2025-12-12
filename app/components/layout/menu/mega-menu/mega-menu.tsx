import { MegaMenuTrigger } from "./mega-menu-trigger";
import { Navigation } from "./navigation";

/**
 * MegaMenu wrapper component.
 * Renders the unified Navigation component with mobile trigger.
 * Navigation handles responsive rendering internally using Tailwind classes.
 */
export function MegaMenu() {
    return (
        <Navigation>
            <MegaMenuTrigger className="relative flex h-8 w-8 items-center justify-center focus-visible:outline-hidden lg:hidden" />
        </Navigation>
    );
}
