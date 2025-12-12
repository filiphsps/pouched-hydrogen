import type {
    ChildMenuItemFragment,
    MenuFragment,
    ParentMenuItemFragment,
} from "storefront-api.generated";

type EnhancedMenuItemProps = {
    to: string;
    target: string;
    isExternal?: boolean;
};

export type ChildEnhancedMenuItem = ChildMenuItemFragment &
    EnhancedMenuItemProps;

export type ParentEnhancedMenuItem = Omit<ParentMenuItemFragment, "items"> &
    EnhancedMenuItemProps & {
        items: ChildEnhancedMenuItem[];
    };

export type EnhancedMenu = Pick<MenuFragment, "id"> & {
    items: ParentEnhancedMenuItem[];
};

export interface SingleMenuItem {
    id: string;
    title: string;
    items: SingleMenuItem[];
    to: string;
    isExternal?: boolean;
    target: string;
    type: string;
    resource?: {
        image?: {
            altText: string;
            height: number;
            id: string;
            url: string;
            width: number;
        };
    };
}
