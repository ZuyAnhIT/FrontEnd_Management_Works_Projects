"use client";

import { useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Plus } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { BoardColumnResponse, updateProjectStatus } from "@/services/apiBoard";
import { TaskSummary } from "@/services/apiProject";

import BoardTaskCard from "./BoardTaskCard";
import { ColumnContextMenu } from "./ColumnContextMenu";
import QuickTaskCreate from "@/components/features/core/task/QuickTaskCreate";

// =============================================================================
// 1. CONSTANTS & CONFIG
// =============================================================================

const COLORS = {
  bgDefault: "bg-[#F4F5F7]",
  bgActive: "bg-[#E3F2FD] ring-2 ring-[#2684FF] ring-inset",
  textPrimary: "text-[#172B4D]",
  textSecondary: "text-[#5E6C84]",
  badgeBg: "bg-[#DFE1E6]",
};

// =============================================================================
// 2. INTERFACES
// =============================================================================

interface BoardColumnProps {
  column: BoardColumnResponse;
  index: number;
  projectId: number;
  members: any[]; // Có thể thay 'any' bằng Interface User nếu có
  onDeleteColumn?: (columnId: string) => void;
  onTaskClick?: (task: TaskSummary) => void;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function BoardColumn({
  column,
  projectId,
  onDeleteColumn,
  members,
  onTaskClick
}: BoardColumnProps) {
  // --- HOOKS ---
  const { showToast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { activeCompany } = useAuth();

  const workspaceId = Number(params.workspaceId);

  // --- STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(column.name);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false); // Quick create state

  // --- DATA PREPARATION ---
  
  // Guard Clause: Kiểm tra dữ liệu cột hợp lệ
  if (!column || (column.id === undefined && (column as any).statusId === undefined)) {
    return null;
  }

  // Xử lý ID an toàn (Fallback nếu ID null)
  const rawId = column.id ?? (column as any).statusId;
  const columnId = rawId !== undefined && rawId !== null ? String(rawId) : `col-${Math.random()}`;
  
  const displayName = title || "Untitled Column";
  const tasks = Array.isArray(column.tasks) ? column.tasks : [];
  const taskIds = useMemo(() => tasks.map((t) => t.id.toString()), [tasks]);

  // --- DND HOOKS ---

  // 1. Sortable (Cho chính cột này để kéo thả cột)
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
    disabled: isEditing || isCreating, // Tắt kéo khi đang edit hoặc tạo task
  });

  const columnStyle = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isColumnDragging ? 0.5 : 1,
  };

  // 2. Droppable (Vùng thả cho các Task)
  const { setNodeRef: setTaskListRef, isOver } = useDroppable({
    id: columnId,
    data: { type: "Column", column }
  });

  // --- HANDLERS ---

  // Xử lý lưu tên cột
  const handleSaveTitle = async () => {
    // Validate: Không lưu nếu rỗng hoặc chưa thay đổi
    if (!title.trim() || title === column.name) {
      setTitle(column.name);
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await updateProjectStatus(projectId, Number(rawId), { name: title });
      showToast("Column renamed successfully", "success");
      setIsEditing(false);
    } catch (error: any) {
      // Lấy message lỗi từ API
      const errorMsg = error.message || error.response?.data?.message || "Failed to rename column";
      showToast(errorMsg, "error");
      setTitle(column.name); // Revert lại tên cũ
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSaveTitle();
    else if (e.key === "Escape") {
      setTitle(column.name);
      setIsEditing(false);
    }
  };

  // --- RENDER ---
  return (
    <div
      ref={setColumnRef}
      style={columnStyle}
      className={`
        w-[272px] flex flex-col shrink-0 select-none h-full max-h-full
        ml-3 first:ml-0 rounded-xl transition-all duration-200
        ${isColumnDragging ? "z-50 shadow-2xl" : ""}
      `}
    >
      <div
        className={`
          flex flex-col h-full rounded-xl transition-colors duration-200
          ${isOver ? COLORS.bgActive : COLORS.bgDefault}
        `}
      >
        {/* ================= HEADER SECTION ================= */}
        <div
          {...attributes}
          {...listeners}
          className="p-3 pr-2 flex items-center justify-between shrink-0 cursor-grab active:cursor-grabbing group/header"
        >
          <div className="flex items-center gap-2 overflow-hidden flex-1">
            {isEditing ? (
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={handleKeyDown}
                disabled={isSaving}
                onPointerDown={(e) => e.stopPropagation()} // Ngăn kéo thả khi đang click input
                className={`w-full text-[13px] font-bold ${COLORS.textPrimary} uppercase bg-white border border-blue-500 rounded px-1 py-0.5 outline-none`}
              />
            ) : (
              <h3
                className={`text-[13px] font-bold ${COLORS.textSecondary} uppercase truncate pl-1 cursor-text border border-transparent hover:border-gray-300 rounded px-1 transition-colors`}
                title="Click to edit name"
                onClick={() => setIsEditing(true)}
              >
                {displayName}
              </h3>
            )}
            
            {/* Task Count Badge */}
            {!isEditing && tasks.length > 0 && (
              <span className={`text-xs font-medium ${COLORS.textPrimary} ${COLORS.badgeBg} px-2 py-0.5 rounded-full`}>
                {tasks.length}
              </span>
            )}
          </div>

          {/* Action Buttons (More Options) */}
          <div className="flex gap-0.5 opacity-0 group-hover/header:opacity-100 transition-opacity">
            <button className="p-1 hover:bg-[#091E4214] rounded text-[#42526E]">
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
        </div>

        {/* ================= BODY SECTION (TASK LIST) ================= */}
        <div
          ref={setTaskListRef}
          className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-2 min-h-[150px]"
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
          {isCreating ? (
            <div className="mt-1 px-2 pb-2">
              <QuickTaskCreate
                initialMode="form"
                companyId={activeCompany?.companyId || 0}
                workspaceId={workspaceId}
                projectId={projectId}
                statusId={Number(rawId)}
                onCancel={() => setIsCreating(false)}
                onSuccess={() => {
                  router.refresh();
                }}
              />
            </div>
          ) : (
            !isOver && (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full py-2 mt-1 flex items-center gap-1.5 text-[#5E6C84] hover:bg-[#091E4214] hover:text-[#172B4D] rounded-[3px] transition-colors px-2"
              >
                <Plus className="w-4 h-4" />
                <span className="text-[13px] font-medium">Create issue</span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}