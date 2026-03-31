"use client";

import { useEffect, useCallback } from "react";
import {
  X,
  AlertTriangle,
  Loader2,
  Trash2,
  Info,
} from "lucide-react";

// Internal Components
import { Button } from "@/components/ui/Buttons";

// =============================================================================
// INTERFACES & CONFIGURATION
// =============================================================================

/**
 * Thuộc tính đầu vào cho thành phần cửa sổ xác nhận (Modal)
 */
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  modalVariant?: "danger" | "warning" | "info";
}

/**
 * Cấu hình định dạng hiển thị cho từng loại biến thể của Modal
 */
const MODAL_VARIANTS = {
  danger: {
    icon: <Trash2 className="w-5 h-5 text-red-600" />,
    bgIcon: "bg-red-50 border-red-100",
    btnConfirm: "bg-red-600 hover:bg-red-700 text-white ring-red-200",
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    bgIcon: "bg-amber-50 border-amber-100",
    btnConfirm: "bg-amber-600 hover:bg-amber-700 text-white ring-amber-200",
  },
  info: {
    icon: <Info className="w-5 h-5 text-blue-600" />,
    bgIcon: "bg-blue-50 border-blue-100",
    btnConfirm: "bg-blue-600 hover:bg-blue-700 text-white ring-blue-200",
  },
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Thành phần cửa sổ xác nhận dùng chung cho toàn hệ thống.
 * Hỗ trợ các trạng thái nguy hiểm (Danger), cảnh báo (Warning) và thông tin (Info).
 */
export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  modalVariant = "danger",
}: ConfirmationModalProps) {
  
  // ---------------------------------------------------------------------------
  // 1. SIDE EFFECTS
  // ---------------------------------------------------------------------------

  // Xử lý khóa thanh cuộn của trang khi cửa sổ modal đang mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // ---------------------------------------------------------------------------
  // 2. RENDER LOGIC
  // ---------------------------------------------------------------------------

  if (!isOpen) return null;

  const currentVariant = MODAL_VARIANTS[modalVariant] || MODAL_VARIANTS.danger;

  return (
    // Lớp nền mờ (Backdrop)
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/10 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Container chính của cửa sổ Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-slate-900/5"
      >
        {/* Nút đóng nhanh ở góc trên bên phải */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors z-10"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          <div className="flex flex-col gap-4 text-center sm:text-left sm:flex-row">
            {/* Vùng hiển thị Icon biến thể */}
            <div
              className={`mx-auto sm:mx-0 w-12 h-12 flex items-center justify-center rounded-full border ${currentVariant.bgIcon} shrink-0`}
            >
              {currentVariant.icon}
            </div>

            {/* Vùng hiển thị nội dung thông báo */}
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* Khu vực các nút hành động (Footer) */}
        <div className="px-6 pb-6 pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button
            onClick={onClose}
            disabled={isLoading}
            variant="ghost"
            className="w-full sm:w-auto text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900"
          >
            {cancelText}
          </Button>

          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto font-bold shadow-sm transition-all active:scale-95 focus:ring-4 focus:ring-opacity-50 ${currentVariant.btnConfirm}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}