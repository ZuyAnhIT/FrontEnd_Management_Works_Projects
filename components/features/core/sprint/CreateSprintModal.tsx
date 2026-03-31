"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useState, useCallback } from "react";
import { X, Loader2, Calendar, Target, Rocket, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Buttons";
import { createSprint, SprintPayload } from "@/services/apiSprint";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES & CONSTANTS
// =============================================================================

interface CreateSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Callback để reload danh sách sau khi tạo
  projectId: number;
}

const INITIAL_FORM_DATA: SprintPayload = {
  name: "",
  goal: "",
  startDate: undefined,
  endDate: undefined,
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Modal khởi tạo Sprint mới.
 * Cung cấp giao diện nhập liệu Tên, Mục tiêu và Khung thời gian cho chu kỳ làm việc.
 */
export default function CreateSprintModal({
  isOpen,
  onClose,
  onSuccess,
  projectId,
}: CreateSprintModalProps) {
  
  // ---------------------------------------------------------------------------
  // 4. HOOKS & STATE
  // ---------------------------------------------------------------------------
  
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SprintPayload>(INITIAL_FORM_DATA);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // 5. HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Cập nhật Form State và xóa thông báo lỗi khi người dùng thay đổi dữ liệu
   */
  const handleUpdateField = useCallback((field: keyof SprintPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMsg) setErrorMsg(null);
  }, [errorMsg]);

  /**
   * Xử lý xác thực và gửi dữ liệu tạo Sprint lên API
   */
  const handleFormSubmit = async () => {
    // 1. Validation sơ bộ tại Client
    if (!formData.name?.trim()) {
      setErrorMsg("Sprint name is required");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 2. Chuẩn bị payload (Chuyển đổi date string -> ISO format chuẩn API)
      const payload: SprintPayload = {
        name: formData.name.trim(),
        goal: formData.goal?.trim() || "",
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        taskIds: [], 
      };

      // 3. Gọi API service
      await createSprint(projectId, payload);

      // 4. Xử lý sau khi thành công
      showToast("Sprint created successfully", "success");
      setFormData(INITIAL_FORM_DATA);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Create Sprint Error:", error);
      const message = error.response?.data?.message || error.message || "Failed to create sprint.";
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 6. RENDER LOGIC
  // ---------------------------------------------------------------------------

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      
      {/* Lớp nền click để đóng */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Container Modal */}
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 relative z-10 border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-50 rounded-lg">
                <Rocket className="w-5 h-5 text-[#0052CC]" />
             </div>
             <h2 className="text-lg font-bold text-slate-800 tracking-tight">
               Create Sprint
             </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-md hover:bg-slate-100 transition-all active:scale-95"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= BODY FORM ================= */}
        <div className="p-6 space-y-5 bg-white">
          
          {/* Thông báo lỗi tập trung */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-xs font-bold flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Trường: Tên Sprint */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
              Sprint Name <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              disabled={isSubmitting}
              className={cn(
                "w-full border border-slate-200 rounded-lg p-3 text-sm font-medium transition-all outline-none",
                "focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] placeholder:text-slate-400 bg-slate-50/50 focus:bg-white"
              )}
              placeholder="e.g. Sprint 24: Core Components"
              value={formData.name}
              onChange={(e) => handleUpdateField('name', e.target.value)}
            />
          </div>

          {/* Trường: Mục tiêu Sprint */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Sprint Goal
            </label>
            <textarea
              disabled={isSubmitting}
              className={cn(
                "w-full border border-slate-200 rounded-lg p-3 text-sm font-medium h-24 transition-all outline-none resize-none",
                "focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] placeholder:text-slate-400 bg-slate-50/50 focus:bg-white"
              )}
              placeholder="Define the primary objective of this iteration..."
              value={formData.goal || ""}
              onChange={(e) => handleUpdateField('goal', e.target.value)}
            />
          </div>

          {/* Trường: Thời gian (Grid) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Start Date
              </label>
              <input
                type="datetime-local"
                disabled={isSubmitting}
                className={cn(
                  "w-full border border-slate-200 rounded-lg p-2.5 text-[12px] font-medium text-slate-600 transition-all outline-none cursor-pointer",
                  "focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] bg-slate-50/50 focus:bg-white"
                )}
                value={formData.startDate || ""}
                onChange={(e) => handleUpdateField('startDate', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> End Date
              </label>
              <input
                type="datetime-local"
                disabled={isSubmitting}
                className={cn(
                  "w-full border border-slate-200 rounded-lg p-2.5 text-[12px] font-medium text-slate-600 transition-all outline-none cursor-pointer",
                  "focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] bg-slate-50/50 focus:bg-white"
                )}
                value={formData.endDate || ""}
                onChange={(e) => handleUpdateField('endDate', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-600 font-bold text-[12px] uppercase tracking-widest hover:bg-slate-200/50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleFormSubmit}
            disabled={isSubmitting || !formData.name?.trim()}
            className={cn(
              "bg-[#0052CC] hover:bg-[#0047B3] text-white font-bold text-[12px] uppercase tracking-widest shadow-md transition-all active:scale-95 px-6",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Create Sprint"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}