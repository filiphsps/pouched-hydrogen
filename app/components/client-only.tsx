import { type ReactNode, useEffect, useState } from "react";

interface ClientOnlyProps {
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * A component that only renders its children on the client side.
 * Useful for components that generate random IDs or rely on browser-specific APIs
 * that cause hydration mismatches (e.g., Radix UI, certain motion components).
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
