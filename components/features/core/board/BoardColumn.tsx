"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

// Thư viện bên ngoài
import React, { useMemo, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Plus } from "lucide-react";

// Internal Contexts & Utils
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";

// Internal Services
import { BoardColumnResponse, updateProjectStatus } from "@/services/apiBoard";
import { TaskSummary } from "@/services/apiProject";

// Internal Components
import BoardTaskCard from "./BoardTaskCard";
import { ColumnContextMenu } from "./ColumnContextMenu";
import QuickTaskCreate from "@/components/features/core/task/QuickTaskCreate";

// =============================================================================
// 2. CONSTANTS & CONFIG
// =============================================================================

/**
 * Cấu hình hệ màu chuẩn Jira Design System.
 */
const JIRA_COLORS = {
  bgDefault: "bg-[#F4F5F7]",
  bgActive: "bg-[#E3F2FD] ring-2 ring-[#2684FF] ring-inset",
  textPrimary: "text-[#172B4D]",
  textSecondary: "text-[#5E6C84]",
  badgeBg: "bg-[#DFE1E6]",
};

// =============================================================================
// 3. INTERFACES
// =============================================================================

interface BoardColumnProps {
  column: BoardColumnResponse;
  index: number;
  projectId: number;
  members: any[]; 
  onDeleteColumn?: (columnId: string) => void;
  onTaskClick?: (task: TaskSummary) => void;
  isReadOnly?: boolean;
}

// =============================================================================
// 4. MAIN COMPONENT
// =============================================================================

/**
 * Thành phần Cột (Column) trong bảng Kanban (Board).
 * Hỗ trợ kéo thả cột, kéo thả thẻ công việc, chỉnh sửa tên cột và tạo nhanh công việc.
 */
