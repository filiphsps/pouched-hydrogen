import type {
    Article,
    Blog,
    Collection,
    Page,
    Product,
} from "@shopify/hydrogen/storefront-api-types";
import type {
    ChildEnhancedMenuItem,
    ParentEnhancedMenuItem,
} from "~/types/menu";

export interface MetaobjectField {
    key: string;
    value?: string;
    reference?: any;
    references?: {
        nodes: any[];
    };
}

export interface MegaMenuMetaobject {
    id: string;
    fields: MetaobjectField[];
}

export type ShopifyResource =
    | Partial<Product>
    | Partial<Collection>
    | Partial<Page>
    | Partial<Blog>
    | Partial<Article>;

/**
 * Represents a clickable link item within a mega menu section
 */
export type MegaMenuLink = {
    id: string;
    title: string;
    to?: string;
    product?: Partial<Product>;
    collection?: Partial<Collection>;
    page?: Partial<Page>;
    article?: Partial<Article>;
    image?: any;
    description?: string;
    badge?: string;
};

/**
 * Represents a column/section within the mega menu dropdown
 */
export type MegaMenuSection = {
    id: string;
    title?: string;
    items: MegaMenuLink[];
    displayStyle?: "list" | "grid" | "promo";
    image?: any;
    description?: string;
    hideResourceImages?: boolean;
};

/**
 * Union type representing either a standard menu item or an enhanced mega menu item
 */
export type MergedMenuItem =
    | ParentEnhancedMenuItem
    | (Omit<ParentEnhancedMenuItem, "items"> & {
          items: MegaMenuSection[] | ChildEnhancedMenuItem[];
          isMegaMenu?: boolean;
      });
