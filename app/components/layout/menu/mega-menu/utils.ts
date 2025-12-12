import type { MegaMenuMetaobject } from "./types";

/**
 * Retrieves a field value from a Shopify Metaobject
 * @param node - The metaobject node
 * @param key - The field key to retrieve
 * @returns The field value or undefined
 */
export function getField(
    node: MegaMenuMetaobject,
    key: string,
): string | undefined {
    return node?.fields?.find((f) => f.key === key)?.value;
}

/**
 * Retrieves a reference field from a Shopify Metaobject
 * @param node - The metaobject node
 * @param key - The reference field key
 * @returns The referenced object or undefined
 */
export function getReference(node: MegaMenuMetaobject, key: string): any {
    return node?.fields?.find((f) => f.key === key)?.reference;
}

/**
 * Retrieves a list of references from a Shopify Metaobject
 * @param node - The metaobject node
 * @param key - The reference list field key
 * @returns Array of referenced nodes
 */
export function getReferenceList(
    node: MegaMenuMetaobject,
    key: string,
): MegaMenuMetaobject[] {
    return (node?.fields?.find((f) => f.key === key)?.references?.nodes ||
        []) as MegaMenuMetaobject[];
}

/**
 * Resolves a URL from a Shopify resource object
 * @param resource - The Shopify resource object (Product, Collection, Page, Blog, Article)
 * @returns The resolved URL path or undefined
 */
export function resolveUrlFromResource(resource: any): string | undefined {
    if (!resource) {
        return undefined;
    }

    const { handle, type, __typename } = resource;
    if (!handle) {
        return undefined;
    }

    const resourceType = type || __typename;
    switch (resourceType) {
        case "Product":
        case "ProductConnection":
            return `/products/${handle}`;
        case "Collection":
        case "CollectionConnection":
            return `/collections/${handle}`;
        case "Page":
        case "PageConnection":
            return `/pages/${handle}`;
        case "Blog":
        case "BlogConnection":
            return `/blogs/${handle}`;
        case "Article":
        case "ArticleConnection": {
            const blogHandle = resource.blog?.handle;
            // Articles require a blog handle. If missing, we can't form a valid URL.
            return blogHandle ? `/blogs/${blogHandle}/${handle}` : undefined;
        }
        default:
            return undefined;
    }
}

/**
 * Resolves an image from a Shopify resource object
 * Handles differences between Product (featuredImage) and other resources (image)
 * @param resource - The Shopify resource object
 * @returns The image object or undefined
 */
export function resolveImageFromResource(resource: any): any {
    return resource?.image || resource?.featuredImage;
}
