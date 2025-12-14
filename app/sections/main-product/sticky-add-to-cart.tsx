import { Money, useOptimisticVariant } from "@shopify/hydrogen";
import { useEffect, useState } from "react";
import { useLoaderData } from "react-router";
import { AddToCartButton } from "~/components/product/add-to-cart-button";
import { ProductImage } from "~/components/product/product-image";
import { Title } from "~/components/title";
import type { loader as productRouteLoader } from "~/routes/products/product";
import { cn } from "~/utils/cn";
import { useProductQtyStore } from "./product-quantity-selector";

export function StickyAddToCart() {
    const { product } = useLoaderData<typeof productRouteLoader>();
    const { quantity } = useProductQtyStore();
    const [isVisible, setIsVisible] = useState(false);

    const selectedVariant = useOptimisticVariant(
        product.selectedOrFirstAvailableVariant,
        [],
    );

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Show sticky bar when ATC buttons are NOT intersecting (scrolled out of view)
                // and we are scrolled down (boundingClientRect.top < 0)
                setIsVisible(
                    !entry.isIntersecting && entry.boundingClientRect.top < 0,
                );
            },
            {
                threshold: 0,
                rootMargin: "-80px 0px 0px 0px", // Adjust based on header height
            },
        );

        const target = document.getElementById("atc-buttons");
        if (target) {
            observer.observe(target);
        }

        return () => {
            if (target) {
                observer.unobserve(target);
            }
        };
    }, []);

    if (!product || !selectedVariant) return null;

    const image = selectedVariant.image || product.featuredImage;

    return (
        <div
            className={cn(
                "fixed bottom-0 left-0 z-40 w-full border-t bg-background px-4 py-3 transition-transform duration-300 md:px-8",
                isVisible ? "translate-y-0" : "translate-y-full",
            )}
        >
            <div className="mx-auto flex max-w-(--page-width) items-center justify-between gap-4">
                <div className="hidden items-center gap-4 md:flex">
                    {image && (
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-sm border border-line-subtle">
                            <ProductImage
                                image={image}
                                size="thumbnail"
                                aspectRatio="1/1"
                                className="h-full w-full"
                            />
                        </div>
                    )}
                    <div>
                        <Title as="h3" size="sm" className="font-medium">
                            {product.title}
                        </Title>
                        <div className="text-body-subtle text-sm">
                            {selectedVariant.title !== "Default Title" &&
                                selectedVariant.title}
                        </div>
                    </div>
                </div>
                <div className="flex w-full items-center gap-4 md:w-auto">
                    <div className="hidden font-medium md:block">
                        <Money data={selectedVariant.price} />
                    </div>
                    <AddToCartButton
                        lines={[
                            {
                                merchandiseId: selectedVariant.id,
                                quantity,
                                selectedVariant,
                            },
                        ]}
                        className="w-full md:w-auto md:min-w-[200px]"
                        disabled={!selectedVariant.availableForSale}
                    >
                        {selectedVariant.availableForSale
                            ? "Add to Cart"
                            : "Sold Out"}
                    </AddToCartButton>
                </div>
            </div>
        </div>
    );
}
