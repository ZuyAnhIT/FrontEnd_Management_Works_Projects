"use client";

import { Droppable } from "@hello-pangea/dnd";
import { MoreHorizontal, Plus } from "lucide-react";
import { BoardColumnResponse } from "@/services/apiBoard";
import BoardTaskCard from "./BoardTaskCard";

interface BoardColumnProps {
  column: BoardColumnResponse;
  index: number;
}

export default function BoardColumn({ column }: BoardColumnProps) {
  const columnBg = "bg-[#F4F5F7]"; 

  // 🛡️ PHÒNG VỆ: Kiểm tra dữ liệu đầu vào
  if (!column || (column.id === undefined && (column as any).statusId === undefined)) {
    console.error("❌ BoardColumn Error: Invalid column data", column);
    return null; 
  }

  // Xử lý ID an toàn (đề phòng backend trả về số 0 hoặc null)
  // Ưu tiên 'id', fallback sang 'statusId' nếu có (tùy API thực tế), cuối cùng fallback string rỗng
  const rawId = column.id ?? (column as any).statusId;
  const dropId = rawId !== undefined && rawId !== null ? String(rawId) : `col-${Math.random()}`;

  // Tên hiển thị an toàn
  const displayName = column.name || "Untitled Column";
  const tasks = Array.isArray(column.tasks) ? column.tasks : [];

  return (
    <div className={`w-[272px] flex flex-col max-h-full rounded-xl ${columnBg} shrink-0 select-none`}>
        
        {/* --- COLUMN HEADER --- */}
        <div className="p-3 pr-2 flex items-center justify-between shrink-0 cursor-grab active:cursor-grabbing group">
            <div className="flex items-center gap-2 overflow-hidden">
                <h3 className="text-[13px] font-bold text-[#5E6C84] uppercase truncate pl-1" title={displayName}>
                    {displayName}
                </h3>
                {tasks.length > 0 && (
                    <span className="text-xs font-medium text-slate-600 bg-slate-200/50 px-1.5 rounded">
                        {tasks.length}
                    </span>
                )}
            </div>
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500">
                    <Plus className="w-4 h-4"/>
                </button>
                <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500">
                    <MoreHorizontal className="w-4 h-4"/>
                </button>
            </div>
        </div>

        {/* --- TASK LIST (DROPPABLE AREA) --- */}
        {/* ✅ Sử dụng dropId đã xử lý an toàn */}
        <Droppable droppableId={dropId} type="TASK">
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`
                        flex-1 overflow-y-auto custom-scrollbar px-2 pb-2 min-h-[10px] mx-1 mb-1 rounded-b-lg transition-colors
                        ${snapshot.isDraggingOver ? 'bg-blue-100/50' : ''}
                    `}
                >
                    {tasks.map((task, index) => (
                        <BoardTaskCard 
                            // Fallback key nếu task.id lỗi
                            key={task.id || `task-${index}`} 
                            task={task} 
                            index={index} 
                        />
                    ))}
                    {provided.placeholder}
                    
                    {/* Nút tạo nhanh task cuối cột */}
                    <button className="w-full py-1.5 mt-1 flex items-center gap-2 text-slate-500 hover:bg-slate-200/60 hover:text-slate-700 rounded transition-colors px-2 text-[13px]">
                        <Plus className="w-4 h-4" /> 
                        <span>Create issue</span>
                    </button>
                </div>
            )}
        </Droppable>
    </div>
  );
}