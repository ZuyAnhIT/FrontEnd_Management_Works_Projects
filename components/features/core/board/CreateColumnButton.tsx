"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { createProjectStatus } from "@/services/apiBoard";

// =============================================================================
// 1. CONSTANTS
// =============================================================================

const DEFAULT_STATUS_COLOR = "#0091ff"; // Màu xanh dương mặc định

// =============================================================================
// 2. INTERFACES
// =============================================================================

interface CreateColumnButtonProps {
  projectId: number;
  onSuccess?: (newColumn: any) => void;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function CreateColumnButton({ projectId, onSuccess }: CreateColumnButtonProps) {
  // --- STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [columnName, setColumnName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // --- HOOKS ---
  const { showToast } = useToast();

  // --- HANDLERS ---

  const handleCreateColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!columnName.trim()) return;

    setIsLoading(true);
    try {
      // Payload tạo trạng thái mới
      const payload = {
        name: columnName.trim(),
        color: DEFAULT_STATUS_COLOR,
        isCompletedStatus: false, // Mặc định không phải trạng thái hoàn thành
      };

      const newColumn = await createProjectStatus(projectId, payload);

      showToast("Column created successfully!", "success");
      
      // Reset form
      setColumnName("");
      setIsEditing(false);
      
      // Callback cập nhật UI cha
      if (onSuccess) {
        onSuccess(newColumn);
      }

    } catch (error: any) {
      // Lấy lỗi từ API hoặc dùng lỗi mặc định
      const message = error.message || error.response?.data?.message || "Failed to create column.";
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER: FORM MODE ---
  if (isEditing) {
    return (
      <div className="w-[272px] shrink-0 p-3 rounded-xl bg-white border border-slate-200 shadow-sm animate-in fade-in zoom-in-95 duration-200">
        <form onSubmit={handleCreateColumn} className="flex flex-col gap-3">
          <input
            autoFocus
            type="text"
            placeholder="Enter column name..."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            value={columnName}
            onChange={(e) => setColumnName(e.target.value)}
            disabled={isLoading}
          />
          
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isLoading || !columnName.trim()}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Add
            </button>
            
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
              disabled={isLoading}
              title="Cancel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    );
  }

  // --- RENDER: BUTTON MODE ---
  return (
    <div className="w-[272px] h-12 shrink-0">
      <button
        onClick={() => setIsEditing(true)}
        className="w-full h-full flex items-center justify-center gap-2 rounded-xl bg-slate-100/50 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 text-slate-500 font-medium transition-all duration-200"
      >
        <Plus className="w-5 h-5" />
        Add Column
      </button>
    </div>
  );
}