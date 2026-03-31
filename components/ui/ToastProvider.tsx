"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

// Internal Utils
import { cn } from "@/lib/utils";

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  /**
   * Hiển thị thông báo Toast mới
   * @param message Nội dung thông báo
   * @param type Loại thông báo (mặc định: info)
   * @param duration Thời gian hiển thị tính theo ms (mặc định: 4000)
   */
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// =============================================================================
// TOAST CONFIGURATIONS
// =============================================================================

/**
 * Cấu hình định dạng và biểu tượng cho từng loại thông báo
 */
const TOAST_CONFIG = {
  success: {
    icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
    borderClass: "border-l-green-500",
    bgIconClass: "bg-green-50",
    title: "Success",
  },
  error: {
    icon: <XCircle className="w-5 h-5 text-red-600" />,
    borderClass: "border-l-red-500",
    bgIconClass: "bg-red-50",
    title: "Error",
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    borderClass: "border-l-amber-500",
    bgIconClass: "bg-amber-50",
    title: "Warning",
  },
  info: {
    icon: <Info className="w-5 h-5 text-blue-600" />,
    borderClass: "border-l-blue-500",
    bgIconClass: "bg-blue-50",
    title: "Info",
  },
};

// =============================================================================
// TOAST PROVIDER
// =============================================================================

/**
 * Thành phần cung cấp ngữ cảnh thông báo (Toast Context) cho toàn hệ thống.
 * Quản lý danh sách các thông báo đang hiển thị và xử lý logic tự động đóng.
 */
export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ---------------------------------------------------------------------------
  // LOGIC HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Gỡ bỏ một thông báo cụ thể dựa trên ID
   */
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  /**
   * Tạo và hiển thị một thông báo mới
   */
  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration = 4000) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type }]);

      // Tự động xóa thông báo sau khoảng thời gian quy định
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const contextValue = useMemo(() => ({ showToast, removeToast }), [showToast, removeToast]);

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Vùng chứa danh sách các Toast (Toast Container) */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => {
          const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;

          return (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto relative flex items-start gap-3 p-4 rounded-lg shadow-lg bg-white border border-slate-100 transition-all",
                "animate-in slide-in-from-right-full duration-300",
                "border-l-[4px]",
                config.borderClass
              )}
            >
              {/* Vùng chứa biểu tượng đại diện */}
              <div className={cn("p-1 rounded-full shrink-0", config.bgIconClass)}>
                {config.icon}
              </div>

              {/* Nội dung thông báo */}
              <div className="flex-1 pt-0.5 min-w-0">
                <p className="text-sm font-bold text-slate-900 leading-tight">
                  {config.title}
                </p>
                <p className="text-sm text-slate-500 mt-1 leading-snug break-words">
                  {toast.message}
                </p>
              </div>

              {/* Nút đóng thông báo nhanh */}
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded transition-colors"
                title="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

// =============================================================================
// CUSTOM HOOK
// =============================================================================

/**
 * Hook sử dụng để kích hoạt thông báo Toast trong các thành phần UI.
 * Phải được sử dụng bên trong ToastProvider.
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};