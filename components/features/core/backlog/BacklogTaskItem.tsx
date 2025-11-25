"use client";

import { Draggable } from "@hello-pangea/dnd";
import { 
  Calendar, 
  User, 
  Flame, 
  CheckCircle2, 
  Bookmark, 
  Bug
} from "lucide-react";
import { TaskSummary } from "@/services/apiProject";

// Cấu hình màu sắc cho Priority
const priorityConfig: Record<string, string> = {
  URGENT: "border-l-4 border-l-red-500 bg-red-50/30",
  HIGH: "border-l-4 border-l-orange-500 bg-orange-50/30",
  MEDIUM: "border-l-4 border-l-blue-500",
  LOW: "border-l-4 border-l-slate-400",
};

const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "BUG": return <Bug className="w-3.5 h-3.5 text-red-500" />;
    case "STORY": return <Bookmark className="w-3.5 h-3.5 text-green-600" />;
    default: return <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />;
  }
};

interface BacklogTaskItemProps {
  task: TaskSummary;
  index: number;
  onClick?: () => void;
}

export default function BacklogTaskItem({ task, index, onClick }: BacklogTaskItemProps) {
  const priorityClass = priorityConfig[task.priority] || "border-l-4 border-l-slate-300";
  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-US', {day: '2-digit', month: 'short'}) : null;

  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => {
        
        // 🛠️ FIX QUAN TRỌNG: Style override để sửa lỗi lệch chuột & tối ưu độ mượt
        const itemStyle = {
          ...provided.draggableProps.style, // Giữ lại transform gốc của thư viện (QUAN TRỌNG NHẤT)
          
          // 1. Khi đang kéo, tắt transition để item dính chặt vào chuột (no lag)
          // 2. Khi thả ra (hoặc bình thường), bật lại transition để animation mượt mà
          transition: snapshot.isDragging ? 'none' : 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
          
          // Thay đổi con trỏ
          cursor: snapshot.isDragging ? 'grabbing' : 'grab',
          
          // Đảm bảo item đang kéo luôn nổi lên trên cùng
          zIndex: snapshot.isDragging ? 9999 : 'auto',

          // Reset vị trí để tránh xung đột với transform của thư viện
          ...(snapshot.isDragging && {
             top: 'auto !important',
             left: 'auto !important',
          })
        };

        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={itemStyle} // ✅ Áp dụng style đã tối ưu
            onClick={onClick}
            className={`
              group flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-white border rounded-r-lg select-none
              ${priorityClass}
              
              /* Chỉ apply hover effects khi KHÔNG kéo */
              ${!snapshot.isDragging ? "hover:shadow-md hover:border-blue-300" : ""}

              /* Style visual khi đang kéo (xoay nhẹ, đổ bóng đậm, scale lên chút) */
              ${snapshot.isDragging ? "shadow-2xl ring-2 ring-blue-500/50 rotate-2 scale-[1.02]" : "border-slate-200"}
            `}
          >
            {/* --- LEFT: INFO --- */}
            {/* pointer-events-none giúp trình duyệt bỏ qua check sự kiện chuột trên text con -> kéo mượt hơn */}
            <div className="flex-1 min-w-0 pointer-events-none"> 
              <div className="flex items-center gap-2 mb-1">
                 <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500">
                    <TypeIcon type={task.taskType} />
                    <span>{task.taskCode}</span>
                 </div>

                 {task.epicName && (
                   <span 
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border"
                      style={{
                         borderColor: task.epicColor || '#cbd5e1',
                         color: task.epicColor || '#64748b',
                         backgroundColor: `${task.epicColor}10`
                      }}
                   >
                      {task.epicName}
                   </span>
                 )}
              </div>
              
              <h4 className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-700">
                 {task.title}
              </h4>
            </div>

            {/* --- RIGHT: META --- */}
            <div className="flex items-center gap-4 sm:justify-end w-full sm:w-auto mt-2 sm:mt-0 text-xs text-slate-500 shrink-0 pointer-events-none">
                <span 
                  className="px-2 py-0.5 rounded font-semibold text-[10px] uppercase border"
                  style={{
                      color: task.statusColor,
                      borderColor: `${task.statusColor}40`,
                      backgroundColor: `${task.statusColor}10`
                  }}
                >
                  {task.statusName}
                </span>

                {task.storyPoints !== undefined && (
                   <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                      <Flame className="w-3 h-3 text-slate-400" />
                      <span className="font-mono font-bold text-slate-600">{task.storyPoints}</span>
                   </div>
                )}

                {task.assigneeAvatarUrl ? (
                   <img src={task.assigneeAvatarUrl} alt="Assignee" className="w-6 h-6 rounded-full border border-white shadow-sm" />
                ) : (
                   <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                      <User className="w-3 h-3 text-slate-400" />
                   </div>
                )}

                {task.dueDate && (
                   <div className="hidden sm:flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(task.dueDate)}</span>
                   </div>
                )}
            </div>
          </div>
        );
      }}
    </Draggable>
  );
}