"use client";

import { useEffect, useRef } from "react";
import { X, AlertTriangle, Loader2, Trash2, Info, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  // Giữ nguyên prop này để tương thích ngược
  modalVariant?: "danger" | "warning" | "info"; 
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
  
  // Prevent scroll body khi modal mở
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  // --- CẤU HÌNH MÀU SẮC & ICON ---
  const VARIANTS = {
    danger: {
      icon: <Trash2 className="w-5 h-5 text-red-600" />,
      bgIcon: "bg-red-50 border-red-100",
      btnConfirm: "bg-red-600 hover:bg-red-700 text-white ring-red-200",
      titleColor: "text-red-600" // Hoặc giữ text-slate-900 nếu thích đơn giản
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      bgIcon: "bg-amber-50 border-amber-100",
      btnConfirm: "bg-amber-600 hover:bg-amber-700 text-white ring-amber-200",
      titleColor: "text-amber-700"
    },
    info: {
      icon: <Info className="w-5 h-5 text-blue-600" />,
      bgIcon: "bg-blue-50 border-blue-100",
      btnConfirm: "bg-blue-600 hover:bg-blue-700 text-white ring-blue-200",
      titleColor: "text-blue-700"
    }
  };

  const currentVariant = VARIANTS[modalVariant] || VARIANTS.danger;

  return (
    // 1. BACKDROP: Cực nhẹ (bg-black/10), không blur nhiều, tạo cảm giác "thoáng"
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/10 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* 2. CONTAINER: Shadow cực lớn, Bo góc mềm mại, Border tinh tế */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-slate-900/5"
      >
        {/* Nút đóng nhanh */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          <div className="flex flex-col gap-4 text-center sm:text-left sm:flex-row">
            
            {/* Icon Wrapper */}
            <div className={`mx-auto sm:mx-0 w-12 h-12 flex items-center justify-center rounded-full border ${currentVariant.bgIcon} shrink-0`}>
              {currentVariant.icon}
            </div>

            {/* Content */}
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

        {/* 3. FOOTER: Liền mạch (không nền xám), nút to rõ */}
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