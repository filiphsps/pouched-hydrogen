import { cva } from "class-variance-authority";
import { Image as ShopifyImage } from "~/components/image";
import { isPromo } from "~/components/layout/menu/mega-menu/mega-menu-content";
import { Title } from "~/components/title";
import { cn } from "~/utils/cn";
import { MegaMenuItem } from "./mega-menu-item";
import type { MegaMenuSection as MegaMenuSectionType } from "./types";

const itemsContainerVariants = cva("", {
    variants: {
        displayStyle: {
            list: "flex flex-col gap-3",
            grid: "grid grid-cols-2 gap-1.5",
            promo: "flex flex-col gap-3",
        },
    },
    defaultVariants: {
        displayStyle: "list",
    },
});

/**
 * Renders a section (column) within the mega menu dropdown.
 * Can display a title, image, description, and list of menu items.
 */
export function MegaMenuSection({ section }: { section: MegaMenuSectionType }) {
    const {
        title,
        items,
        image,
        description,
        hideResourceImages,
        displayStyle,
    } = section;

    return (
        <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-0.5">
                {title && (
                    <Title
                        as="div"
                        variant="muted"
                        size="xs"
                        uppercase={true}
                        className="text-body uppercase leading-snug tracking-wider"
                    >
                        {title}
                    </Title>
                )}

                {image && (
                    <div className="aspect-4/3 w-full overflow-hidden rounded-lg bg-gray-100">
                        <ShopifyImage
                            data={image}
                            aspectRatio="4/3"
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                    </div>
                )}

                {description && (
                    <p className="line-clamp-2 text-body-subtle text-xs leading-snug">
                        {description}
                    </p>
                )}
            </div>

            {items.length > 0 && !isPromo(section) && (
                <>
                    <div className="mb-1 flex flex-col items-start justify-center">
                        <div className="w-2/3 border-line-subtle border-b transition-colors duration-300 ease-in-out group-hover/mega-menu:border-line"></div>
                    </div>

                    <div
                        className={cn(itemsContainerVariants({ displayStyle }))}
                    >
                        {items.map((item) => (
                            <MegaMenuItem
                                key={item.id}
                                item={item}
                                showResourceImage={!hideResourceImages}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
