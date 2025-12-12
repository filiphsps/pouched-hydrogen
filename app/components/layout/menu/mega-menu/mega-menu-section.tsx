import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { createContext, useContext } from "react";
import { Image as ShopifyImage } from "~/components/image";
import { isPromo } from "~/components/layout/menu/mega-menu/mega-menu-content";
import Link from "~/components/link";
import { Title } from "~/components/title";
import { cn } from "~/utils/cn";
import { MegaMenuItem } from "./mega-menu-item";
import type { MegaMenuSection as MegaMenuSectionType } from "./types";
import { getResource, resolveUrlFromResource } from "./utils";

const itemsContainerVariants = cva("", {
    variants: {
        displayStyle: {
            list: "flex flex-col gap-5",
            grid: "grid grid-cols-2 gap-3",
            promo: "flex flex-col gap-5",
        },
    },
    defaultVariants: {
        displayStyle: "list",
    },
});

/**
 * Context to track if we're inside NavigationMenu.
 * Used to make MegaMenuItem work in both desktop (with NavigationMenu) and mobile (without).
 */
const NavigationMenuContext = createContext(false);
export const NavigationMenuProvider = NavigationMenuContext.Provider;

/**
 * Renders a section (column) within the mega menu dropdown.
 * Can display a title, image, description, and list of menu items.
 */
export function MegaMenuSection({ section }: { section: MegaMenuSectionType }) {
    const {
        label,
        items,
        image,
        description,
        hideResourceImages,
        displayStyle,
    } = section;

    const isInNavigationMenu = useContext(NavigationMenuContext);
    const isPromoSection = isPromo(section);

    // If we're a promo, try to get a link from the first item.
    const to: string | undefined =
        isPromoSection && items[0]
            ? items[0].to || resolveUrlFromResource(getResource(items[0]))
            : undefined;

    const content = (
        <div
            className={cn(
                "flex h-full flex-col gap-2.5",
                isPromoSection &&
                    cn(
                        "overflow-hidden rounded-2xl",
                        Boolean(to) &&
                            "ring-0 ring-line transition-all duration-200 hover:ring-2 hover:ring-offset-2",
                    ),
            )}
        >
            <div
                className={cn(
                    "flex flex-col gap-0.5",
                    isPromoSection && "h-full",
                )}
            >
                {label && (
                    <Title
                        as="div"
                        variant="muted"
                        size="lg"
                        uppercase={true}
                        className="font-medium text-border leading-tight tracking-tight"
                    >
                        {label}
                    </Title>
                )}

                {image && (
                    <div
                        className={cn(
                            "w-full overflow-hidden rounded-lg",
                            isPromoSection && "flex-1",
                        )}
                    >
                        <ShopifyImage
                            data={image}
                            className={cn(
                                "h-full min-h-full w-full bg-gray-100 object-cover object-center",
                                Boolean(to) &&
                                    "transition-transform duration-500 hover:scale-105",
                                isPromoSection && "aspect-4/3",
                            )}
                        />
                    </div>
                )}

                {description && (
                    <p className="line-clamp-2 font-normal text-muted-foreground text-xs leading-snug">
                        {description}
                    </p>
                )}
            </div>

            {items.length > 0 && !isPromoSection && (
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

    if (!to) {
        return content;
    }

    const linkElement = (
        <Link to={to} className="contents">
            {content}
        </Link>
    );

    // Only use NavigationMenu.Link if we're inside a NavigationMenu context
    if (isInNavigationMenu) {
        return <NavigationMenu.Link asChild>{linkElement}</NavigationMenu.Link>;
    }

    return linkElement;
}
