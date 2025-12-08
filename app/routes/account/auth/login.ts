import type { Route } from "./+types/login";

export async function loader({ context }: Route.LoaderArgs) {
    return context.customerAccount.login();
}
