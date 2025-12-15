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
    /** Aspect ratio of the image container */
    aspectRatio?: "square" | "portrait" | "landscape" | "auto";
    /** Hover effect to apply */
    hoverEffect?: "zoom" | "none";
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
 * Uses Image component with aspectRatio for proper sizing.
 *
 * @param props - Component props
 * @returns Image container with optional hover effects
 */
export function CardImage({
    image,
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

    return (
        <div
            className={cn(
                "relative aspect-square overflow-hidden rounded-xl bg-gray-100 transition-colors duration-300 group-hover:bg-white",
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
                    "p-2 transition-all duration-300",
                    hoverEffect === "zoom" && "group-hover:scale-105",
                )}
                imageClassName={cn("aspect-square object-contain")}
            />

            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
                </div>
            )}
        </div>
    );
}
