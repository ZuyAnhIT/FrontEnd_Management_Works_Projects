"use client";

import { X, AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button"; // Giả sử bạn có component Button chuẩn

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  modalVariant?: "danger" | "warning" | "info"; // ✔ THÊM DÒNG NÀY
}


export default function ConfirmationModal({
  
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  title,
  description,
  confirmText = "Delete",
  cancelText = "Cancel",
   modalVariant = "danger",
}: ConfirmationModalProps) {
  
  if (!isOpen) return null;

  return (
    // Backdrop: Đen mờ nhẹ, blur background
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Modal Container: Phẳng, Shadow lớn, Viền xám */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Nút đóng nhanh góc phải */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 flex gap-4">
          {/* Icon cảnh báo bên trái */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
              <AlertTriangle
  className={
    "w-5 h-5 " +
    (modalVariant === "danger"
      ? "text-red-600"
      : modalVariant === "warning"
      ? "text-amber-600"
      : "text-blue-600")
  }
/>


            </div>
          </div>

          {/* Nội dung chính */}
          <div className="flex-1 pt-0.5">
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              {title}
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Footer Actions: Nền xám nhẹ tách biệt */}
        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
          <Button
            onClick={onClose}
            disabled={isLoading}
            variant="outline"
            className="bg-white border-slate-300 text-slate-700 hover:bg-white hover:text-slate-900 font-medium h-10 px-4"
          >
            {cancelText}
          </Button>
          
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white font-bold h-10 px-4 shadow-sm transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>{confirmText}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}