import {
    FacebookLogoIcon,
    InstagramLogoIcon,
    LinkedinLogoIcon,
    XLogoIcon,
} from "@phosphor-icons/react";
import { Image } from "@shopify/hydrogen";
import { useThemeSettings } from "@weaverse/hydrogen";
import { cva } from "class-variance-authority";
import { useTranslation } from "react-i18next";
import { useFetcher, useRouteLoaderData } from "react-router";
import { Banner } from "~/components/banner";
import { Button } from "~/components/button";
import { CookieSettingsPopup } from "~/components/compliance/cookie-settings-popup";
import Link from "~/components/link";
import { useShopMenu } from "~/hooks/use-shop-menu";
import { cn } from "~/utils/cn";
import { resolveWeaverseString } from "~/utils/weaverse";
import { CountrySelector } from "./country-selector";
import { FooterMenu } from "./menu/footer-menu";

const variants = cva("", {
    variants: {
        width: {
            full: "",
            stretch: "",
            fixed: "mx-auto max-w-(--page-width)",
        },
        padding: {
            full: "",
            stretch: "px-3 md:px-10 lg:px-16",
            fixed: "mx-auto px-3 md:px-4 lg:px-6",
        },
    },
});

export function Footer() {
    const { shopName } = useShopMenu();
    const { t } = useTranslation();
    const rootData = useRouteLoaderData<any>("root");
    const {
        footerWidth,
        socialFacebook,
        socialInstagram,
        socialLinkedIn,
        socialX,
        footerLogoData,
        footerLogoWidth,
        bio,
        copyright,
        addressTitle,
        storeAddress,
        storeEmail,
        newsletterTitle,
        newsletterDescription,
        newsletterPlaceholder,
        newsletterButtonText,
        cookieConsentEnabled = true,
        footerShowCookieSettings = true,
    } = useThemeSettings();
    const fetcher = useFetcher<{ ok: boolean; error: string }>();

    // Compute message and error from fetcher data
    const message = fetcher.data?.ok ? t("footer.signUpSuccess") : "";
    const error =
        fetcher.data && !fetcher.data.ok
            ? fetcher.data.error || t("footer.signUpError")
            : "";

    // Resolve copyright text with root data context
    const resolvedCopyright = resolveWeaverseString(copyright, {
        root: rootData,
    });

    const SOCIAL_ACCOUNTS = [
        {
            name: "Instagram",
            to: socialInstagram,
            Icon: InstagramLogoIcon,
        },
        {
            name: "X",
            to: socialX,
            Icon: XLogoIcon,
        },
        {
            name: "LinkedIn",
            to: socialLinkedIn,
            Icon: LinkedinLogoIcon,
        },
        {
            name: "Facebook",
            to: socialFacebook,
            Icon: FacebookLogoIcon,
        },
    ].filter((acc) => acc.to && acc.to.trim() !== "");

    return (
        <footer
            className={cn(
                "w-full bg-(--color-footer-bg) pt-9 text-(--color-footer-text) lg:pt-16",
                variants({ padding: footerWidth }),
            )}
        >
            <div
                className={cn(
                    "h-full w-full space-y-9",
                    variants({ width: footerWidth }),
                )}
            >
                <div className="space-y-9">
                    <div className="grid w-full gap-8 lg:grid-cols-3">
                        <div className="flex flex-col gap-6">
                            {footerLogoData ? (
                                <div
                                    className="relative"
                                    style={{ width: footerLogoWidth }}
                                >
                                    <Image
                                        data={footerLogoData}
                                        sizes="auto"
                                        width={500}
                                        className="h-full w-full object-contain object-left"
                                    />
                                </div>
                            ) : (
                                <div className="font-medium text-base uppercase">
                                    {shopName}
                                </div>
                            )}
                            {bio ? (
                                <div
                                    dangerouslySetInnerHTML={{ __html: bio }}
                                />
                            ) : null}
                            <div className="flex gap-4">
                                {SOCIAL_ACCOUNTS.map(({ to, name, Icon }) => (
                                    <Link
                                        key={name}
                                        to={to}
                                        target="_blank"
                                        className="flex items-center gap-2 text-lg"
                                    >
                                        <Icon className="h-5 w-5" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-6">
                            <div className="text-base">{addressTitle}</div>
                            <div className="space-y-2">
                                <p>{storeAddress}</p>
                                <p>
                                    {t("footer.email")}: {storeEmail}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-6">
                            <div className="text-base">{newsletterTitle}</div>
                            <div className="space-y-2">
                                <p>{newsletterDescription}</p>
                                <fetcher.Form
                                    action="/api/klaviyo"
                                    method="POST"
                                    encType="multipart/form-data"
                                >
                                    <div className="flex h-12 w-full items-center gap-1 rounded-full border border-line-subtle px-3 opacity-40 transition-color duration-300 focus-within:border-line focus-within:opacity-100 hover:opacity-60 focus-within:hover:border-line focus-within:hover:opacity-100">
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            placeholder={newsletterPlaceholder}
                                            className="flex-1 border-none bg-transparent px-2.5 focus:outline-hidden focus:ring-0"
                                        />
                                        <Button
                                            variant="outline"
                                            type="submit"
                                            loading={
                                                fetcher.state === "submitting"
                                            }
                                            className="h-full shrink-0 border-none font-medium text-(--color-footer-text) text-lg"
                                        >
                                            {newsletterButtonText}
                                        </Button>
                                    </div>
                                </fetcher.Form>
                                <div className="h-8">
                                    {message && (
                                        <Banner
                                            variant="success"
                                            className="mb-6"
                                        >
                                            {message}
                                        </Banner>
                                    )}
                                    {error && (
                                        <Banner
                                            variant="error"
                                            className="mb-6"
                                        >
                                            {error}
                                        </Banner>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <FooterMenu />
                </div>
                <div className="flex flex-col items-center justify-between gap-4 border-line-subtle border-t py-9 lg:flex-row">
                    <div className="flex items-center gap-4 [&>*:not(:first-child)]:before:mr-4 [&>*:not(:first-child)]:before:text-line-subtle [&>*:not(:first-child)]:before:content-['|']">
                        <CountrySelector />
                        {cookieConsentEnabled && footerShowCookieSettings && (
                            <CookieSettingsPopup />
                        )}
                    </div>
                    <div
                        dangerouslySetInnerHTML={{ __html: resolvedCopyright }}
                    />
                </div>
            </div>
        </footer>
    );
}
