"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useState, useCallback } from "react";
import { X, Calendar, Target, Rocket, Loader2, AlertTriangle } from "lucide-react";

// Internal Services
import { createSprint } from "@/services/apiSprint";

// Internal UI Components & Utils
import { Button } from "@/components/ui/Buttons";
import { Input } from "@/components/ui/Inputs";
import { Textarea } from "@/components/ui/TextAreas";
import { Card, CardHeader, CardTitle } from "@/components/ui/Cards";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES & CONSTANTS
// =============================================================================

interface CreateSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  onCreated: () => void;
}

interface SprintFormData {
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
}

const INITIAL_FORM_DATA: SprintFormData = {
  name: "",
  goal: "",
  startDate: "",
  endDate: "",
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Modal tạo Sprint mới (Create Sprint Modal).
 * Giao diện nhập liệu cấu hình chu kỳ làm việc bao gồm Tên, Mục tiêu và Thời gian.
 */
export function CreateSprintModal({
  isOpen,
  onClose,
  projectId,
  onCreated,
}: CreateSprintModalProps) {
  
  // ---------------------------------------------------------------------------
  // 4. STATE
  // ---------------------------------------------------------------------------
  
  const [formData, setFormData] = useState<SprintFormData>(INITIAL_FORM_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // 5. HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Helper cập nhật Form State an toàn, đồng thời xóa lỗi hiển thị khi người dùng gõ lại
   */
  const handleUpdateForm = useCallback((field: keyof SprintFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errorMsg) setErrorMsg(null);
  }, [errorMsg]);

  /**
   * Xác thực và gọi API để khởi tạo Sprint
   */
  const handleCreateSprint = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    // Xác thực dữ liệu đầu vào (Client-side validation)
    if (!formData.name.trim()) {
      return setErrorMsg("Sprint name cannot be empty.");
    }
    if (!formData.startDate || !formData.endDate) {
      return setErrorMsg("Start and end dates must be selected.");
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      return setErrorMsg("End date cannot be earlier than start date.");
    }

    setIsLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        goal: formData.goal.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        taskIds: [], // API yêu cầu mảng rỗng nếu chưa có Task khởi tạo cùng lúc
      };

      await createSprint(projectId, payload);

      // Kích hoạt callback tải lại dữ liệu bảng và đóng Modal
      onCreated();
      onClose();
      setFormData(INITIAL_FORM_DATA);
    } catch (error: any) {
      // Ưu tiên thông báo lỗi chi tiết từ Backend
      const message = error.response?.data?.message || error.message || "Failed to initialize Sprint.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 6. RENDER LOGIC
  // ---------------------------------------------------------------------------

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      
      {/* KHỐI MODAL */}
      <Card
        className="w-full max-w-lg bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} 
      >
        
        {/* ================= HEADER ================= */}
        <CardHeader className="bg-white border-b border-slate-100 px-6 py-5 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#E3F2FD] border border-[#2684FF]/20 flex items-center justify-center shadow-sm">
              <Rocket className="w-5 h-5 text-[#0052CC]" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-800 font-bold tracking-tight">
                Create Sprint
              </CardTitle>
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-0.5">
                Plan your next iteration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#091E4214] transition-colors active:scale-95"
            disabled={isLoading}
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        {/* ================= BODY FORM ================= */}
        <div className="flex-1 overflow-y-auto px-8 py-6 bg-white custom-scrollbar">
          <form onSubmit={handleCreateSprint} className="space-y-6">
            
            {/* Thông báo lỗi (Error Banner) */}
            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-lg text-[13px] font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            {/* Tên Sprint (Sprint Name) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Target className="w-3.5 h-3.5" />
                Sprint Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleUpdateForm("name", e.target.value)}
                placeholder="e.g. Sprint 3 - Core Features"
                className="h-11 border-slate-300 text-[13px] font-medium focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] transition-all shadow-sm bg-white"
                autoFocus
                disabled={isLoading}
              />
            </div>

            {/* Mục tiêu Sprint (Sprint Goal) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Target className="w-3.5 h-3.5" />
                Sprint Goal
              </label>
              <Textarea
                value={formData.goal}
                onChange={(e) => handleUpdateForm("goal", e.target.value)}
                placeholder="What is the main objective of this iteration?"
                rows={3}
                className="resize-none border-slate-300 text-[13px] focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] transition-all shadow-sm bg-slate-50 focus:bg-white placeholder:text-slate-400 p-3"
                disabled={isLoading}
              />
            </div>

            {/* Khung thời gian (Dates Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Start Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleUpdateForm("startDate", e.target.value)}
                  className="h-11 border-slate-300 text-[13px] font-medium focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] transition-all shadow-sm bg-white cursor-pointer"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  End Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleUpdateForm("endDate", e.target.value)}
                  className="h-11 border-slate-300 text-[13px] font-medium focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] transition-all shadow-sm bg-white cursor-pointer"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Nút Submit ẩn để bắt sự kiện phím Enter */}
            <button type="submit" className="hidden" />
          </form>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0">
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-10 px-5 text-[12px] uppercase tracking-widest font-bold text-slate-500 hover:text-slate-800 hover:bg-[#091E4214] transition-colors"
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            onClick={() => handleCreateSprint()}
            disabled={isLoading || !formData.name.trim() || !formData.startDate || !formData.endDate}
            className={cn(
              "h-10 px-6 text-[12px] uppercase tracking-widest font-bold text-white shadow-md transition-all",
              "bg-[#0052CC] hover:bg-[#0047B3] active:scale-95 disabled:opacity-50"
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Initializing
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                Create Sprint
              </span>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}