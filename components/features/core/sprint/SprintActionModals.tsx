"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useMemo } from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  Trash2, 
  Loader2, 
  X 
} from "lucide-react";

// Internal Services & Components
import { Button } from "@/components/ui/Buttons";
import { Sprint } from "@/services/apiSprint";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES
// =============================================================================

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  type: "START" | "COMPLETE" | "DELETE" | null;
  sprint: Sprint | null;
}

interface ModalContent {
  title: string;
  desc: React.ReactNode;
  icon: React.ReactNode;
  btnVariant: "default" | "destructive" | "success" | "primary";
  btnText: string;
  iconBg: string;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Các hộp thoại xác nhận hành động cho Sprint (Xác nhận Bắt đầu, Hoàn thành, Xóa).
 * Được thiết kế để cung cấp cảnh báo rõ ràng dựa trên mức độ quan trọng của hành động.
 */
export default function SprintActionModals({
  isOpen,
  onClose,
  onConfirm,
  loading,
  type,
  sprint,
}: ActionModalProps) {
  
  // ---------------------------------------------------------------------------
  // 4. LOGIC: RENDER CONTENT MAPPING
  // ---------------------------------------------------------------------------

  const content = useMemo((): ModalContent | null => {
    if (!sprint || !type) return null;

    switch (type) {
      case "START":
        return {
          title: `Start Sprint: ${sprint.name}`,
          desc: `Are you sure you want to start this sprint? It currently contains ${
            sprint.taskCount || 0
          } issues ready for development.`,
          icon: <Play className="w-5 h-5 text-[#0052CC]" />,
          iconBg: "bg-blue-50",
          btnVariant: "primary",
          btnText: "Start Sprint",
        };

      case "COMPLETE":
        return {
          title: `Complete Sprint: ${sprint.name}`,
          desc: (
            <div className="space-y-3">
              <p>
                This sprint contains <b>{sprint.taskCount}</b> issues.
              </p>
              <div className="bg-amber-50 p-3.5 rounded-lg border border-amber-200 text-amber-900 flex gap-3 shadow-sm">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
                <span className="text-[13px] leading-relaxed">
                  Completing this sprint will automatically move all <b>incomplete tasks</b> back to the project <b>Backlog</b>.
                </span>
              </div>
            </div>
          ),
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
          iconBg: "bg-emerald-50",
          btnVariant: "success",
          btnText: "Complete Sprint",
        };

      case "DELETE":
        const isCancel = sprint.status === "IN_PROGRESS";
        return {
          title: isCancel ? `Cancel Active Sprint` : `Delete Sprint`,
          desc: isCancel
            ? `Canceling "${sprint.name}" will stop all current progress and return all issues to the Backlog. This action cannot be reversed.`
            : `Are you sure you want to delete "${sprint.name}"? All sprint-specific metadata will be lost permanently.`,
          icon: <Trash2 className="w-5 h-5 text-red-600" />,
          iconBg: "bg-red-50",
          btnVariant: "destructive",
          btnText: isCancel ? "Cancel Sprint" : "Delete Sprint",
        };

      default:
        return null;
    }
  }, [type, sprint]);

  // ---------------------------------------------------------------------------
  // 5. RENDER LOGIC
  // ---------------------------------------------------------------------------

  if (!isOpen || !content) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all duration-300",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={onClose}
    >
      {/* Container Modal */}
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng nhanh (X) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-8">
          {/* Biểu tượng và Tiêu đề */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className={cn("p-4 rounded-2xl mb-4 shadow-sm", content.iconBg)}>
              {content.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {content.title}
            </h3>
          </div>

          {/* Nội dung mô tả */}
          <div className="text-slate-500 text-center text-sm leading-relaxed mb-8">
            {content.desc}
          </div>

          {/* Khu vực hành động (Footer) */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-11 text-[12px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50"
            >
              Cancel
            </Button>
            
            <Button
              disabled={loading}
              onClick={onConfirm}
              className={cn(
                "flex-1 h-11 text-[12px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-md",
                // Logic map màu sắc nút Jira-style
                content.btnVariant === "primary" && "bg-[#0052CC] hover:bg-[#0047B3] text-white",
                content.btnVariant === "success" && "bg-emerald-600 hover:bg-emerald-700 text-white",
                content.btnVariant === "destructive" && "bg-red-600 hover:bg-red-700 text-white"
              )}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing
                </div>
              ) : (
                content.btnText
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}