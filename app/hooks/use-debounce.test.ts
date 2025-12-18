import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    useDebounce,
    useDebouncedCallback,
    useDebouncedCallbackAdvanced,
} from "./use-debounce";

describe("useDebounce", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should return initial value immediately", () => {
        const { result } = renderHook(() => useDebounce("initial", 500));
        expect(result.current).toBe("initial");
    });

    it("should debounce value changes", () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            {
                initialProps: { value: "initial", delay: 500 },
            },
        );

        expect(result.current).toBe("initial");

        rerender({ value: "updated", delay: 500 });
        expect(result.current).toBe("initial");

        act(() => {
            vi.advanceTimersByTime(300);
        });
        expect(result.current).toBe("initial");

        act(() => {
            vi.advanceTimersByTime(200);
        });
        expect(result.current).toBe("updated");
    });

    it("should reset timer on rapid changes", () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            {
                initialProps: { value: "a", delay: 500 },
            },
        );

        rerender({ value: "b", delay: 500 });
        act(() => {
            vi.advanceTimersByTime(300);
        });

        rerender({ value: "c", delay: 500 });
        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current).toBe("a");

        act(() => {
            vi.advanceTimersByTime(200);
        });
        expect(result.current).toBe("c");
    });
});

describe("useDebouncedCallback", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should debounce callback execution", () => {
        const callback = vi.fn();
        const { result } = renderHook(() =>
            useDebouncedCallback(callback, 500),
        );

        act(() => {
            result.current("arg1");
        });
        expect(callback).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(500);
        });
        expect(callback).toHaveBeenCalledWith("arg1");
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should cancel previous calls on rapid invocations", () => {
        const callback = vi.fn();
        const { result } = renderHook(() =>
            useDebouncedCallback(callback, 500),
        );

        act(() => {
            result.current("a");
            result.current("b");
            result.current("c");
        });

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith("c");
    });

    it("should use latest callback reference", () => {
        const callback1 = vi.fn();
        const callback2 = vi.fn();

        const { result, rerender } = renderHook(
            ({ cb }) => useDebouncedCallback(cb, 500),
            {
                initialProps: { cb: callback1 },
            },
        );

        act(() => {
            result.current("test");
        });

        rerender({ cb: callback2 });

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).toHaveBeenCalledWith("test");
    });

    it("should cleanup timeout on unmount", () => {
        const callback = vi.fn();
        const { result, unmount } = renderHook(() =>
            useDebouncedCallback(callback, 500),
        );

        act(() => {
            result.current("test");
        });

        unmount();

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(callback).not.toHaveBeenCalled();
    });
});

describe("useDebouncedCallbackAdvanced", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should execute on trailing edge by default", () => {
        const callback = vi.fn();
        const { result } = renderHook(() =>
            useDebouncedCallbackAdvanced(callback, 500),
        );

        act(() => {
            result.current.debouncedFn("test");
        });

        expect(callback).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(callback).toHaveBeenCalledWith("test");
    });

    it("should execute on leading edge when enabled", () => {
        const callback = vi.fn();
        const { result } = renderHook(() =>
            useDebouncedCallbackAdvanced(callback, 500, { leading: true }),
        );

        act(() => {
            result.current.debouncedFn("first");
        });

        expect(callback).toHaveBeenCalledWith("first");
        expect(callback).toHaveBeenCalledTimes(1);

        act(() => {
            result.current.debouncedFn("second");
        });

        expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should execute both leading and trailing", () => {
        const callback = vi.fn();
        const { result } = renderHook(() =>
            useDebouncedCallbackAdvanced(callback, 500, {
                leading: true,
                trailing: true,
            }),
        );

        act(() => {
            result.current.debouncedFn("first");
        });

        expect(callback).toHaveBeenCalledWith("first");

        act(() => {
            result.current.debouncedFn("second");
            vi.advanceTimersByTime(500);
        });

        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenLastCalledWith("second");
    });

    it("should allow cancellation", () => {
        const callback = vi.fn();
        const { result } = renderHook(() =>
            useDebouncedCallbackAdvanced(callback, 500),
        );

        act(() => {
            result.current.debouncedFn("test");
            result.current.cancel();
            vi.advanceTimersByTime(500);
        });

        expect(callback).not.toHaveBeenCalled();
    });

    it("should execute only on leading edge when trailing is disabled", () => {
        const callback = vi.fn();
        const { result } = renderHook(() =>
            useDebouncedCallbackAdvanced(callback, 500, {
                leading: true,
                trailing: false,
            }),
        );

        act(() => {
            result.current.debouncedFn("first");
        });

        expect(callback).toHaveBeenCalledWith("first");

        act(() => {
            result.current.debouncedFn("second");
            vi.advanceTimersByTime(500);
        });

        expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should reset leading flag after delay", () => {
        const callback = vi.fn();
        const { result } = renderHook(() =>
            useDebouncedCallbackAdvanced(callback, 500, {
                leading: true,
                trailing: false,
            }),
        );

        act(() => {
            result.current.debouncedFn("first");
            vi.advanceTimersByTime(500);
        });

        act(() => {
            result.current.debouncedFn("second");
        });

        expect(callback).toHaveBeenCalledTimes(2);
    });
});
