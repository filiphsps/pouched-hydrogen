import type { AppLoadContext } from "react-router";

/**
 * Helper function to assert the context type in loaders/actions.
 *
 * React Router 7's generated Route.LoaderArgs types don't automatically
 * pick up the augmented AppLoadContext from env.d.ts. This helper casts
 * the context to our augmented AppLoadContext type.
 *
 * @param context - The context from Route.LoaderArgs or Route.ActionArgs
 * @returns The context typed as AppLoadContext
 */
export function getContext(context: unknown): AppLoadContext {
    return context as AppLoadContext;
}
