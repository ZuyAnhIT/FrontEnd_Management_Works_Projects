"use client";

import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Plus } from "lucide-react";
import { useMemo } from "react";
import { BoardColumnResponse } from "@/services/apiBoard";
import BoardTaskCard from "./BoardTaskCard";
import { ColumnContextMenu } from "./ColumnContextMenu";
import { useToast } from "@/components/ui/ToastProvider";

interface BoardColumnProps {
  column: BoardColumnResponse;
  index: number; // Keep index prop if used by parent, though dnd-kit uses IDs
  projectId: number;
  onDeleteColumn?: (columnId: string) => void;
}

export default function BoardColumn({ column, projectId, onDeleteColumn }: BoardColumnProps) {
  const { showToast } = useToast();

  // 🛡️ Guard Clause
  if (!column || (column.id === undefined && (column as any).statusId === undefined)) {
    return null;
  }

  // Safe ID handling
  const rawId = column.id ?? (column as any).statusId;
  const columnId = rawId !== undefined && rawId !== null ? String(rawId) : `col-${Math.random()}`;
  const displayName = column.name || "Untitled Column";
  const tasks = Array.isArray(column.tasks) ? column.tasks : [];

  // Memoize task IDs for SortableContext
  const taskIds = useMemo(() => tasks.map((t) => t.id.toString()), [tasks]);

  // 1. Make the Column Sortable (Horizontal reordering)
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
  });

  const columnStyle = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isColumnDragging ? 0.5 : 1,
  };

  // 2. Make the Task List Droppable (for dragging tasks INTO this column)
  const { setNodeRef: setTaskListRef, isOver } = useDroppable({
    id: columnId, // The droppable ID is the column ID
    data: {
      type: "Column", // Identifying this drop zone as a Column
      column,
    }
  });

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
        {/* Drag handle is applied here via listeners/attributes */}
        <div
          {...attributes}
          {...listeners}
          className="p-3 pr-2 flex items-center justify-between shrink-0 cursor-grab active:cursor-grabbing group/header"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <h3 className="text-[13px] font-bold text-[#5E6C84] uppercase truncate pl-1" title={displayName}>
              {displayName}
            </h3>
            {tasks.length > 0 && (
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
              columnLabel={displayName}
              onDeleted={onDeleteColumn}
              onMoveColumn={() => showToast("Feature in development", "info")}
              onSetColumnLimit={() => showToast("Feature in development", "info")}
            />
          </div>
        </div>

        {/* --- TASK LIST CONTAINER --- */}
        {/* This div is the Droppable area for tasks */}
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

          {/* Create Issue Button - hide when dragging over to reduce visual noise */}
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