export default function BoardColumn({
  column,
  projectId,
  onDeleteColumn,
  members,
  onTaskClick,
  isReadOnly = false 
}: BoardColumnProps) {
  
  // ---------------------------------------------------------------------------
  // 5. HOOKS & STATE
  // ---------------------------------------------------------------------------
  
  const { showToast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { activeCompany } = useAuth();

  const workspaceId = Number(params.workspaceId);

  // Trạng thái UI
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(column?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false); 

  // ---------------------------------------------------------------------------
  // 6. DATA PREPARATION (Guard Clause)
  // ---------------------------------------------------------------------------
  
  if (!column || (column.id === undefined && (column as any).statusId === undefined)) {
    return null;
  }

  // Chuẩn hóa ID Cột từ API
  const rawId = column.id ?? (column as any).statusId;
  const columnId = rawId !== undefined && rawId !== null ? String(rawId) : `col-${Math.random()}`;
  
  const displayName = title || "Untitled Column";
  const tasks = Array.isArray(column.tasks) ? column.tasks : [];
  
  // Danh sách ID phục vụ cho việc sort thẻ công việc bên trong
  const taskIds = useMemo(() => tasks.map((t) => t.id.toString()), [tasks]);

  // ---------------------------------------------------------------------------
  // 7. DRAG AND DROP (DND) HOOKS
  // ---------------------------------------------------------------------------

  // DND Hook 1: Sortable (Dành cho việc kéo thả toàn bộ cột)
  const {
    attributes,
    listeners,
    setNodeRef: setColumnRef,
    transform,
    transition,
    isDragging: isColumnDragging,
  } = useSortable({
    id: columnId,
    data: { type: "Column", column },
    disabled: isEditing || isCreating || isReadOnly, 
  });

  const columnStyle: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isColumnDragging ? 0.4 : 1,
  };

  // DND Hook 2: Droppable (Dành cho việc thả thẻ công việc vào cột này)
  const { setNodeRef: setTaskListRef, isOver } = useDroppable({
    id: columnId,
    data: { type: "Column", column },
    disabled: isReadOnly 
  });

  // ---------------------------------------------------------------------------
  // 8. HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Lưu thay đổi tên cột sau khi chỉnh sửa
   */
  const handleSaveTitle = useCallback(async () => {
    if (isReadOnly) return;

    if (!title.trim() || title === column.name) {
      setTitle(column.name);
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await updateProjectStatus(projectId, Number(rawId), { name: title.trim() });
      showToast("Column renamed successfully", "success");
      setIsEditing(false);
    } catch (error: any) {
      const errorMsg = error.message || error.response?.data?.message || "Failed to rename column";
      showToast(errorMsg, "error");
      setTitle(column.name); 
    } finally {
      setIsSaving(false);
    }
  }, [column.name, isReadOnly, projectId, rawId, showToast, title]);

  /**
   * Xử lý phím tắt khi đang nhập liệu tên cột
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveTitle();
    } else if (e.key === "Escape") {
      setTitle(column.name);
      setIsEditing(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 9. RENDER
  // ---------------------------------------------------------------------------

  return (
    <div
      ref={setColumnRef}
      style={columnStyle}
      className={cn(
        "w-[272px] flex flex-col shrink-0 select-none h-full max-h-full",
        "ml-3 first:ml-0 rounded-xl transition-all duration-200",
        isColumnDragging ? "z-50 shadow-2xl scale-[1.02] cursor-grabbing" : ""
      )}
    >
      <div
        className={cn(
          "flex flex-col h-full rounded-xl transition-colors duration-200 border border-transparent",
          isOver && !isReadOnly ? JIRA_COLORS.bgActive : JIRA_COLORS.bgDefault
        )}
      >
        
        {/* ================= HEADER SECTION ================= */}
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "p-3 pr-2 flex items-center justify-between shrink-0 group/header transition-colors rounded-t-xl",
            isReadOnly ? "cursor-default" : "cursor-grab active:cursor-grabbing hover:bg-slate-200/50"
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden flex-1">
            {isEditing && !isReadOnly ? (
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={handleKeyDown}
                disabled={isSaving}
                onPointerDown={(e) => e.stopPropagation()} 
                className={cn(
                  "w-full text-[12px] font-bold uppercase tracking-widest bg-white border border-[#2684FF] rounded px-1.5 py-0.5 outline-none shadow-sm",
                  JIRA_COLORS.textPrimary
                )}
              />
            ) : (
              <h3
                className={cn(
                  "text-[12px] font-bold uppercase tracking-widest truncate rounded px-1.5 transition-colors duration-200",
                  JIRA_COLORS.textSecondary,
                  !isReadOnly ? "cursor-text border border-transparent hover:bg-slate-200/70" : ""
                )}
                title={!isReadOnly ? "Click to edit column name" : undefined}
                onClick={() => !isReadOnly && setIsEditing(true)}
              >
                {displayName}
              </h3>
            )}
            
            {/* Nhãn hiển thị tổng số Task hiện có */}
            {!isEditing && tasks.length > 0 && (
              <span className={cn(
                "text-[11px] font-bold px-2 py-0.5 rounded-full",
                JIRA_COLORS.textPrimary, 
                JIRA_COLORS.badgeBg
              )}>
                {tasks.length}
              </span>
            )}
          </div>

          {/* Cụm công cụ mở rộng (Quick Add & Context Menu) */}
          {!isReadOnly && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover/header:opacity-100 transition-opacity">
              <button 
                className="p-1 hover:bg-[#091E4214] rounded transition-colors text-[#42526E]"
                onClick={() => setIsCreating(true)}
                title="Create issue"
              >
                <Plus className="w-4 h-4" />
              </button>
              
              <ColumnContextMenu
                projectId={projectId}
                columnId={columnId}
                columnLabel={title}
                onDeleted={onDeleteColumn}
                onMoveColumn={() => showToast("Feature in development", "info")}
                onSetColumnLimit={() => showToast("Feature in development", "info")}
              />
            </div>
          )}
        </div>

        {/* ================= BODY SECTION (TASK LIST) ================= */}
        <div
          ref={setTaskListRef}
          className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-2 min-h-[150px] flex flex-col gap-2"
        >
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {tasks.map((task, idx) => (
              <BoardTaskCard
                key={task.id || `task-${idx}`}
                task={task}
                index={idx}
                users={members}
                onClick={onTaskClick}
              />
            ))}
          </SortableContext>

          {/* ================= FOOTER SECTION (QUICK CREATE) ================= */}
          {!isReadOnly && (
            <>
              {isCreating ? (
                <div className="mt-1 bg-white rounded-lg shadow-sm border border-blue-200 p-2 animate-in fade-in zoom-in-95 duration-200">
                  <QuickTaskCreate
                    initialMode="form"
                    companyId={activeCompany?.companyId || 0}
                    workspaceId={workspaceId}
                    projectId={projectId}
                    statusId={Number(rawId)}
                    onCancel={() => setIsCreating(false)}
                    onSuccess={() => {
                      window.location.reload(); 
                    }}
                  />
                </div>
              ) : (
                !isOver && (
                  <button
                    onClick={() => setIsCreating(true)}
                    className={cn(
                      "w-full py-2.5 mt-1 flex items-center gap-1.5 rounded-[3px] transition-colors px-2",
                      "text-[#5E6C84] hover:bg-[#091E4214] hover:text-[#172B4D]"
                    )}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-[13px] font-medium">Create issue</span>
                  </button>
                )
              )}
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        /* Minimal scrollbar for Jira-like column scrolling */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #DFE1E6; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #C1C7D0; }
      `}</style>
    </div>
  );
}