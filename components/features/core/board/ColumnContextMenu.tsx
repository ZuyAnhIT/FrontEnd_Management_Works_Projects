"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  MoreHorizontal, 
  ArrowLeftRight, 
  Ban, 
  Trash2, 
  ChevronRight, 
  ChevronLeft 
} from "lucide-react";

// Internal Services & Utils
import { deleteProjectStatus } from "@/services/apiBoard"; 
import { useToast } from "@/components/ui/ToastProvider"; 
import { cn } from "@/lib/utils";

// Internal Components
import ConfirmationModal from "@/components/ui/ConfirmationModal"; 

// =============================================================================
// 2. INTERFACES
// =============================================================================

export interface ColumnContextMenuProps {
  projectId: number;
  columnId: string;
  columnLabel: string;
  onDeleted?: (columnId: string) => void;
  onMoveColumn?: (columnId: string, direction: "left" | "right") => void;
  onSetColumnLimit?: (columnId: string) => void;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Menu ngữ cảnh cho cột trên Bảng Kanban (Column Context Menu).
 * Hỗ trợ các thao tác như di chuyển cột, giới hạn số lượng và xóa cột.
 */
export function ColumnContextMenu({
  projectId,
  columnId,
  columnLabel,
  onMoveColumn,
  onSetColumnLimit,
  onDeleted,
}: ColumnContextMenuProps) {
  
  // ---------------------------------------------------------------------------
  // 4. HOOKS & STATE
  // ---------------------------------------------------------------------------
  
  const { showToast } = useToast();
  const menuRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ---------------------------------------------------------------------------
  // 5. EFFECTS
  // ---------------------------------------------------------------------------

  /**
   * Đóng menu khi người dùng click ra ngoài vùng hiển thị của dropdown
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowMoreActions(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // ---------------------------------------------------------------------------
  // 6. HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Kích hoạt quy trình yêu cầu xóa cột
   */
  const handleRequestDelete = useCallback(() => {
      setIsOpen(false); 
      setIsConfirmOpen(true); 
  }, []);

  /**
   * Xác nhận xóa cột và gọi API
   */
  const handleConfirmDelete = useCallback(async () => {
    setIsDeleting(true);
    
    try {
        await deleteProjectStatus(projectId, Number(columnId));
        
        showToast("Column deleted successfully", "success");
        setIsConfirmOpen(false);

        if (onDeleted) {
            onDeleted(columnId);
        }
    } catch (error: any) {
        // Ưu tiên hiển thị message lỗi do Backend trả về
        const message = error.message || error.response?.data?.message || "Failed to delete column";
        showToast(message, "error");
    } finally {
        setIsDeleting(false);
    }
  }, [columnId, onDeleted, projectId, showToast]);

  // ---------------------------------------------------------------------------
  // 7. RENDER
  // ---------------------------------------------------------------------------

  return (
    <>
      <div className="relative" ref={menuRef}>
        
        {/* Nút Kích hoạt (Trigger Button) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "p-1.5 rounded transition-colors text-slate-500 hover:bg-[#091E4214] hover:text-slate-800",
            isOpen && "bg-[#091E4214] text-slate-800"
          )}
          title="Column options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {/* Menu Thả xuống (Dropdown Content) */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-lg shadow-xl z-50 border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
            
            {!showMoreActions ? (
              // MENU CHÍNH (MAIN MENU)
              <div className="flex flex-col py-1.5">
                
                {/* Tiêu đề Menu (Column Name) */}
                <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 mb-1 truncate">
                  {columnLabel}
                </div>
                
                {/* Các hành động cơ bản */}
                <button
                  onClick={() => {
                    showToast("Move feature is in development", "info");
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
                  Move column
                </button>

                <button
                  onClick={() => {
                    onSetColumnLimit?.(columnId);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                >
                  <Ban className="w-3.5 h-3.5 text-slate-400" />
                  Set column limit
                </button>

                <div className="h-px bg-slate-100 my-1.5" />

                {/* Hành động xóa (Nguy hiểm) */}
                <button
                  onClick={handleRequestDelete}
                  className="w-full text-left px-4 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-3 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>

                <div className="h-px bg-slate-100 my-1.5" />

                {/* Chuyển sang menu phụ */}
                <button
                  onClick={() => setShowMoreActions(true)}
                  className="w-full text-left px-4 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-between transition-colors"
                >
                  More actions
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

              </div>
            ) : (
              // MENU PHỤ (SUB MENU - MORE ACTIONS)
              <div className="flex flex-col py-1.5">
                
                {/* Nút quay lại */}
                <button
                  onClick={() => setShowMoreActions(false)}
                  className="w-full text-left px-4 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100 mb-1 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                  Back
                </button>
                
                {/* Nội dung menu phụ */}
                <div className="px-4 py-4 text-[12px] text-slate-400 italic text-center">
                  No additional actions available.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL XÁC NHẬN XÓA CỘT */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => !isDeleting && setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title={`Delete Column "${columnLabel}"?`}
        description="Are you sure you want to permanently delete this column? This action cannot be undone and may affect associated tasks."
        confirmText="Delete Column"
        cancelText="Cancel"
        modalVariant="danger"
      />
    </>
  );
}