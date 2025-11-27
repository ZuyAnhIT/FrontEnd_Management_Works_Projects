"use client";

import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { BoardColumnResponse, updateProjectStatus } from "@/services/apiBoard"; // Import API update
import BoardTaskCard from "./BoardTaskCard";
import { ColumnContextMenu } from "./ColumnContextMenu";
import { useToast } from "@/components/ui/ToastProvider";

interface BoardColumnProps {
  column: BoardColumnResponse;
  index: number;
  projectId: number;
  onDeleteColumn?: (columnId: string) => void;
}

export default function BoardColumn({ column, projectId, onDeleteColumn }: BoardColumnProps) {
  const { showToast } = useToast();

  // --- STATE QUẢN LÝ SỬA TÊN ---
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(column.name);
  const [isSaving, setIsSaving] = useState(false);

  // Guard Clause
  if (!column || (column.id === undefined && (column as any).statusId === undefined)) {
    return null;
  }

  // Safe ID handling
  const rawId = column.id ?? (column as any).statusId;
  const columnId = rawId !== undefined && rawId !== null ? String(rawId) : `col-${Math.random()}`;
  const displayName = column.name || "Untitled Column"; // Dùng để hiển thị mặc định hoặc fallback
  const tasks = Array.isArray(column.tasks) ? column.tasks : [];

  const taskIds = useMemo(() => tasks.map((t) => t.id.toString()), [tasks]);

  // 1. Make the Column Sortable
  const {
    attributes,
    listeners,
    setNodeRef: setColumnRef,
    transform,
    transition,
    isDragging: isColumnDragging,
  } = useSortable({
    id: columnId,
    data: {
      type: "Column",
      column,
    },
    disabled: isEditing, // 🛑 QUAN TRỌNG: Tắt kéo thả cột khi đang sửa tên
  });

  const columnStyle = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isColumnDragging ? 0.5 : 1,
  };

  // 2. Make the Task List Droppable
  const { setNodeRef: setTaskListRef, isOver } = useDroppable({
    id: columnId,
    data: {
      type: "Column",
      column,
    }
  });

  // --- LOGIC HANDLE EDIT NAME ---
  const handleSaveTitle = async () => {
    // Nếu tên rỗng hoặc không đổi thì thoát chế độ edit
    if (!title.trim() || title === column.name) {
      setTitle(column.name);
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      // Gọi API cập nhật
      await updateProjectStatus(projectId, Number(rawId), { name: title });
      showToast("Cập nhật tên cột thành công", "success");
      setIsEditing(false);
    } catch (error) {
      showToast("Lỗi khi cập nhật tên cột", "error");
      setTitle(column.name); // Revert về tên cũ
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveTitle();
    } else if (e.key === "Escape") {
      setTitle(column.name); // Hủy bỏ
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
        {/* --- COLUMN HEADER --- */}
        <div
          {...attributes}
          {...listeners}
          className="p-3 pr-2 flex items-center justify-between shrink-0 cursor-grab active:cursor-grabbing group/header"
        >
          <div className="flex items-center gap-2 overflow-hidden flex-1">
            
            {/* --- LOGIC HIỂN THỊ INPUT / TEXT --- */}
            {isEditing ? (
              <input 
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={handleKeyDown}
                disabled={isSaving}
                // 🛑 Chặn sự kiện chuột để không kích hoạt drag từ cha
                onPointerDown={(e) => e.stopPropagation()} 
                className="w-full text-[13px] font-bold text-[#172B4D] uppercase bg-white border border-blue-500 rounded px-1 py-0.5 outline-none"
              />
            ) : (
              <h3 
                className="text-[13px] font-bold text-[#5E6C84] uppercase truncate pl-1 cursor-text border border-transparent hover:border-gray-300 rounded px-1 transition-colors" 
                title="Nhấn để đổi tên"
                onClick={() => setIsEditing(true)}
              >
                {title}
              </h3>
            )}

            {/* Chỉ hiện số lượng task khi không edit để đỡ rối */}
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

        {/* --- TASK LIST CONTAINER --- */}
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
              />
            ))}
          </SortableContext>

          {/* Create Issue Button */}
          {!isOver && (
            <button className="w-full py-2 mt-1 flex items-center gap-1.5 text-[#5E6C84] hover:bg-[#091E4214] hover:text-[#172B4D] rounded-[3px] transition-colors px-2">
              <Plus className="w-4 h-4" />
              <span className="text-[13px] font-medium">Create issue</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}