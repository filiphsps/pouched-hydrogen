import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { createContext, useContext } from "react";
import { Image as ShopifyImage } from "~/components/image";
import Link from "~/components/link";
import Paragraph from "~/components/paragraph";
import { RevealUnderline } from "~/components/reveal-underline";
import { Title } from "~/components/title";
import { cn } from "~/utils/cn";
import type { MegaMenuLink } from "./types";
/**
 * Context to track if we're inside NavigationMenu.
 * Used to make MegaMenuItem work in both desktop (with NavigationMenu) and mobile (without).
 */
import {
    getResource,
    resolveImageFromResource,
    resolveUrlFromResource,
} from "./utils";

/**
 * Context to track if we're inside NavigationMenu.
 * Used to make MegaMenuItem work in both desktop (with NavigationMenu) and mobile (without).
 */
const NavigationMenuContext = createContext(false);
export const NavigationMenuProvider = NavigationMenuContext.Provider;

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
        label,
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

    const displayTitle = label || title;

    const content = (
        <>
            {hasImage && (
                <div className="relative z-10 mt-0.5 shrink-0 rounded-md bg-gray-100">
                    <ShopifyImage
                        data={displayImage}
                        width={64}
                        height={64}
                        className="size-12 object-contain object-center"
                    />
                </div>
            )}
            <RevealUnderline
                as="div"
                enabled={Boolean(to)}
                className="flex flex-col gap-0.5 bg-position-[left_calc(1em+3px)]"
            >
                <Title
                    as="div"
                    variant="default"
                    size="base"
                    uppercase={false}
                    className={cn(
                        "font-medium text-border leading-tight tracking-tight transition-colors duration-200 group-hover/mega-menu-item:text-body",
                    )}
                >
                    {displayTitle}
                </Title>

                {description && (
                    <Paragraph
                        size="xs"
                        className="line-clamp-2 text-body-subtle leading-snug transition-colors duration-200 group-hover/mega-menu-item:text-body"
                        content={description}
                    />
                )}
            </RevealUnderline>
        </>
    );

    if (!to) {
        return <div className="flex items-start gap-3">{content}</div>;
    }

    const linkElement = (
        <Link
            to={to}
            className="group/mega-menu-item hover:-m-1 flex items-start gap-3 rounded-xl ring-0 ring-line transition-all duration-200 hover:z-5 hover:bg-gray-100 hover:p-1 hover:ring-2 hover:ring-offset-2"
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
