import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { createContext, useContext } from "react";
import { Image as ShopifyImage } from "~/components/image";
import Link from "~/components/link";
import Paragraph from "~/components/paragraph";
import { Title } from "~/components/title";
import { cn } from "~/utils/cn";
import type { MegaMenuLink } from "./types";
/**
 * Context to track if we're inside NavigationMenu.
 * Used to make MegaMenuItem work in both desktop (with NavigationMenu) and mobile (without).
 */
import { resolveImageFromResource, resolveUrlFromResource } from "./utils";

/**
 * Context to track if we're inside NavigationMenu.
 * Used to make MegaMenuItem work in both desktop (with NavigationMenu) and mobile (without).
 */
const NavigationMenuContext = createContext(false);
export const NavigationMenuProvider = NavigationMenuContext.Provider;

const getResource = ({
    product,
    collection,
    page,
}: Pick<MegaMenuLink, "product" | "collection" | "page">) => {
    if (product) {
        return {
            __typename: "Product",
            ...product,
        };
    }

    if (collection) {
        return {
            __typename: "Collection",
            ...collection,
        };
    }

    if (page) {
        return {
            __typename: "Page",
            ...page,
        };
    }

    /*if (article) {
        return {
            __typename: "Article",
            ...article,
        };
    }*/

    return null;
};

/**
 * Renders a single menu item within a mega menu section.
 * Displays title, optional description, and optional image.
 * Works both inside NavigationMenu (desktop) and standalone (mobile).
 */
export function MegaMenuItem({
    item,
    showResourceImage = true,
}: {
    item: MegaMenuLink;
    showResourceImage?: boolean;
}) {
    const {
        title,
        to: rawTo,
        product,
        collection,
        page,
        description,
        image,
    } = item;
    const resource = getResource(item);
    const to = rawTo || resolveUrlFromResource(resource);

    const displayImage =
        image ||
        (showResourceImage ? resolveImageFromResource(resource) : null);
    const hasImage = Boolean(displayImage);
    const isInNavigationMenu = useContext(NavigationMenuContext);

    const content = (
        <>
            {hasImage && (
                <div className="relative z-10 mt-0.5 shrink-0 rounded-md bg-gray-100">
                    <ShopifyImage
                        data={displayImage}
                        width={40}
                        height={40}
                        className="h-10 w-10 object-contain"
                    />
                </div>
            )}
            <div className="flex flex-col gap-0.5">
                <Title
                    as="div"
                    variant="default"
                    size="sm"
                    className={cn(
                        "text-body",
                        to && "transition-colors group-hover:text-primary",
                    )}
                >
                    {title}
                </Title>

                {description && (
                    <Paragraph
                        size="xs"
                        className="line-clamp-2 text-body-subtle leading-snug"
                        content={description}
                    />
                )}
            </div>
        </>
    );

    if (!to) {
        return <div className="flex items-start gap-3">{content}</div>;
    }

    const linkElement = (
        <Link
            to={to}
            className="group hover:-m-2.5 hover:-my-1.5 flex items-start gap-3 rounded-none transition-all duration-300 ease-out hover:rounded-xl hover:bg-gray-100 hover:p-2.5 hover:py-1.5"
        >
            {content}
        </Link>
    );

    // Only use NavigationMenu.Link if we're inside a NavigationMenu context
    if (isInNavigationMenu) {
        return <NavigationMenu.Link asChild>{linkElement}</NavigationMenu.Link>;
    }

    return linkElement;
}
