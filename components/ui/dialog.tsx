"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils"; // nếu chưa có utils thì bỏ cn()

// ===============================
// ROOT DIALOG
// ===============================
export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "transition-all",
        open
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      )}
    >
      {children}
    </div>
  );
}

// ===============================
// OVERLAY
// ===============================
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

// ===============================
// CONTENT WRAPPER
// ===============================
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

  // click outside to close
  const handleOutsideClick = (e: any) => {
    if (ref.current && !ref.current.contains(e.target)) {
      onClose?.();
    }
  };

  return (
    <div
      onMouseDown={handleOutsideClick}
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
    >
      <div
        ref={ref}
        className={cn(
          "bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative",
          "animate-in fade-in zoom-in-95",
          className
        )}
      >
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

// ===============================
// HEADER
// ===============================
export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

// ===============================
// TITLE
// ===============================
export function DialogTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-bold text-slate-900 leading-tight">
      {children}
    </h2>
  );
}

// ===============================
// DESCRIPTION
// ===============================
export function DialogDescription({
  children,
}: {
  children: React.ReactNode;
}) {
  return <p className="text-sm text-slate-600 mt-1 mb-4">{children}</p>;
}

// ===============================
// FOOTER
// ===============================
export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-end gap-3 mt-4">{children}</div>;
}
