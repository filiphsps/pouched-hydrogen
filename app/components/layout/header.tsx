import { MagnifyingGlassIcon, UserIcon } from "@phosphor-icons/react";
import { useThemeSettings } from "@weaverse/hydrogen";
import { cva } from "class-variance-authority";
import { Suspense, useEffect, useState } from "react";
import {
    Await,
    useLocation,
    useRouteError,
    useRouteLoaderData,
} from "react-router";
import { CartDrawer } from "~/components/cart/cart-drawer";
import Link from "~/components/link";
import type { RootLoader } from "~/root";
import { cn } from "~/utils/cn";
import { DEFAULT_LOCALE } from "~/utils/const";
import { Logo } from "./logo";
import { MegaMenu } from "./menu/mega-menu";
import { PredictiveSearchButton } from "./predictive-search";

const variants = cva("", {
    variants: {
        width: {
            full: "h-full w-full",
            stretch: "h-full w-full",
            fixed: "mx-auto h-full w-full max-w-(--page-width)",
        },
        padding: {
            full: "",
            stretch: "px-3 md:px-10 lg:px-16",
            fixed: "mx-auto px-3 md:px-4 lg:px-6",
        },
    },
});

function useIsHomeCheck() {
    const { pathname } = useLocation();
    const rootData = useRouteLoaderData<RootLoader>("root");
    const selectedLocale = rootData?.selectedLocale ?? DEFAULT_LOCALE;
    return pathname.replace(selectedLocale.pathPrefix ?? "", "") === "/";
}

export function Header() {
    const { headerWidth } = useThemeSettings();
    const isHome = useIsHomeCheck();
    // const { y } = useWindowScroll();
    const routeError = useRouteError();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        let lastScrolled = window.scrollY >= 50;
        setScrolled(lastScrolled);

        const handleScroll = () => {
            const isScrolled = window.scrollY >= 50;
            if (isScrolled !== lastScrolled) {
                setScrolled(isScrolled);
                lastScrolled = isScrolled;
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={cn(
                "z-10 h-(--height-nav) w-full border-line-subtle border-b bg-(--color-header-bg) text-(--color-header-text) transition-all duration-300 ease-in-out hover:bg-(--color-header-bg) hover:text-(--color-header-text)",
                variants({ padding: headerWidth }),
                scrolled ? "shadow-header" : "shadow-none",
                "sticky top-0",
                [
                    "[&_.cart-count]:text-(--color-header-bg)",
                    "[&_.cart-count]:bg-(--color-header-text)",
                    "[&_.main-logo]:opacity-100",
                    "[&_.transparent-logo]:opacity-0",
                ],
            )}
        >
            <div
                className={cn(
                    "flex h-full items-center justify-between gap-2 py-1.5 lg:gap-8 lg:py-3",
                    variants({ width: headerWidth }),
                )}
            >
                <Suspense key="mega-menu">
                    <MegaMenu />
                </Suspense>

                <Link to="/search" className="p-1.5 lg:hidden">
                    <MagnifyingGlassIcon className="h-5 w-5" />
                </Link>

                <Logo />

                <div className="z-1 flex items-center gap-1">
                    <PredictiveSearchButton />
                    <AccountLink className="relative flex h-8 w-8 items-center justify-center" />
                    <CartDrawer />
                </div>
            </div>
        </header>
    );
}

export function AccountLink({ className }: { className?: string }) {
    const rootData = useRouteLoaderData<RootLoader>("root");
    const isLoggedIn = rootData?.isLoggedIn;

    return (
        <Link to="/account" className={cn("transition-none", className)}>
            <Suspense fallback={<UserIcon className="h-5 w-5" />}>
                <Await
                    resolve={isLoggedIn}
                    errorElement={<UserIcon className="h-5 w-5" />}
                >
                    {(loggedIn) =>
                        loggedIn ? (
                            <UserIcon className="h-5 w-5" />
                        ) : (
                            <UserIcon className="h-5 w-5" />
                        )
                    }
                </Await>
            </Suspense>
        </Link>
    );
}
