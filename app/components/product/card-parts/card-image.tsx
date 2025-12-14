import { useState } from "react";
import { Image } from "~/components/image";
import { cn } from "~/utils/cn";

/**
 * Partial image type that works with GraphQL fragments.
 */
interface PartialImage {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
    id?: string;
}

/**
 * Props for the CardImage component.
 */
export interface CardImageProps {
    /** Primary image to display */
    image: PartialImage | null | undefined;
    /** Secondary image for hover swap effect */
    secondaryImage?: PartialImage | null;
    /** Aspect ratio of the image container */
    aspectRatio?: "square" | "portrait" | "landscape" | "auto";
    /** Hover effect to apply */
    hoverEffect?: "zoom" | "swap" | "none";
    /** Alt text override */
    alt?: string;
    /** Additional CSS classes */
    className?: string;
    /** Whether the image is currently loading */
    isLoading?: boolean;
    /** Callback when image loads */
    onLoad?: () => void;
}

/** Aspect ratio CSS values */
const ASPECT_RATIOS = {
    square: "1/1",
    portrait: "3/4",
    landscape: "4/3",
    auto: "auto",
} as const;

/**
 * A reusable product card image component with hover effects.
 * Supports image swap on hover, zoom effects, and various aspect ratios.
 *
 * @param props - Component props
 * @returns Image container with optional hover effects
 */
export function CardImage({
    image,
    secondaryImage,
    aspectRatio = "square",
    hoverEffect = "zoom",
    alt,
    className,
    isLoading = false,
    onLoad,
}: CardImageProps) {
    const [isHovered, setIsHovered] = useState(false);

    if (!image?.url) {
        return null;
    }

    const altText = alt || image.altText || "Product image";
    const showSwap = hoverEffect === "swap" && secondaryImage?.url;

    return (
        <div
            className={cn(
                "relative overflow-hidden bg-gray-100",
                aspectRatio !== "auto" &&
                    `aspect-[${ASPECT_RATIOS[aspectRatio]}]`,
                className,
            )}
            style={
                aspectRatio !== "auto"
                    ? { aspectRatio: ASPECT_RATIOS[aspectRatio] }
                    : undefined
            }
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Primary Image */}
            <Image
                data={image}
                width={700}
                alt={altText}
                loading="lazy"
                onLoad={onLoad}
                className={cn(
                    "h-full w-full object-contain p-4 transition-all duration-300",
                    hoverEffect === "zoom" && "group-hover:scale-105",
                    showSwap && isHovered && "opacity-0",
                )}
            />

            {/* Secondary Image (for swap effect) */}
            {showSwap && (
                <Image
                    data={secondaryImage}
                    width={700}
                    alt={`${altText} - alternate view`}
                    loading="lazy"
                    className={cn(
                        "absolute inset-0 h-full w-full object-contain p-4 transition-opacity duration-300",
                        isHovered ? "opacity-100" : "opacity-0",
                    )}
                />
            )}

            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
                </div>
            )}
        </div>
    );
}
