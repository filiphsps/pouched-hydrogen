import {
    ArrowLeftIcon,
    ArrowRightIcon,
    VideoCameraIcon,
} from "@phosphor-icons/react";
import { cva, type VariantProps } from "class-variance-authority";
import { useEffect, useState } from "react";
import type {
    Media_MediaImage_Fragment,
    Media_Video_Fragment,
    MediaFragment,
    ProductVariantFragment,
} from "storefront-api.generated";
import { FreeMode, Navigation, Pagination, Thumbs } from "swiper/modules";
import { Swiper, type SwiperClass, SwiperSlide } from "swiper/react";
import { Image } from "~/components/image";
import type { ImageAspectRatio } from "~/types/others";
import { cn } from "~/utils/cn";
import { calculateAspectRatio } from "~/utils/image";
import { ZoomButton, ZoomModal } from "./media-zoom";

const variants = cva(
    [
        "grid w-full gap-2 lg:gap-1",
        "lg:grid-cols-1",
        "grid-flow-col lg:grid-flow-row",
        "snap-x snap-mandatory scroll-px-6",
    ],
    {
        variants: {
            gridSize: {
                "1x1": "justify-items-center overflow-visible lg:justify-items-stretch [&>*]:w-full",
                "2x2": "justify-start overflow-x-scroll md:overflow-x-auto 2xl:grid-cols-2",
                mix: "justify-start overflow-x-scroll md:overflow-x-auto 2xl:grid-cols-2",
            },
        },
    },
);

export interface ProductMediaProps extends VariantProps<typeof variants> {
    mediaLayout: "grid" | "slider";
    imageAspectRatio?: ImageAspectRatio;
    showThumbnails: boolean;
    selectedVariant?: ProductVariantFragment | null;
    media: MediaFragment[];
    enableZoom?: boolean;
    zoomTrigger?: "image" | "button" | "both";
    zoomButtonVisibility?: "always" | "hover";
}

