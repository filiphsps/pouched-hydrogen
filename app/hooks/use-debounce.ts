import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Creates a debounced version of a value.
 *
 * The returned value only updates after the specified delay has passed
 * without any new value changes. Useful for reducing the frequency of
 * expensive operations triggered by rapidly changing values.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds before the value updates
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * function SearchInput() {
 *   const [searchTerm, setSearchTerm] = useState('');
 *   const debouncedSearchTerm = useDebounce(searchTerm, 300);
 *
 *   useEffect(() => {
 *     // Only triggers 300ms after user stops typing
 *     performSearch(debouncedSearchTerm);
 *   }, [debouncedSearchTerm]);
 *
 *   return <input onChange={e => setSearchTerm(e.target.value)} />;
 * }
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Creates a debounced callback function.
 *
 * The callback will only be executed after the specified delay has passed
 * since the last invocation. Previous pending invocations are cancelled.
 * This is useful for event handlers that shouldn't fire on every event.
 *
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds before execution
 * @returns A debounced version of the callback
 *
 * @example
 * ```tsx
 * function SearchInput() {
 *   const handleSearch = useDebouncedCallback((query: string) => {
 *     performSearch(query);
 *   }, 300);
 *
 *   return <input onChange={e => handleSearch(e.target.value)} />;
 * }
 * ```
 */
export function useDebouncedCallback<
    T extends (...args: Parameters<T>) => void,
>(callback: T, delay: number): (...args: Parameters<T>) => void {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const callbackRef = useRef(callback);

    // Keep callback ref up to date
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // Cleanup on unmount
    useEffect(
        () => () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        },
        [],
    );

    return useCallback(
        (...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                callbackRef.current(...args);
            }, delay);
        },
        [delay],
    );
}

/**
 * Creates a debounced callback with immediate execution option.
 *
 * When `leading` is true, the function executes immediately on the first call,
 * then ignores subsequent calls within the delay period.
 *
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds
 * @param options - Configuration options
 * @param options.leading - If true, execute on the leading edge (default: false)
 * @param options.trailing - If true, execute on the trailing edge (default: true)
 * @returns A debounced version of the callback with cancel method
 *
 * @example
 * ```tsx
 * function SubmitButton() {
 *   const { debouncedFn, cancel } = useDebouncedCallbackAdvanced(
 *     () => submitForm(),
 *     1000,
 *     { leading: true, trailing: false } // Prevents double-click submissions
 *   );
 *
 *   return <button onClick={debouncedFn}>Submit</button>;
 * }
 * ```
 */
export function useDebouncedCallbackAdvanced<
    T extends (...args: Parameters<T>) => void,
>(
    callback: T,
    delay: number,
    options: { leading?: boolean; trailing?: boolean } = {},
): { debouncedFn: (...args: Parameters<T>) => void; cancel: () => void } {
    const { leading = false, trailing = true } = options;
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const callbackRef = useRef(callback);
    const hasLeadingRef = useRef(false);

    // Keep callback ref up to date
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // Cleanup on unmount
    useEffect(
        () => () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        },
        [],
    );

    const cancel = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        hasLeadingRef.current = false;
    }, []);

    const debouncedFn = useCallback(
        (...args: Parameters<T>) => {
            // Execute on leading edge
            if (leading && !hasLeadingRef.current) {
                hasLeadingRef.current = true;
                callbackRef.current(...args);
            }

            // Clear existing timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Set trailing timeout
            timeoutRef.current = setTimeout(() => {
                hasLeadingRef.current = false;
                if (trailing) {
                    callbackRef.current(...args);
                }
            }, delay);
        },
        [delay, leading, trailing],
    );

    return { debouncedFn, cancel };
}
