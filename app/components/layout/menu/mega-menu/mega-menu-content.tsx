import { MegaMenuSection } from "./mega-menu-section";
import type { MegaMenuSection as MegaMenuSectionType } from "./types";

export const isPromo = (section: MegaMenuSectionType) =>
    section.displayStyle === "promo" ||
    (section.image && section.items.length < 3);

/**
 * Container for all sections within a mega menu dropdown.
 * Uses flexbox with responsive gaps and allows horizontal scrolling on smaller screens.
 */
export function MegaMenuContent({ items }: { items: MegaMenuSectionType[] }) {
    return (
        <div className="group/mega-menu relative z-50 flex flex-col gap-6 p-0 lg:flex-row lg:gap-14 lg:overflow-x-auto lg:p-6">
            {items.map((section) => {
                const widthClass = isPromo(section)
                    ? "w-full lg:w-72 lg:shrink-0 xl:w-80"
                    : "w-full lg:w-48 lg:shrink xl:w-64";

                return (
                    <div key={section.id} className={widthClass}>
                        <MegaMenuSection section={section} />
                    </div>
                );
            })}
        </div>
    );
}
