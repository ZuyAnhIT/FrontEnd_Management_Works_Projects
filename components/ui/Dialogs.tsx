"use client";

import * as React from "react";
import { X } from "lucide-react";
// Import helper function to merge class names (assuming it's available)
import { cn } from "@/lib/utils"; 

// =============================================================================
// 1. ROOT DIALOG (CONTROLS VISIBILITY AND ESC KEY)
// =============================================================================

/**
 * Root container cho Dialog. Quản lý trạng thái mở/đóng và xử lý phím Escape.
 */
export function Dialog({
    open,
    onOpenChange,
    children,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}) {
    // Logic: Đóng khi nhấn ESC
    React.useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onOpenChange(false);
        };
        if (open) document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open, onOpenChange]);

    return (
        <div
            // Base styles: fixed inset-0, z-50, center content
            className={cn(
                "fixed inset-0 z-50 flex items-center justify-center transition-all",
                // Toggle visibility using opacity and pointer-events
                open
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none"
            )}
        >
            {children}
        </div>
    );
}

// =============================================================================
// 2. DIALOG OVERLAY (BACKDROP)
// =============================================================================

/**
 * Lớp phủ nền mờ (Backdrop) của Dialog.
 */
export function DialogOverlay() {
    return (
        <div
            className="
                fixed inset-0 bg-black/40 backdrop-blur-sm
                data-[state=open]:animate-in data-[state=open]:fade-in
                data-[state=closed]:animate-out data-[state=closed]:fade-out
            "
        />
    );
}

// =============================================================================
// 3. DIALOG CONTENT WRAPPER (HANDLE CLICK OUTSIDE)
// =============================================================================

/**
 * Container chứa nội dung chính của Dialog. Xử lý click outside để đóng.
 */
export function DialogContent({
    children,
    className,
    onClose,
}: {
    children: React.ReactNode;
    className?: string;
    onClose?: () => void;
}) {
    const ref = React.useRef<HTMLDivElement>(null);

    // Logic: Đóng khi click ra ngoài (Chỉ xử lý ở lớp ngoài cùng)
    const handleOutsideClick = (e: any) => {
        // Chỉ gọi onClose nếu click xảy ra trên lớp backdrop/wrapper, không phải trên nội dung (ref.current)
        if (ref.current && !ref.current.contains(e.target)) {
            onClose?.();
        }
    };

    return (
        // Wrapper ngoài cùng (Bắt sự kiện click outside)
        <div
            onMouseDown={handleOutsideClick}
            className="fixed inset-0 flex items-center justify-center z-50 px-4"
        >
            {/* Nội dung chính (ref) */}
            <div
                ref={ref}
                className={cn(
                    // Base styles: bg-white, rounded-xl, shadow-xl, max-w-md, padding
                    "bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative",
                    "animate-in fade-in zoom-in-95", // Animation cho nội dung
                    className
                )}
            >
                {/* Nút đóng */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-500 hover:text-slate-900"
                        title="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
                {children}
            </div>
        </div>
    );
}

// =============================================================================
// 4. DIALOG HEADER (TITLE + DESCRIPTION CONTAINER)
// =============================================================================

/**
 * Container cho phần Header (Title và Description).
 */
export function DialogHeader({ children }: { children: React.ReactNode }) {
    return <div className="mb-4">{children}</div>;
}

// =============================================================================
// 5. DIALOG TITLE
// =============================================================================

/**
 * Tiêu đề của Dialog.
 */
export function DialogTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="text-lg font-bold text-slate-900 leading-tight">
            {children}
        </h2>
    );
}

// =============================================================================
// 6. DIALOG DESCRIPTION
// =============================================================================

/**
 * Mô tả phụ cho Dialog.
 */
export function DialogDescription({
    children,
}: {
    children: React.ReactNode;
}) {
    return <p className="text-sm text-slate-600 mt-1 mb-4">{children}</p>;
}

// =============================================================================
// 7. DIALOG FOOTER
// =============================================================================

/**
 * Container cho phần Footer (thường là các nút action).
 */
export function DialogFooter({ children }: { children: React.ReactNode }) {
    return <div className="flex justify-end gap-3 mt-4">{children}</div>;
}