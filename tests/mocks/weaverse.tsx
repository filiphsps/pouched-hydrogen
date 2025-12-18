import type React from "react";

const defaultThemeSettings = {
    pcardBorderRadius: 0,
    pcardImageRatio: "square",
    pcardTitlePricesAlignment: "vertical",
    pcardAlignment: "left",
    pcardShowVendor: true,
    pcardRemoveVendorFromTitle: false,
    pcardShowReviews: true,
    pcardShowLowestPrice: false,
    pcardShowSalePrice: true,
    pcardShowSaleBadge: true,
    pcardShowBundleBadge: true,
    pcardShowBestSellerBadge: true,
    pcardShowNewBadge: true,
    pcardShowOutOfStockBadge: true,
    pcardShowWishlist: true,
    pcardShowSubtitle: true,
    pcardShowAttributePills: true,
    // Stock urgency settings
    lowStockBadgeEnabled: true,
    lowStockThreshold: 10,
    lowStockBadgeColor: "#FEF3C7",
    // Search settings
    popularSearchKeywords: "Snus, Nicotine Pouches, Mint, Strong",
};

export const useThemeSettings = () => defaultThemeSettings;
export const createSchema = (schema: any) => schema;
export const useWeaverse = () => ({});
export const WeaverseHydrogenRoot = ({
    children,
}: {
    children: React.ReactNode;
}) => <>{children}</>;
