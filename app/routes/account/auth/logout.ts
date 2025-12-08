import { type AppLoadContext, redirect } from "react-router";
import { getContext } from "~/types/context";
import type { Route } from "./+types/logout";

export async function doLogout(context: AppLoadContext) {
    return context.customerAccount.logout();
}

export async function loader({ params }: Route.LoaderArgs) {
    const locale = params.locale;
    return redirect(locale ? `/${locale}` : "/");
}

export async function action({ context: ctx }: Route.ActionArgs) {
    const context = getContext(ctx);
    return doLogout(context);
}
