import type React from "react";

export const useThemeSettings = () => ({
    pcardBorderRadius: 8,
    pcardShowImageOnHover: true,
    pcardImageRatio: "square",
    pcardTitlePricesAlignment: "vertical",
    pcardAlignment: "left",
    pcardShowVendor: true,
    pcardRemoveVendorFromTitle: false,
    pcardShowReviews: true,
    pcardShowLowestPrice: false,
    pcardShowSalePrice: true,
    pcardEnableQuickShop: true,
    pcardShowQuickShopOnHover: true,
    pcardQuickShopButtonType: "icon",
    pcardQuickShopButtonText: "Add to cart",
    pcardQuickShopPanelType: "drawer",
    pcardShowSaleBadge: true,
    pcardShowBundleBadge: true,
    pcardShowBestSellerBadge: true,
    pcardShowNewBadge: true,
    pcardShowOutOfStockBadge: true,
    pcardShowWishlist: true,
    pcardShowSubtitle: true,
    pcardShowAttributePills: true,
});

export const createSchema = (schema: any) => schema;
export const useWeaverse = () => ({});
export const WeaverseHydrogenRoot = ({
    children,
}: {
    children: React.ReactNode;
}) => <>{children}</>;
