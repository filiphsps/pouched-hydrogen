import { createSchema, type WeaverseLoaderData } from "@weaverse/hydrogen";
import clsx from "clsx";
import React, { isValidElement, useMemo } from "react";
import { useLoaderData } from "react-router";
import {
    ProductMedia,
    type ProductMediaProps,
} from "~/components/product/product-media";
import { layoutInputs, Section, type SectionProps } from "~/components/section";
import type { loader as productRouteLoader } from "~/routes/products/product";
import { isCombinedListing } from "~/utils/combined-listings";
import { StickyAddToCart } from "./sticky-add-to-cart";

interface ProductInformationData
    extends Omit<ProductMediaProps, "selectedVariant" | "media"> {
    ref: React.Ref<HTMLDivElement>;
}

export default function ProductInformation(
    props: ProductInformationData & SectionProps,
) {
    const {
        ref,
        mediaLayout,
        gridSize,
        imageAspectRatio,
        showThumbnails,
        children,
        enableZoom,
        zoomTrigger,
        zoomButtonVisibility,
        ...rest
    } = props;

    const loaderData = useLoaderData<typeof productRouteLoader>();
    const weaverseData = (
        loaderData as {
            weaverseData?: WeaverseLoaderData & { items?: Record<string, any> };
        }
    ).weaverseData;
    const { product } = loaderData;

    const combinedListing = isCombinedListing(product);

    // Create a map of ID -> Type from the Weaverse data
    // This handles cases where items are stored in an array or indexed by number but referenced by UUID
    const idToTypeMap = useMemo(() => {
        const map = new Map<string, string>();
        if (weaverseData?.page?.items) {
            // Iterate over values because keys might be numeric indices
            for (const item of Object.values(weaverseData.page.items)) {
                if ((item as any)?.id && (item as any)?.type) {
                    map.set((item as any).id, (item as any).type);
                }
            }
        }
        if (weaverseData?.items) {
            for (const item of Object.values(weaverseData.items)) {
                if ((item as any)?.id && (item as any)?.type) {
                    map.set((item as any).id, (item as any).type);
                }
            }
        }
        return map;
    }, [weaverseData]);

    if (!product) {
        return (
            <div ref={ref} {...rest}>
                No product data...
            </div>
        );
    }

    const { handle } = product;
    const mediaBelowChildren: React.ReactNode[] = [];
    const detailsChildren: React.ReactNode[] = [];

    React.Children.forEach(children, (child) => {
        if (isValidElement(child)) {
            const childProps = child.props as Record<string, unknown>;

            // Extract ID
            const childId = (childProps.id ||
                (childProps.data as any)?.id ||
                (childProps.item as any)?.id) as string | undefined;

            // Strategy 1: Static Type Check
            let resolvedType = ((child.type as { weaverseType?: string })
                ?.weaverseType ||
                (typeof childProps.type === "string"
                    ? childProps.type
                    : undefined)) as string | undefined;

            // Strategy 2: ID Map Lookup
            if (!resolvedType && childId) {
                resolvedType = idToTypeMap.get(childId);
            }

            // Strategy 3: Props Fallback
            if (!resolvedType) {
                resolvedType =
                    (childProps.item as any)?.type ||
                    (childProps.data as any)?.type;
            }

            // Fallback: JSON Scan
            if (
                !resolvedType &&
                JSON.stringify(childProps).includes("mp--media-below")
            ) {
                resolvedType = "mp--media-below";
            }

            if (resolvedType === "mp--media-below") {
                mediaBelowChildren.push(child);
            } else {
                detailsChildren.push(child);
            }
        }
    });

    return (
        <Section ref={ref} {...rest} overflow="unset" className="bg-gray-100">
            <div
                className={clsx([
                    "space-y-3 lg:grid lg:grid-cols-[1fr_clamp(360px,55%,550px)] lg:gap-[clamp(30px,5%,60px)] lg:space-y-0",
                ])}
            >
                {/* Left Column: Media + Below Content */}
                <div className="flex min-w-0 flex-col gap-3">
                    <ProductMedia
                        key={handle}
                        mediaLayout={mediaLayout}
                        gridSize={gridSize}
                        imageAspectRatio={imageAspectRatio}
                        media={
                            combinedListing && product?.featuredImage
                                ? [
                                      {
                                          __typename: "MediaImage",
                                          id: product.featuredImage.id || "",
                                          mediaContentType: "IMAGE",
                                          alt: product.featuredImage.altText,
                                          previewImage: product.featuredImage,
                                          image: product.featuredImage,
                                      },
                                      ...(product?.media?.nodes || []),
                                  ]
                                : product?.media?.nodes || []
                        }
                        selectedVariant={
                            product?.selectedOrFirstAvailableVariant
                        }
                        showThumbnails={showThumbnails}
                        enableZoom={enableZoom}
                        zoomTrigger={zoomTrigger}
                        zoomButtonVisibility={zoomButtonVisibility}
                    />
                    {/* Render content below media (Left Column) */}
                    {mediaBelowChildren}
                </div>

                {/* Right Column: Sticky Details */}
                <div>
                    <div
                        // Full-width on mobile
                        className="-mx-4 sticky flex w-screen flex-col justify-start gap-5 rounded-none bg-background p-4 shadow-xs lg:mx-0 lg:w-auto lg:rounded-2xl lg:p-8"
                        style={{ top: "calc(var(--height-nav) + 20px)" }}
                    >
                        {detailsChildren}
                    </div>
                </div>
            </div>

            <StickyAddToCart />
        </Section>
    );
}

