import { User as UserIcon } from "@phosphor-icons/react";
import { Suspense } from "react";
import { Await, useRouteLoaderData } from "react-router";
import Link from "~/components/link";
import type { RootLoader } from "~/root";

/**
 * Renders the account/login link in the mobile menu.
 * Shows "Account" for logged-in users, "Login" otherwise.
 */
export function AccountLink({ onClose }: { onClose: () => void }) {
    const rootData = useRouteLoaderData<RootLoader>("root");
    const isLoggedIn = rootData?.isLoggedIn;

    return (
        <Link
            to="/account"
            onClick={onClose}
            className="flex items-center gap-2 rounded-md py-3 font-medium text-body text-lg transition-colors hover:bg-gray-100/50"
        >
            <UserIcon className="h-5 w-5" />
            <Suspense fallback="Account">
                <Await resolve={isLoggedIn} errorElement="Account">
                    {(loggedIn) => (loggedIn ? "Account" : "Login")}
                </Await>
            </Suspense>
        </Link>
    );
}
