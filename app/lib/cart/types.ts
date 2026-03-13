import type { CartApiQueryFragment } from "storefront-api.generated";

/** Response shape from the cart route action. */
export interface CartActionResponse {
    cart?: CartApiQueryFragment;
    userErrors?: Array<{ message: string }>;
    errors?: Array<{ message: string }>;
    warnings?: Array<{ message: string }>;
    action?: string;
}

/** Optional callbacks for cart mutation hooks. */
export interface CartMutationOptions {
    /** Called when the mutation completes successfully (no userErrors). */
    onSuccess?: (cart: CartApiQueryFragment) => void;
    /** Called when the mutation returns userErrors. */
    onError?: (errors: Array<{ message: string }>) => void;
}

/** Return type for all cart mutation hooks. */
export interface CartMutationResult<TArgs extends unknown[] = unknown[]> {
    /** Trigger the mutation. */
    mutate: (...args: TArgs) => void;
    /** Whether the fetcher is submitting or loading. */
    isLoading: boolean;
    /** User-facing errors from the last response. */
    userErrors: Array<{ message: string }>;
    /** Raw response data from the last mutation. */
    data: CartActionResponse | null;
    /** Clear the fetcher response data. */
    reset: () => void;
}
