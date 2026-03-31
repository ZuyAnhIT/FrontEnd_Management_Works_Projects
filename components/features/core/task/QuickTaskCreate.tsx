"use client";

// =============================================================================
// 1. IMPORTS
// =============================================================================

import React, { useState, useEffect, KeyboardEvent } from "react";
import { Plus, Loader2, X } from "lucide-react";

// Internal Components & Utils
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";

// Internal Services & Types
import { createProjectTask, TaskType, TaskPriority } from "@/services/apiProject";

// =============================================================================
// 2. INTERFACES
// =============================================================================

interface QuickTaskCreateProps {
  companyId: number;
  workspaceId: number;
  projectId: number;
  sprintId?: number | null;
  statusId?: number;
  defaultType?: TaskType;
  initialMode?: "button" | "form";
  onCancel?: () => void;
  onSuccess: (newTask: any) => void;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Thành phần tạo công việc nhanh (Inline Create).
 * Cho phép người dùng nhập trực tiếp tên task tại danh sách mà không cần mở Modal.
 */
export default function QuickTaskCreate({
  companyId,
  workspaceId,
  projectId,
  sprintId,
  statusId,
  defaultType = TaskType.TASK,
  initialMode = "button",
  onCancel,
  onSuccess,
}: QuickTaskCreateProps) {
  
  // ---------------------------------------------------------------------------
  // 4. HOOKS & STATE
  // ---------------------------------------------------------------------------
  
  const { showToast } = useToast();
  
  const [isEditing, setIsEditing] = useState(initialMode === "form");
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Đồng bộ trạng thái chỉnh sửa khi chế độ ban đầu thay đổi
  useEffect(() => {
    if (initialMode === "form") {
      setIsEditing(true);
    }
  }, [initialMode]);

  // ---------------------------------------------------------------------------
  // 5. HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Xử lý hủy thao tác và đặt lại trạng thái form
   */
  const handleCancel = () => {
    setIsEditing(false);
    setTitle("");
    if (onCancel) onCancel(); 
  };

  /**
   * Xử lý gọi API tạo công việc mới
   */
  const handleCreate = async () => {
    if (!title.trim()) {
      handleCancel();
      return;
    }

    try {
      setIsLoading(true);

      // Chuẩn bị dữ liệu khởi tạo cơ bản
      const payload: any = {
        title: title.trim(),
        taskType: defaultType,
        priority: TaskPriority.MEDIUM,
        description: "",
      };

      // Gắn thông tin ngữ cảnh (Sprint, Status) nếu có
      if (sprintId) {
        payload.sprintId = sprintId;
      }
      if (statusId) {
        payload.statusId = statusId;
      }

      const newTask = await createProjectTask(companyId, workspaceId, projectId, payload);
      
      onSuccess(newTask);
      setTitle(""); 
    } catch (error: any) {
      console.error("Quick create task error:", error);
      const message = error.response?.data?.message || error.message || "Failed to create issue.";
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Hỗ trợ phím tắt Enter để lưu và Escape để hủy
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreate();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  // ---------------------------------------------------------------------------
  // 6. RENDER LOGIC
  // ---------------------------------------------------------------------------

  // Trạng thái chờ: Hiển thị nút bấm
  if (!isEditing && initialMode === "button") {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className={cn(
          "group flex items-center gap-2 w-full p-2 mt-1 rounded-md transition-all",
          "text-slate-500 hover:text-slate-800 hover:bg-slate-100",
          "text-[13px] font-semibold"
        )}
      >
        <Plus className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
        <span>Create issue</span>
      </button>
    );
  }

  // Trạng thái nhập liệu: Hiển thị Form inline
  return (
    <div className="mt-1 bg-white border-2 border-[#2684FF] rounded-lg shadow-sm transition-all animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
      
      <div className="relative flex items-center p-0.5">
        <input
          autoFocus
          type="text"
          className="w-full text-[13px] font-medium text-[#172B4D] outline-none placeholder:text-slate-400 bg-transparent px-2.5 py-1.5 pr-8"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        
        {/* Nút hủy góc phải input */}
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-[#0052CC] animate-spin absolute right-2" />
        ) : (
          <button
            className="absolute right-1 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
            onClick={handleCancel}
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Thanh trạng thái phía dưới input */}
      <div className="flex justify-between items-center px-2 py-1.5 border-t border-slate-100 bg-slate-50">
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
          Press 
          <kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500 shadow-sm font-sans">
            Enter
          </kbd> 
          to save
        </div>
        <button
          className="text-[10px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 px-2 py-1.5 rounded transition-colors uppercase tracking-widest"
          onClick={handleCancel}
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}