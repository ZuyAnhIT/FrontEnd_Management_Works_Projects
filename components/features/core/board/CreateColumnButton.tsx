"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useState, useCallback } from "react";
import { Plus, X, Loader2 } from "lucide-react";

// Internal Services & Contexts
import { useToast } from "@/components/ui/ToastProvider";
import { createProjectStatus } from "@/services/apiBoard";

// Internal Utils
import { cn } from "@/lib/utils";

// =============================================================================
// 2. CONSTANTS & INTERFACES
// =============================================================================

/**
 * Màu xanh lam (Blue) tiêu chuẩn của Jira khi tạo mới Status
 */
const DEFAULT_STATUS_COLOR = "#2684FF"; 

export interface CreateColumnButtonProps {
  projectId: number;
  onSuccess?: (newColumn: any) => void;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Nút chức năng tạo Cột mới (New Status/Column) trên bảng Kanban.
 * Hỗ trợ hai trạng thái hiển thị: Nút bấm (Button Mode) và Biểu mẫu (Form Mode).
 */
export default function CreateColumnButton({ projectId, onSuccess }: CreateColumnButtonProps) {
  
  // ---------------------------------------------------------------------------
  // 4. HOOKS & STATE
  // ---------------------------------------------------------------------------
  
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [columnName, setColumnName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // ---------------------------------------------------------------------------
  // 5. HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Gọi API tạo cột mới và xử lý trạng thái UI
   */
  const handleCreateColumn = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = columnName.trim();
    
    if (!trimmedName) return;

    setIsProcessing(true);
    try {
      // Chuẩn bị payload theo cấu trúc API yêu cầu
      const payload = {
        name: trimmedName,
        color: DEFAULT_STATUS_COLOR,
        isCompletedStatus: false, 
      };

      const newColumn = await createProjectStatus(projectId, payload);

      showToast("Column created successfully", "success");
      
      // Khôi phục trạng thái mặc định
      setColumnName("");
      setIsEditing(false);
      
      // Kích hoạt callback nếu có (thường để reload board)
      if (onSuccess) {
        onSuccess(newColumn);
      }

    } catch (error: any) {
      // Ưu tiên hiển thị thông báo lỗi từ Backend
      const message = error.message || error.response?.data?.message || "Failed to create column";
      showToast(message, "error");
    } finally {
      setIsProcessing(false);
    }
  }, [columnName, onSuccess, projectId, showToast]);

  /**
   * Xử lý phím tắt (Hủy khi bấm ESC)
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsEditing(false);
      setColumnName("");
    }
  };

  // ---------------------------------------------------------------------------
  // 6. RENDER LOGIC
  // ---------------------------------------------------------------------------

  // CHẾ ĐỘ HIỂN THỊ 1: BIỂU MẪU NHẬP LIỆU (FORM MODE)
  if (isEditing) {
    return (
      <div className="w-[272px] shrink-0 p-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-sm animate-in fade-in zoom-in-95 duration-200">
        <form onSubmit={handleCreateColumn} className="flex flex-col gap-2.5">
          
          <input
            autoFocus
            type="text"
            placeholder="Enter column name..."
            value={columnName}
            onChange={(e) => setColumnName(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            className={cn(
              "w-full px-2.5 py-1.5 text-[13px] font-medium border border-slate-300 rounded shadow-sm outline-none transition-colors",
              "focus:border-[#2684FF] focus:ring-1 focus:ring-[#2684FF] placeholder:text-slate-400",
              "disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
            )}
          />
          
          <div className="flex items-center gap-1.5">
            <button
              type="submit"
              disabled={isProcessing || !columnName.trim()}
              className={cn(
                "px-3 py-1.5 bg-[#0052CC] text-white text-[13px] font-bold rounded shadow-sm flex items-center justify-center gap-2 transition-all",
                "hover:bg-[#0047B3] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </button>
            
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setColumnName("");
              }}
              disabled={isProcessing}
              title="Cancel (Esc)"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-[#091E4214] rounded transition-colors active:scale-95 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    );
  }

  // CHẾ ĐỘ HIỂN THỊ 2: NÚT KÍCH HOẠT (BUTTON MODE)
  return (
    <div className="w-[272px] shrink-0">
      <button
        onClick={() => setIsEditing(true)}
        className={cn(
          "w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-transparent transition-all duration-200",
          "bg-white/50 text-[#5E6C84] hover:bg-[#091E4214] hover:text-[#172B4D]"
        )}
      >
        <Plus className="w-4 h-4" />
        <span className="text-[13px] font-semibold">Create column</span>
      </button>
    </div>
  );
}