import type { Image as ImageType } from "@shopify/hydrogen/storefront-api-types";
import { useState } from "react";
import { Image } from "~/components/image";
import { cn } from "~/utils/cn";

/**
 * Size presets for product images with corresponding width values.
 */
const SIZE_CONFIG = {
    thumbnail: { width: 100, sizes: "100px" },
    small: { width: 250, sizes: "(min-width: 48em) 200px, 100px" },
    medium: { width: 500, sizes: "(min-width: 48em) 400px, 250px" },
    large: {
        width: 700,
        sizes: "(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw",
    },
} as const;

/**
 * Data structure for product image from Shopify GraphQL.
 */
export type ProductImageData = Partial<
    Pick<ImageType, "url" | "altText" | "width" | "height" | "id">
>;

/**
 * Props for the ProductImage component.
 */
export interface ProductImageProps {
    /** Image data from Shopify GraphQL */
    image: ProductImageData | null | undefined;
    /** Size preset for srcset/width. Defaults to 'medium'. */
    size?: keyof typeof SIZE_CONFIG;
    /** Aspect ratio (e.g., '1/1', '4/3'). Defaults to '1/1'. */
    aspectRatio?: string;
    /** Additional CSS class names */
    className?: string;
    /** Alt text override. Falls back to image.altText then generic text. */
    alt?: string;
    /** Loading strategy. Defaults to 'lazy'. */
    loading?: "lazy" | "eager";
    /** Callback fired when image loads successfully */
    onLoad?: () => void;
    /** Callback fired when image fails to load */
    onError?: () => void;
}

/**
 * A specialized image component for product images with Safari compatibility fixes.
 *
 * Features:
 * - Explicit width/height attributes for Safari layout stability
 * - CSS aspect-ratio with padding-bottom fallback for older browsers
 * - Consistent sizing presets for various use cases
 * - Error handling with fallback support
 * - Blur loading effect via base Image component
 *
 * @example
 * ```tsx
 * <ProductImage
 *   image={product.featuredImage}
 *   size="large"
 *   aspectRatio="1/1"
 *   alt={product.title}
 * />
 * ```
 *
 * @param props - The component props
 * @returns A product image element or null if no image data
 */
export function ProductImage({
    image,
    size = "medium",
    aspectRatio = "1/1",
    className,
    alt,
    loading = "lazy",
    onLoad,
    onError,
}: ProductImageProps) {
    const [hasError, setHasError] = useState(false);

    // Return null if no image data or if image failed to load
    if (!image?.url || hasError) {
        return null;
    }

    const sizeConfig = SIZE_CONFIG[size];
    const altText = alt || image.altText || "Product image";

    /**
     * Handles image load errors by setting error state
     * and calling the optional onError callback.
     */
    const handleError = () => {
        setHasError(true);
        onError?.();
    };

    return (
        <div
            className={cn(
                // Base container styles
                "relative overflow-hidden",
                // Safari fix: use aspect-ratio with fallback padding trick
                // Safari 14.1+ supports aspect-ratio, older versions use padding
                "aspect-[var(--product-image-ratio)] supports-[aspect-ratio]:aspect-[var(--product-image-ratio)]",
                className,
            )}
            style={
                {
                    // CSS custom property for aspect ratio
                    "--product-image-ratio": aspectRatio,
                    // Fallback padding for older Safari (before 14.1)
                    // Only applies when aspect-ratio is not supported
                    paddingBottom: `calc(100% / (${aspectRatio.replace("/", " / ")}))`,
                } as React.CSSProperties
            }
        >
            <Image
                data={{
                    ...image,
                    altText,
                }}
                width={sizeConfig.width}
                // Explicit height based on aspect ratio for Safari
                height={calculateHeight(sizeConfig.width, aspectRatio)}
                sizes={sizeConfig.sizes}
                loading={loading}
                className={cn(
                    // Absolute positioning to work with aspect-ratio container
                    "absolute inset-0 h-full w-full",
                    // Object-fit with webkit prefix for Safari
                    "object-contain",
                    // Safari-specific: ensure image respects container bounds
                    "[&>img]:h-full [&>img]:w-full [&>img]:object-contain",
                )}
                onLoad={onLoad}
                onError={handleError}
            />
        </div>
    );
}

/**
 * Calculates the height based on width and aspect ratio string.
 *
 * @param width - The image width
 * @param aspectRatio - Aspect ratio string (e.g., '1/1', '4/3')
 * @returns The calculated height
 */
function calculateHeight(width: number, aspectRatio: string): number {
    const [w, h] = aspectRatio.split("/").map(Number);
    if (!w || !h) {
        return width; // Default to square if invalid ratio
    }
    return Math.round((width * h) / w);
}
