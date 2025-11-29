"use client";

import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import { BoardColumnResponse, updateProjectStatus } from "@/services/apiBoard";
import { TaskSummary } from "@/services/apiProject"; // Import TaskSummary type
import BoardTaskCard from "./BoardTaskCard";
import { ColumnContextMenu } from "./ColumnContextMenu";
import { useToast } from "@/components/ui/ToastProvider";
import QuickTaskCreate from "@/components/features/core/task/QuickTaskCreate";

// Updated Interface
interface BoardColumnProps {
  column: BoardColumnResponse;
  index: number;
  projectId: number;
  members: any[]; // Consider defining a User type
  onDeleteColumn?: (columnId: string) => void;
  onTaskClick?: (task: TaskSummary) => void; // ✅ [NEW] Prop để handle click vào task
}

export default function BoardColumn({ 
  column, 
  projectId, 
  onDeleteColumn, 
  members,
  onTaskClick // ✅ [NEW] Destructure prop
}: BoardColumnProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { activeCompany } = useAuth();

  const workspaceId = Number(params.workspaceId);

  // --- STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(column.name);
  const [isSaving, setIsSaving] = useState(false);
  
  // State for quick task creation
  const [isCreating, setIsCreating] = useState(false);

  // Guard Clause
  if (!column || (column.id === undefined && (column as any).statusId === undefined)) {
    return null;
  }

  // Safe ID handling
  const rawId = column.id ?? (column as any).statusId;
  const columnId = rawId !== undefined && rawId !== null ? String(rawId) : `col-${Math.random()}`;
  const displayName = title || "Untitled Column"; 
  const tasks = Array.isArray(column.tasks) ? column.tasks : [];

  const taskIds = useMemo(() => tasks.map((t) => t.id.toString()), [tasks]);

  // 1. DND Sortable (Column)
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
    disabled: isEditing || isCreating, 
  });

  const columnStyle = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isColumnDragging ? 0.5 : 1,
  };

  // 2. DND Droppable (Task List)
  const { setNodeRef: setTaskListRef, isOver } = useDroppable({
    id: columnId,
    data: { type: "Column", column }
  });

  // --- HANDLERS ---
  const handleSaveTitle = async () => {
    if (!title.trim() || title === column.name) {
      setTitle(column.name);
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await updateProjectStatus(projectId, Number(rawId), { name: title });
      showToast("Cập nhật tên cột thành công", "success");
      setIsEditing(false);
    } catch (error) {
      showToast("Lỗi khi cập nhật tên cột", "error");
      setTitle(column.name);
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

  const columnBg = "bg-[#F4F5F7]";
  const activeBg = "bg-[#E3F2FD] ring-2 ring-[#2684FF] ring-inset";

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
          ${isOver ? activeBg : columnBg}
        `}
      >
        {/* HEADER */}
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
                onPointerDown={(e) => e.stopPropagation()} 
                className="w-full text-[13px] font-bold text-[#172B4D] uppercase bg-white border border-blue-500 rounded px-1 py-0.5 outline-none"
              />
            ) : (
              <h3 
                className="text-[13px] font-bold text-[#5E6C84] uppercase truncate pl-1 cursor-text border border-transparent hover:border-gray-300 rounded px-1 transition-colors" 
                title="Click to edit name"
                onClick={() => setIsEditing(true)}
              >
                {displayName}
              </h3>
            )}
            {!isEditing && tasks.length > 0 && (
              <span className="text-xs font-medium text-[#172B4D] bg-[#DFE1E6] px-2 py-0.5 rounded-full">
                {tasks.length}
              </span>
            )}
          </div>
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

        {/* TASK LIST */}
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
                onClick={onTaskClick} // ✅ [NEW] Truyền prop click xuống card
              />
            ))}
          </SortableContext>

          {/* QUICK CREATE AREA */}
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