export const schema = createSchema({
    type: "main-product",
    title: "Main product",
    childTypes: [
        "mp--breadcrumb",
        "mp--badges",
        "mp--vendor",
        "mp--title",
        "mp--prices",
        "judgeme-stars-rating",
        "mp--summary",
        "mp--description",
        "mp--bundled-variants",
        "mp--variant-selector",
        "mp--quantity-selector",
        "mp--selling-plan-selector",
        "mp--quantity-breaks",
        "mp--attribute-bar",
        "mp--facts",
        "mp--atc-buttons",
        "mp--collapsible-details",
        "mp--media-below",
    ],
    limit: 1,
    enabledOn: {
        pages: ["PRODUCT"],
    },
    settings: [
        { group: "Layout", inputs: layoutInputs },
        {
            group: "Product Media",
            inputs: [
                {
                    type: "select",
                    name: "imageAspectRatio",
                    label: "Aspect ratio",
                    defaultValue: "adapt",
                    configs: {
                        options: [
                            { value: "adapt", label: "Adapt to image" },
                            { value: "1/1", label: "Square (1/1)" },
                            { value: "3/4", label: "Portrait (3/4)" },
                            { value: "4/3", label: "Landscape (4/3)" },
                        ],
                    },
                },
                {
                    type: "toggle-group",
                    name: "mediaLayout",
                    label: "Layout",
                    configs: {
                        options: [
                            {
                                label: "Grid",
                                value: "grid",
                                icon: "grid-2x2",
                            },
                            {
                                label: "Slider",
                                value: "slider",
                                icon: "slideshow-outline",
                            },
                        ],
                    },
                    defaultValue: "grid",
                },
                {
                    type: "select",
                    name: "gridSize",
                    label: "Grid size",
                    defaultValue: "2x2",
                    configs: {
                        options: [
                            { label: "1x1", value: "1x1" },
                            { label: "2x2", value: "2x2" },
                            { label: "Mix", value: "mix" },
                        ],
                    },
                    condition: (data: ProductInformationData) =>
                        data.mediaLayout === "grid",
                },
                {
                    label: "Show thumbnails",
                    name: "showThumbnails",
                    type: "switch",
                    defaultValue: true,
                    condition: (data: ProductInformationData) =>
                        data.mediaLayout === "slider",
                },
                {
                    label: "Enable zoom",
                    name: "enableZoom",
                    type: "switch",
                    defaultValue: true,
                },
                {
                    type: "select",
                    name: "zoomTrigger",
                    label: "Zoom trigger",
                    defaultValue: "both",
                    configs: {
                        options: [
                            { value: "image", label: "Click on image" },
                            { value: "button", label: "Click on zoom button" },
                            { value: "both", label: "Both" },
                        ],
                    },
                    condition: (data: ProductInformationData) =>
                        data.enableZoom === true,
                },
                {
                    type: "select",
                    name: "zoomButtonVisibility",
                    label: "When to show zoom button",
                    defaultValue: "hover",
                    configs: {
                        options: [
                            { value: "always", label: "Always" },
                            { value: "hover", label: "On hover" },
                        ],
                    },
                    condition: (data: ProductInformationData) =>
                        data.enableZoom === true &&
                        (data.zoomTrigger === "button" ||
                            data.zoomTrigger === "both"),
                },
            ],
        },
    ],
    presets: {
        mediaLayout: "grid",
        gridSize: "2x2",
        children: [
            {
                type: "mp--breadcrumb",
                homeText: "Home",
            },
            {
                type: "mp--badges",
            },
            {
                type: "mp--vendor",
            },
            {
                type: "mp--title",
                headingTag: "h1",
            },
            {
                type: "mp--prices",
                showCompareAtPrice: true,
            },
            {
                type: "judgeme-stars-rating",
            },
            {
                type: "mp--summary",
            },
            {
                type: "mp--description",
            },
            {
                type: "mp--bundled-variants",
                headingText: "Bundled Products",
                headingClassName: "text-2xl",
            },
            {
                type: "mp--variant-selector",
            },
            {
                type: "mp--quantity-selector",
            },
            {
                type: "mp--selling-plan-selector",
            },
            {
                type: "mp--atc-buttons",
                addBundleToCartText: "Add bundle to cart",
                soldOutText: "Sold out",
                showShopPayButton: true,
                buttonClassName: "w-full uppercase",
            },
            {
                type: "mp--collapsible-details",
                showShippingPolicy: true,
                showRefundPolicy: true,
            },
        ],
    },
});
