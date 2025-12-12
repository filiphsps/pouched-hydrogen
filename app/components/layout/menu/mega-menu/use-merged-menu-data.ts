import { useThemeSettings } from "@weaverse/hydrogen";
import { useShopMenu } from "~/hooks/use-shop-menu";
import { normalizeTextEnding } from "~/utils/text";
import type {
    MegaMenuLink,
    MegaMenuMetaobject,
    MegaMenuSection,
    MergedMenuItem,
} from "./types";
import {
    getField,
    getReference,
    getReferenceList,
    resolveUrlFromResource,
} from "./utils";

/**
 * Hook that merges native Shopify menu data with Metaobject-based mega menu configuration.
 * Matches menu items by title and replaces them with enhanced mega menu structure when available.
 *
 * @returns Array of merged menu items with mega menu enhancements
 */
export function useMergedMenuData(): MergedMenuItem[] {
    const { headerMenu, megaMenu } = useShopMenu();
    const settings = useThemeSettings();
    const descriptionMode = (settings?.menuDescriptionMode || "as_is") as any;
    const descriptionEnding = (settings?.menuDescriptionEnding ||
        ".") as string;

    if (!headerMenu) return [];

    return headerMenu.items.map((nativeItem) => {
        // Cast the mega menu node to our typed interface
        const megaMenuObject = megaMenu
            ?.nodes?.[0] as unknown as MegaMenuMetaobject;
        const megaMenuItems = getReferenceList(megaMenuObject, "items");

        const match = megaMenuItems.find((megaItem) => {
            const megaTitle = getField(megaItem, "title");
            const titleMatch =
                megaTitle?.toLowerCase().trim() ===
                nativeItem.title.toLowerCase().trim();
            const labelMatch =
                getField(megaItem, "trigger_label")?.toLowerCase().trim() ===
                nativeItem.title.toLowerCase().trim();
            return titleMatch || labelMatch;
        });

        if (!match) {
            return nativeItem;
        }

        const dropdownContent = getReferenceList(match, "dropdown_content");

        const sections: MegaMenuSection[] = dropdownContent.map((section) => {
            const linksRef = getReferenceList(section, "links");
            const sectionTitle = getField(section, "title");
            const sectionLabel = getField(section, "label");
            const description = normalizeTextEnding(
                getField(section, "description"),
                descriptionMode,
                descriptionEnding,
            );
            const displayStyle =
                (getField(
                    section,
                    "display_style",
                ) as MegaMenuSection["displayStyle"]) || "list";
            const hideResourceImages =
                (getField(section, "hide_resource_images") || "false") ===
                "true";

            const links: MegaMenuLink[] = linksRef.map((menuLinkMetaobject) => {
                const customTitle = getField(menuLinkMetaobject, "title");
                const label = getField(menuLinkMetaobject, "label");
                const productRef = getReference(menuLinkMetaobject, "product");
                const collectionRef = getReference(
                    menuLinkMetaobject,
                    "collection",
                );
                const pageRef = getReference(menuLinkMetaobject, "page");
                const blogRef = getReference(menuLinkMetaobject, "blog");
                const articleRef = getReference(menuLinkMetaobject, "article");

                const resource =
                    productRef ||
                    collectionRef ||
                    pageRef ||
                    blogRef ||
                    articleRef;

                const customUrl = getField(menuLinkMetaobject, "url");
                const normalizedDescription = normalizeTextEnding(
                    getField(menuLinkMetaobject, "description"),
                    descriptionMode,
                    descriptionEnding,
                );
                const badge = getField(menuLinkMetaobject, "badge");
                const image = getReference(menuLinkMetaobject, "image")?.image;

                let to = customUrl;
                let title = customTitle;

                if (resource && !to) {
                    to = resolveUrlFromResource(resource);
                }

                if (resource && !title) {
                    title = resource.title;
                }

                return {
                    id: menuLinkMetaobject.id,
                    title: title || "Untitled",
                    label,
                    to,
                    product: productRef,
                    collection: collectionRef,
                    page: pageRef,
                    article: articleRef,
                    image,
                    description: normalizedDescription,
                    badge,
                };
            });

            return {
                id: section.id,
                title: sectionTitle,
                label: sectionLabel,
                items: links,
                displayStyle,
                image: getReference(section, "image")?.image,
                description,
                hideResourceImages,
            };
        });

        return {
            ...nativeItem,
            items: sections,
            isMegaMenu: true,
        };
    });
}
