import { Image } from "~/components/image";
import { cn } from "~/utils/cn";

/**
 * Partial image type that works with GraphQL fragments.
 */
interface PartialImage {
    url?: string;
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
    /** Secondary image to show on hover (optional) */
    secondaryImage?: PartialImage | null | undefined;
    /** Aspect ratio of the image container */
    aspectRatio?: "square" | "portrait" | "landscape" | "auto";
    /** Hover effect to apply */
    hoverEffect?: "zoom" | "fade" | "slide" | "none";
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

/** Aspect ratio Tailwind classes */
const ASPECT_CLASSES = {
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
    auto: "",
} as const;

/**
 * A reusable product card image component with advanced hover effects.
 * Features secondary image swap, gradient overlays, and smooth transitions.
 *
 * @param props - Component props
 * @returns Image container with hover effects
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
    if (!image?.url) {
        return null;
    }

    const altText = alt || image.altText || "Product image";
    const ratioValue = ASPECT_RATIOS[aspectRatio];
    const aspectClass = ASPECT_CLASSES[aspectRatio];
    const hasSecondaryImage = secondaryImage?.url;

    return (
        <div
            className={cn(
                "relative overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100/80",
                aspectClass,
                className,
            )}
        >
            {/* Primary Image */}
            <Image
                data={image}
                aspectRatio={ratioValue}
                width={700}
                alt={altText}
                loading="lazy"
                onLoad={onLoad}
                className={cn(
                    "h-full w-full p-4 transition-all duration-500 ease-out sm:p-5",
                    // Hover effects
                    hoverEffect === "zoom" &&
                        !hasSecondaryImage &&
                        "group-hover:scale-105",
                    hoverEffect === "fade" &&
                        hasSecondaryImage &&
                        "opacity-100 group-hover:opacity-0",
                    hoverEffect === "slide" &&
                        hasSecondaryImage &&
                        "group-hover:-translate-x-full translate-x-0",
                    // When secondary image exists with zoom effect, just do subtle zoom
                    hoverEffect === "zoom" &&
                        hasSecondaryImage &&
                        "group-hover:scale-105 group-hover:opacity-0",
                )}
                imageClassName="h-full w-full object-contain drop-shadow-sm"
            />

            {/* Secondary Image (shown on hover) */}
            {hasSecondaryImage && (
                <Image
                    data={secondaryImage}
                    aspectRatio={ratioValue}
                    width={700}
                    alt={`${altText} - alternate view`}
                    loading="lazy"
                    className={cn(
                        "absolute inset-0 h-full w-full p-4 transition-all duration-500 ease-out sm:p-5",
                        hoverEffect === "fade" &&
                            "opacity-0 group-hover:opacity-100",
                        hoverEffect === "slide" &&
                            "translate-x-full group-hover:translate-x-0",
                        hoverEffect === "zoom" &&
                            "scale-105 opacity-0 group-hover:scale-100 group-hover:opacity-100",
                    )}
                    imageClassName="h-full w-full object-contain drop-shadow-sm"
                />
            )}

            {/* Subtle gradient overlay for depth */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.02] via-transparent to-white/[0.03]" />

            {/* Loading overlay with improved animation */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/95 backdrop-blur-xs">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-500" />
                </div>
            )}
        </div>
    );
}
