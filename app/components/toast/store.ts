/** Toast variant matching the Banner component's color scheme. */
export type ToastVariant = "error" | "success" | "info";

/** A single toast notification. */
export interface Toast {
    /** Unique identifier for the toast. */
    id: string;
    /** Message to display. */
    message: string;
    /** Visual variant. */
    variant: ToastVariant;
    /** Auto-dismiss duration in milliseconds. */
    duration: number;
}

const VARIANT_STYLES: Record<ToastVariant, string> = {
    error: "background:#b91c1c;color:#fff",
    success: "background:#15803d;color:#fff",
    info: "background:#1f2937;color:#fff",
};

let toastId = 0;

/**
 * Creates the toast container element in the DOM if it doesn't exist.
 * This is independent of React's render tree so it survives hydration errors.
 */
function getOrCreateContainer(): HTMLElement | null {
    if (typeof document === "undefined") return null;

    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.style.cssText =
            "position:fixed;inset-inline:0;bottom:1.5rem;z-index:9999;display:flex;flex-direction:column;align-items:center;gap:0.5rem;pointer-events:none;margin:0 auto;width:fit-content;max-width:90vw";
        document.body.appendChild(container);
    }
    return container;
}

/**
 * Renders a toast directly into the DOM, bypassing React.
 * Survives hydration errors, error boundaries, and re-renders.
 */
function showToast(message: string, variant: ToastVariant, duration = 4000) {
    const container = getOrCreateContainer();
    if (!container) return;

    const id = `toast-${++toastId}`;
    const el = document.createElement("div");
    el.id = id;
    el.role = "alert";
    el.style.cssText = `${VARIANT_STYLES[variant]};display:flex;align-items:center;gap:0.75rem;border-radius:0.5rem;padding:0.75rem 1rem;box-shadow:0 4px 12px rgba(0,0,0,.15);font-size:0.875rem;font-weight:500;pointer-events:auto;animation:toast-slide-up 200ms ease-out`;

    const text = document.createElement("span");
    text.textContent = message;
    el.appendChild(text);

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.ariaLabel = "Dismiss";
    closeBtn.style.cssText =
        "margin-left:auto;flex-shrink:0;border-radius:9999px;padding:2px;background:none;border:none;color:inherit;cursor:pointer;opacity:0.8;font-size:14px;line-height:1";
    closeBtn.textContent = "\u2715";
    closeBtn.addEventListener("click", () => dismiss(el));
    el.appendChild(closeBtn);

    container.appendChild(el);

    // Auto-dismiss
    setTimeout(() => dismiss(el), duration);
}

/** Fade out and remove a toast element. */
function dismiss(el: HTMLElement) {
    if (!el.parentNode) return;
    el.style.opacity = "0";
    el.style.transition = "opacity 200ms ease-out";
    setTimeout(() => el.remove(), 200);
}

/** Inject the slide-up keyframe once. */
function ensureKeyframes() {
    if (typeof document === "undefined") return;
    if (document.getElementById("toast-keyframes")) return;
    const style = document.createElement("style");
    style.id = "toast-keyframes";
    style.textContent =
        "@keyframes toast-slide-up{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}";
    document.head.appendChild(style);
}

if (typeof document !== "undefined") {
    ensureKeyframes();
}

/**
 * Imperative toast API. Works anywhere — inside React components,
 * callbacks, or outside the React tree entirely.
 */
export const toast = {
    error: (message: string, duration?: number) =>
        showToast(message, "error", duration),
    success: (message: string, duration?: number) =>
        showToast(message, "success", duration),
    info: (message: string, duration?: number) =>
        showToast(message, "info", duration),
};
