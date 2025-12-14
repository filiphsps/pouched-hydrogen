import { XIcon } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import type { ReactNode } from "react";
import { Button } from "~/components/button";
import { cn } from "~/utils/cn";

/**
 * Props for the ModalContainer component.
 */
export interface ModalContainerProps {
    /** Whether the modal is open */
    open: boolean;
    /** Callback when modal open state changes */
    onOpenChange: (open: boolean) => void;
    /** Modal title for accessibility (visually hidden) */
    title: string;
    /** Content to render inside the modal */
    children: ReactNode;
    /** Maximum width of the modal container */
    maxWidth?: string | number;
    /** Maximum height of the modal (default: 90vh) */
    maxHeight?: string;
    /** Additional class names for the modal container */
    className?: string;
    /** Whether to show the close button */
    showCloseButton?: boolean;
    /** Animation style */
    animation?: "slide-up" | "scale" | "fade";
}

/**
 * Reusable modal container component.
 * Provides consistent modal styling and behavior across the application.
 * Used by QuickShop and CartModal for unified experience.
 *
 * @example
 * ```tsx
 * <ModalContainer
 *     open={isOpen}
 *     onOpenChange={setOpen}
 *     title="Quick Shop"
 *     maxWidth={768}
 * >
 *     <YourContent />
 * </ModalContainer>
 * ```
 */
export function ModalContainer({
    open,
    onOpenChange,
    title,
    children,
    maxWidth = "var(--breakpoint-xl)",
    maxHeight = "90vh",
    className,
    showCloseButton = true,
    animation = "slide-up",
}: ModalContainerProps) {
    /**
     * Gets the animation class based on animation prop.
     * @returns Tailwind animation class string
     */
    function getAnimationClass(): string {
        switch (animation) {
            case "scale":
                return "data-[state=open]:animate-[scale-in_200ms_ease-out] data-[state=closed]:animate-[scale-out_150ms_ease-in]";
            case "fade":
                return "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out";
            default:
                return "[--slide-up-from:20px] data-[state=open]:animate-slide-up";
        }
    }

    /**
     * Handles click on backdrop to close modal.
     * Only closes when clicking directly on the backdrop, not on modal content.
     */
    function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>): void {
        const target = e.target as HTMLElement;
        if (target.classList.contains("modal-backdrop")) {
            onOpenChange(false);
        }
    }

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay
                    className={cn(
                        "fixed inset-0 z-10 bg-black/50",
                        "data-[state=open]:animate-fade-in",
                        "data-[state=closed]:animate-fade-out",
                    )}
                />
                <Dialog.Content
                    onCloseAutoFocus={(e) => e.preventDefault()}
                    className={cn(
                        "modal-backdrop",
                        "fixed inset-0 z-10 flex items-center justify-center overflow-x-hidden px-4",
                        "backdrop-blur-xs",
                        getAnimationClass(),
                    )}
                    onClick={handleBackdropClick}
                    aria-describedby={undefined}
                >
                    {showCloseButton && (
                        <Dialog.Close asChild>
                            <Button
                                className="absolute top-3 right-3 z-10 rounded-full p-2"
                                variant="secondary"
                            >
                                <XIcon size={18} />
                            </Button>
                        </Dialog.Close>
                    )}
                    <div
                        style={{
                            maxHeight,
                            maxWidth:
                                typeof maxWidth === "number"
                                    ? `${maxWidth}px`
                                    : maxWidth,
                        }}
                        className={cn(
                            "relative mx-auto h-auto w-full overflow-hidden rounded-2xl bg-background shadow-2xl",
                            "animate-slide-up",
                            className,
                        )}
                    >
                        <VisuallyHidden.Root asChild>
                            <Dialog.Title>{title}</Dialog.Title>
                        </VisuallyHidden.Root>
                        {children}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

/**
 * Props for ModalTrigger component.
 */
export interface ModalTriggerProps {
    /** Content to render as the trigger */
    children: ReactNode;
    /** Callback when trigger is clicked */
    onClick?: () => void;
    /** Additional class names for the trigger */
    className?: string;
}

/**
 * Trigger button for opening a modal.
 * Must be used as a child of Dialog.Root.
 *
 * @example
 * ```tsx
 * <Dialog.Root>
 *     <ModalTrigger>Open Modal</ModalTrigger>
 *     ...
 * </Dialog.Root>
 * ```
 */
export function ModalTrigger({
    children,
    onClick,
    className,
}: ModalTriggerProps) {
    return (
        <Dialog.Trigger onClick={onClick} className={className}>
            {children}
        </Dialog.Trigger>
    );
}
