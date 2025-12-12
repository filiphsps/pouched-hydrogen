import { CaretRight as CaretRightIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Image as ShopifyImage } from "~/components/image";
import Link from "~/components/link";
import type {
    ChildEnhancedMenuItem,
    ParentEnhancedMenuItem,
} from "~/types/menu";
import { cn } from "~/utils/cn";

/**
 * Renders a collapsible menu item for the mobile drawer.
 * Supports nested items with smooth expand/collapse animations.
 */
export function CollapsibleMenuItem({
    item,
    onClose,
}: {
    item: ParentEnhancedMenuItem | ChildEnhancedMenuItem;
    onClose: () => void;
}) {
    const { title, to } = item;
    const resource = "resource" in item ? (item as any).resource : undefined;
    const items = "items" in item ? (item as any).items : undefined;
    const [isExpanded, setIsExpanded] = useState(false);

    const hasImage = Boolean(resource?.image);
    const hasItems = items && items.length > 0;
    const hasChildrenWithImages =
        hasItems && items.some((child: any) => Boolean(child.resource?.image));

    if (!hasItems) {
        if (hasImage) {
            return (
                <Link
                    to={to}
                    onClick={onClose}
                    className="group flex flex-col gap-2 rounded-md transition-colors hover:bg-gray-100/50"
                >
                    <div className="aspect-video w-full overflow-hidden rounded-md bg-gray-100">
                        <ShopifyImage
                            data={resource?.image}
                            aspectRatio="16/9"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                    <span className="font-medium text-body text-sm">
                        {title}
                    </span>
                </Link>
            );
        }

        return (
            <Link
                to={to}
                onClick={onClose}
                className="block w-full rounded-md py-3 font-medium text-body text-lg transition-colors hover:bg-gray-100/50"
            >
                {title}
            </Link>
        );
    }

    return (
        <div className="overflow-hidden">
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex w-full items-center justify-between rounded-md py-3 text-left font-medium text-body text-lg transition-colors hover:bg-gray-100/50"
            >
                <span>{title}</span>
                <motion.span
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <CaretRightIcon className="h-5 w-5 text-body-subtle" />
                </motion.span>
            </button>
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div
                            className={cn(
                                "my-1 ml-2 border-line-subtle border-l-2 pb-2 pl-4",
                                hasChildrenWithImages
                                    ? "grid grid-cols-2 gap-2"
                                    : "space-y-1",
                            )}
                        >
                            {hasImage && (
                                <Link
                                    to={to}
                                    onClick={onClose}
                                    className={cn(
                                        "group mb-4 block overflow-hidden rounded-md bg-gray-100",
                                        hasChildrenWithImages && "col-span-2",
                                    )}
                                >
                                    <div className="aspect-video w-full overflow-hidden">
                                        <ShopifyImage
                                            data={resource?.image}
                                            aspectRatio="16/9"
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-2 font-medium text-body text-sm group-hover:underline">
                                        Shop All {title}
                                    </div>
                                </Link>
                            )}
                            {items.map((childItem: any) => (
                                <CollapsibleMenuItem
                                    key={childItem.id}
                                    item={childItem}
                                    onClose={onClose}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
