import { redirect } from "react-router";
import type { Route } from "./+types/catch-all";

// fallback wild card for all unauthenticated routes in account section
export async function loader({ context }: Route.LoaderArgs) {
    await context.customerAccount.handleAuthStatus();
    return redirect("/account");
}
