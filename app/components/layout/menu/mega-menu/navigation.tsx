import { CaretDownIcon, XIcon } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useState } from "react";
import { CountrySelector } from "~/components/layout/country-selector";
import Link from "~/components/link";
import { ScrollArea } from "~/components/scroll-area";
import { cn } from "~/utils/cn";
import { AccountLink } from "./account-link";
import { MegaMenuContent } from "./mega-menu-content";
import { NavigationMenuProvider } from "./mega-menu-item";
import { useMergedMenuData } from "./use-merged-menu-data";

/**
 * Unified Navigation component that handles both mobile and desktop rendering.
 * Uses Tailwind responsive classes to show/hide appropriate UI at different breakpoints.
 *
 * Mobile (< lg): Dialog drawer slides in from left, triggered by children
 * Desktop (>= lg): Horizontal NavigationMenu with mega menu dropdowns
 *
 * Both modes use the same MegaMenuContent component for true feature parity.
 *
 * @param children - Trigger button for mobile drawer (hidden on desktop)
 */
export function Navigation({ children }: { children: ReactNode }) {
    const items = useMergedMenuData();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [menuId, setMenuId] = useState<string>();

    if (!items?.length) return null;

    return (
        <>
            {/* Mobile Drawer Navigation (< lg) */}
            <div className="lg:hidden">
                <Dialog.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                    <Dialog.Trigger asChild>{children}</Dialog.Trigger>
                    <Dialog.Portal>
                        <AnimatePresence>
                            {isDrawerOpen && (
                                <>
                                    <Dialog.Overlay asChild>
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                                        />
                                    </Dialog.Overlay>
                                    <Dialog.Content asChild>
                                        <motion.div
                                            initial={{ x: "-100%" }}
                                            animate={{ x: "0%" }}
                                            exit={{ x: "-100%" }}
                                            transition={{
                                                type: "spring",
                                                damping: 25,
                                                stiffness: 200,
                                            }}
                                            className={cn(
                                                "fixed inset-y-0 left-0 z-50 w-full",
                                                "border-line-subtle border-r bg-(--color-header-bg) shadow-xl",
                                                "focus:outline-hidden",
                                            )}
                                        >
                                            <div className="flex h-full flex-col">
                                                <div className="flex items-center justify-between border-line-subtle border-b px-6 py-4">
                                                    <Dialog.Title>
                                                        {/* TODO: Add store logo here. */}
                                                    </Dialog.Title>
                                                    <Dialog.Description className="sr-only">
                                                        Mobile navigation menu
                                                    </Dialog.Description>
                                                    <Dialog.Close asChild>
                                                        <button
                                                            type="button"
                                                            className="-mr-2 p-2 text-body-subtle transition-colors hover:text-body"
                                                        >
                                                            <XIcon className="h-5 w-5" />
                                                        </button>
                                                    </Dialog.Close>
                                                </div>

                                                <ScrollArea className="flex-1">
                                                    <div className="flex flex-col gap-6 p-4">
                                                        {items.map(
                                                            (menuItem) => {
                                                                const childItems =
                                                                    (
                                                                        menuItem as any
                                                                    ).items ||
                                                                    [];
                                                                const hasChildren =
                                                                    childItems.length >
                                                                    0;
                                                                const isMega = (
                                                                    menuItem as any
                                                                ).isMegaMenu;

                                                                return (
                                                                    <div
                                                                        key={
                                                                            menuItem.id
                                                                        }
                                                                        className="flex flex-col gap-2"
                                                                    >
                                                                        <Link
                                                                            to={
                                                                                menuItem.to
                                                                            }
                                                                            onClick={() =>
                                                                                setIsDrawerOpen(
                                                                                    false,
                                                                                )
                                                                            }
                                                                            className="font-semibold text-base text-body"
                                                                        >
                                                                            {
                                                                                menuItem.title
                                                                            }
                                                                        </Link>
                                                                        {hasChildren && (
                                                                            <MegaMenuContent
                                                                                items={
                                                                                    isMega
                                                                                        ? childItems
                                                                                        : [
                                                                                              {
                                                                                                  id: `${menuItem.id}-default`,
                                                                                                  items: childItems,
                                                                                                  displayStyle:
                                                                                                      "list",
                                                                                              },
                                                                                          ]
                                                                                }
                                                                            />
                                                                        )}
                                                                    </div>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                </ScrollArea>
                                                <div className="flex flex-col gap-4 border-line-subtle border-t p-4">
                                                    <AccountLink
                                                        onClose={() =>
                                                            setIsDrawerOpen(
                                                                false,
                                                            )
                                                        }
                                                    />
                                                    <CountrySelector className="w-full" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    </Dialog.Content>
                                </>
                            )}
                        </AnimatePresence>
                    </Dialog.Portal>
                </Dialog.Root>
            </div>

            {/* Desktop Horizontal Navigation (>= lg) */}
            <NavigationMenuProvider value={true}>
                <NavigationMenu.Root
                    value={menuId}
                    onValueChange={setMenuId}
                    delayDuration={200}
                    skipDelayDuration={1500}
                    className="lg:-translate-x-1/2 relative z-50 lg:absolute lg:left-1/2"
                >
                    <NavigationMenu.List className="z-50 hidden h-full gap-2 lg:flex">
                        {items.map((menuItem) => {
                            const { id, title, to } = menuItem;

                            const childItems = (menuItem as any).items || [];
                            const hasSubmenu = childItems.length > 0;
                            const isMega = (menuItem as any).isMegaMenu;

                            return (
                                <NavigationMenu.Item key={id} value={id}>
                                    <NavigationMenu.Trigger
                                        className={cn(
                                            "group flex select-none items-center justify-between gap-1 rounded-full px-3 py-2 font-medium text-sm leading-none outline-none transition-colors",
                                            "hover:bg-gray-100/50 focus:bg-gray-100/50",
                                            "data-[state=open]:bg-gray-100",
                                            "text-body",
                                        )}
                                    >
                                        {hasSubmenu ? (
                                            <>
                                                <span className="font-medium">
                                                    {title}
                                                </span>
                                                <CaretDownIcon
                                                    className="relative top-px h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180"
                                                    aria-hidden="true"
                                                    weight="bold"
                                                />
                                            </>
                                        ) : (
                                            <Link
                                                to={to}
                                                className="font-medium transition-none"
                                            >
                                                {title}
                                            </Link>
                                        )}
                                    </NavigationMenu.Trigger>

                                    {hasSubmenu && (
                                        <NavigationMenu.Content
                                            className={cn(
                                                "fade-in-80 zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 absolute top-0 left-0 w-max animate-in data-[state=closed]:animate-out",
                                                "rounded-xl border border-line-subtle bg-white shadow-xl",
                                                "max-w-[min(90vw,1500px)]",
                                            )}
                                        >
                                            <MegaMenuContent
                                                items={
                                                    isMega
                                                        ? childItems
                                                        : [
                                                              {
                                                                  id: `${id}-default`,
                                                                  items: childItems,
                                                                  displayStyle:
                                                                      "list",
                                                              },
                                                          ]
                                                }
                                            />
                                        </NavigationMenu.Content>
                                    )}
                                </NavigationMenu.Item>
                            );
                        })}
                    </NavigationMenu.List>

                    <div className="perspective-[2500px] -translate-x-1/2 absolute top-full left-1/2 flex w-screen justify-center">
                        <NavigationMenu.Viewport
                            className={cn(
                                "relative mt-2 h-(--radix-navigation-menu-viewport-height) w-full origin-[top_center] overflow-hidden rounded-xl border border-line-subtle bg-white shadow-xl transition-[width,height] duration-300 data-[state=closed]:animate-scale-out data-[state=open]:animate-scale-in sm:w-(--radix-navigation-menu-viewport-width)",
                            )}
                        />
                    </div>
                </NavigationMenu.Root>
            </NavigationMenuProvider>
        </>
    );
}
