"use client";

import * as React from "react";
import { X } from "lucide-react";

// Internal Utils
import { cn } from "@/lib/utils";

// =============================================================================
// ROOT DIALOG
// =============================================================================

/**
 * Thành phần gốc của Dialog. 
 * Quản lý trạng thái hiển thị, khả năng tương tác và xử lý phím tắt Escape.
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
  // Xử lý sự kiện đóng cửa sổ khi nhấn phím Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onOpenChange]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center transition-all",
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
// DIALOG OVERLAY
// =============================================================================

/**
 * Lớp phủ nền mờ (Backdrop) của Dialog.
 * Giúp tập trung sự chú ý vào nội dung chính và làm mờ các thành phần phía sau.
 */
export function DialogOverlay() {
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
    />
  );
}

// =============================================================================
// DIALOG CONTENT
// =============================================================================

/**
 * Vùng chứa nội dung chính của Dialog.
 * Hỗ trợ đóng cửa sổ khi người dùng nhấn chuột ra ngoài vùng nội dung.
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
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Xử lý đóng cửa sổ khi click vào vùng backdrop bên ngoài content
  const handleOutsideClick = (e: React.MouseEvent) => {
    if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
      onClose?.();
    }
  };

  return (
    <div
      onMouseDown={handleOutsideClick}
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
    >
      <div
        ref={contentRef}
        className={cn(
          "bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative",
          "animate-in fade-in zoom-in-95 duration-200",
          className
        )}
      >
        {/* Nút đóng tích hợp trong content */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
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
// LAYOUT HELPERS (HEADER, TITLE, DESCRIPTION, FOOTER)
// =============================================================================

/**
 * Container cho phần tiêu đề của Dialog.
 */
export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

/**
 * Tiêu đề chính của Dialog, hiển thị nổi bật ở trên cùng.
 */
export function DialogTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-bold text-slate-900 leading-tight">
      {children}
    </h2>
  );
}

/**
 * Văn bản mô tả bổ sung cho nội dung của Dialog.
 */
export function DialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-600 mt-1 mb-4">{children}</p>;
}

/**
 * Container cho phần chân của Dialog, thường chứa các nút hành động (Hủy, Xác nhận).
 */
export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-end gap-3 mt-4">{children}</div>;
}