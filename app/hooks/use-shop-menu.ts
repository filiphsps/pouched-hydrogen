import { useRouteLoaderData } from "react-router";
import type { RootLoader } from "~/root";
import type { EnhancedMenu } from "~/types/menu";

/**
 * Hook to access shop menu data from the root loader.
 *
 * @returns Shop menu data including shop name, header menu, and footer menu
 */
export function useShopMenu() {
    const data = useRouteLoaderData<RootLoader>("root");
    const shopName = data?.layout?.shop?.name;
    const headerMenu = data?.layout?.headerMenu as EnhancedMenu;
    const footerMenu = data?.layout?.footerMenu as EnhancedMenu;
    const megaMenu = data?.layout?.megaMenu;
    return {
        shopName,
        headerMenu,
        footerMenu,
        megaMenu,
    };
}