export function ProductMedia(props: ProductMediaProps) {
    const {
        mediaLayout: initialMediaLayout,
        gridSize: initialGridSize,
        showThumbnails,
        imageAspectRatio,
        selectedVariant,
        media,
        enableZoom,
        zoomTrigger = "button",
        zoomButtonVisibility = "hover",
    } = props;

    const [swiper, setSwiper] = useState<SwiperClass | null>(null);
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);
    const [zoomMediaId, setZoomMediaId] = useState<string | null>(null);
    const [zoomModalOpen, setZoomModalOpen] = useState(false);

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation> --- IGNORE ---
    useEffect(() => {
        if (selectedVariant && swiper) {
            const index = getSelectedVariantMediaIndex(media, selectedVariant);
            if (index !== swiper.activeIndex) {
                swiper.slideTo(index);
            }
        }
    }, [selectedVariant]);

    let mediaLayout = initialMediaLayout;
    let gridSize = initialGridSize;
    if (media.length === 1) {
        mediaLayout = "grid";
        gridSize = "1x1";
    }

    const shouldShowButton =
        enableZoom && (zoomTrigger === "button" || zoomTrigger === "both");
    const canClickImage =
        enableZoom && (zoomTrigger === "image" || zoomTrigger === "both");

    if (mediaLayout === "grid") {
        return (
            <>
                <div className={variants({ gridSize })}>
                    {media.map((med, idx) => (
                        <div
                            key={med.id}
                            className={cn(
                                "group relative",
                                gridSize === "1x1" ? "w-full" : "lg:w-full",
                                gridSize === "mix" &&
                                    idx % 3 === 0 &&
                                    "lg:col-span-2",
                            )}
                        >
                            <div
                                onClick={
                                    canClickImage
                                        ? () => {
                                              setZoomMediaId(med.id);
                                              setZoomModalOpen(true);
                                          }
                                        : undefined
                                }
                                className={
                                    canClickImage ? "cursor-zoom-in" : ""
                                }
                            >
                                <Media
                                    media={med}
                                    imageAspectRatio={imageAspectRatio}
                                    index={idx}
                                    className={cn(
                                        "max-w-none object-cover lg:h-full lg:w-full",
                                        gridSize === "1x1"
                                            ? "w-full"
                                            : "w-[80vw]",
                                        idx === 0 &&
                                            "[&_img]:[view-transition-name:image-expand]",
                                    )}
                                />
                            </div>
                            {shouldShowButton && (
                                <ZoomButton
                                    className={cn(
                                        "absolute top-2 right-2 md:top-4 md:right-4",
                                        zoomButtonVisibility === "hover" &&
                                            "opacity-0 group-hover:opacity-100",
                                    )}
                                    onClick={() => {
                                        setZoomMediaId(med.id);
                                        setZoomModalOpen(true);
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>
                {enableZoom && (
                    <ZoomModal
                        media={media}
                        zoomMediaId={zoomMediaId}
                        setZoomMediaId={setZoomMediaId}
                        open={zoomModalOpen}
                        onOpenChange={setZoomModalOpen}
                    />
                )}
            </>
        );
    }

    return (
        <div className="product-media-slider overflow-hidden">
            <div
                className={cn(
                    "flex items-start gap-4 overflow-hidden [--thumbs-width:0px]",
                    showThumbnails && "md:[--thumbs-width:8rem]",
                )}
            >
                {showThumbnails && (
                    <div
                        className={cn(
                            "hidden h-[450px] w-[calc(var(--thumbs-width,0px)-1rem)] shrink-0 opacity-0 transition-opacity duration-300 md:block",
                        )}
                    >
                        <Swiper
                            onSwiper={setThumbsSwiper}
                            direction="vertical"
                            spaceBetween={8}
                            slidesPerView={5}
                            watchSlidesProgress
                            rewind
                            freeMode
                            className="h-full w-full overflow-visible"
                            onInit={(sw) => {
                                if (!sw.el.parentElement) return;

                                sw.el.parentElement.style.opacity = "1";
                            }}
                            modules={[Navigation, Thumbs, FreeMode]}
                        >
                            {media.map(
                                ({
                                    id,
                                    previewImage,
                                    alt,
                                    mediaContentType,
                                }) => (
                                    <SwiperSlide
                                        key={id}
                                        className={cn(
                                            "relative",
                                            "h-auto! cursor-pointer border border-transparent p-1 transition-colors hover:border-line-subtle",
                                            "[&.swiper-slide-thumb-active]:border-line",
                                        )}
                                    >
                                        <Image
                                            data={{
                                                ...previewImage,
                                                altText: alt || "Product image",
                                            }}
                                            loading="lazy"
                                            width={200}
                                            aspectRatio="1/1"
                                            className="h-auto w-full object-cover"
                                            sizes="auto"
                                        />
                                        {mediaContentType === "VIDEO" && (
                                            <div className="absolute right-2 bottom-2 bg-gray-900 p-0.5 text-white">
                                                <VideoCameraIcon className="h-4 w-4" />
                                            </div>
                                        )}
                                    </SwiperSlide>
                                ),
                            )}
                        </Swiper>
                    </div>
                )}
                <div className="relative -my-6 w-[calc(100%-var(--thumbs-width,0px))] lg:my-0 lg:p-12">
                    <Swiper
                        onSwiper={setSwiper}
                        thumbs={{ swiper: thumbsSwiper }}
                        slidesPerView={1}
                        spaceBetween={4}
                        autoHeight
                        autoplay={{
                            delay: 2500,
                            disableOnInteraction: true,
                        }}
                        loop
                        navigation={{
                            nextEl: ".media_slider__next",
                            prevEl: ".media_slider__prev",
                        }}
                        pagination={{ type: "fraction" }}
                        modules={[Pagination, Navigation, Thumbs]}
                        className="overflow-visible md:overflow-hidden md:pb-0 lg:pb-10 [&_.swiper-pagination]:hidden"
                    >
                        {media.map((med, idx) => (
                            <SwiperSlide key={med.id} className="group">
                                <div
                                    onClick={
                                        canClickImage
                                            ? () => {
                                                  setZoomMediaId(med.id);
                                                  setZoomModalOpen(true);
                                              }
                                            : undefined
                                    }
                                    className={
                                        canClickImage ? "cursor-zoom-in" : ""
                                    }
                                >
                                    <Media
                                        media={med}
                                        imageAspectRatio={imageAspectRatio}
                                        index={idx}
                                        className={cn(
                                            idx === 0 &&
                                                "[&_img]:[view-transition-name:image-expand]",
                                        )}
                                    />
                                </div>
                                {shouldShowButton && (
                                    <ZoomButton
                                        className={cn(
                                            "absolute top-2 right-2 md:top-6 md:right-6",
                                            zoomButtonVisibility === "hover" &&
                                                "opacity-0 group-hover:opacity-100",
                                        )}
                                        onClick={() => {
                                            setZoomMediaId(med.id);
                                            setZoomModalOpen(true);
                                        }}
                                    />
                                )}
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    <div className="absolute right-6 bottom-6 z-1 hidden items-center gap-2 md:flex">
                        <button
                            type="button"
                            className="media_slider__prev left-6 rounded-full border border-transparent bg-background p-2 text-center text-gray-900 shadow-xs transition-all duration-200 hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:text-body-subtle"
                        >
                            <ArrowLeftIcon weight="bold" className="siz-4.5" />
                        </button>
                        <button
                            type="button"
                            className="media_slider__next right-6 rounded-full border border-transparent bg-background p-2 text-center text-gray-900 shadow-xs transition-all duration-200 hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:text-body-subtle"
                        >
                            <ArrowRightIcon weight="bold" className="siz-4.5" />
                        </button>
                    </div>
                </div>
            </div>
            {enableZoom && zoomMediaId && (
                <ZoomModal
                    media={media}
                    zoomMediaId={zoomMediaId}
                    setZoomMediaId={setZoomMediaId}
                    open={zoomModalOpen}
                    onOpenChange={setZoomModalOpen}
                />
            )}
        </div>
    );
}

function Media({
    media,
    imageAspectRatio,
    index,
    className,
}: {
    media: MediaFragment;
    imageAspectRatio?: ImageAspectRatio | null;
    index: number;
    className?: string;
}) {
    if (media.mediaContentType === "IMAGE") {
        const { image, alt } = media as Media_MediaImage_Fragment;
        if (!image || !imageAspectRatio) return null;

        return (
            <Image
                data={{ ...image, altText: alt || "Product image" }}
                loading={index === 0 ? "eager" : "lazy"}
                className={cn("h-auto w-full object-cover", className)}
                width={2048}
                aspectRatio={calculateAspectRatio(image, imageAspectRatio)}
                sizes="auto"
            />
        );
    }
    if (media.mediaContentType === "VIDEO") {
        const mediaVideo = media as Media_Video_Fragment;
        return (
            <video
                controls
                aria-label={mediaVideo.alt || "Product video"}
                className={cn("h-auto w-full object-cover", className)}
                style={{ aspectRatio: imageAspectRatio ?? undefined }}
                onError={console.error}
            >
                <track
                    kind="captions"
                    src={mediaVideo.sources[0].url}
                    label="English"
                    srcLang="en"
                    default
                />
                <source src={mediaVideo.sources[0].url} type="video/mp4" />
            </video>
        );
    }
    return null;
}

function getSelectedVariantMediaIndex(
    media: MediaFragment[],
    selectedVariant: ProductVariantFragment,
) {
    if (!selectedVariant) {
        return 0;
    }
    const mediaUrl = selectedVariant.image?.url;
    return media.findIndex((med) => med.previewImage?.url === mediaUrl);
}
