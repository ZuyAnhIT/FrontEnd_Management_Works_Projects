"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  Calendar, 
  User, 
  Flame, 
  CheckCircle2, 
  Bookmark, 
  Bug
} from "lucide-react";
import { TaskSummary } from "@/services/apiProject";
import { useMemo } from "react";

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

  // Tạo ID duy nhất cho dnd-kit
  const sortableId = useMemo(() => task.id.toString(), [task.id]);

  // Hook xử lý logic kéo thả
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sortableId,
    data: {
      type: "Task",
      task,
      index, 
    },
  });

  // 🛠️ STYLE CONFIGURATION (Tối ưu cho dnd-kit)
  const style = {
    // Dùng CSS.Translate để di chuyển mượt mà, tránh bị mờ chữ (blur)
    transform: CSS.Translate.toString(transform),
    
    // Transition quản lý bởi dnd-kit
    transition,
    
    // Style con trỏ chuột
    cursor: isDragging ? 'grabbing' : 'grab',
    
    // Ngăn chặn hành vi cuộn mặc định của trình duyệt trên thiết bị cảm ứng
    touchAction: 'none',
    
    // QUAN TRỌNG: Khi đang kéo, ẩn item gốc đi (opacity: 0) để tạo khoảng trống.
    // Item thực sự nhìn thấy đang di chuyển là DragOverlay (ở file cha).
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        group flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-white border rounded-r-lg select-none
        ${priorityClass}
        
        /* Hiệu ứng hover chỉ hiện khi KHÔNG kéo */
        ${!isDragging ? "hover:shadow-md hover:border-blue-300" : ""}

        /* Khi kéo, placeholder (item gốc ẩn) sẽ hiển thị viền dashed để đánh dấu vị trí */
        ${isDragging ? "border-dashed border-slate-300 bg-slate-50" : "border-slate-200"}
      `}
    >
      {/* Nội dung bên trong: 
         Ta có thể ẩn nội dung khi đang dragging để placeholder sạch sẽ hơn, 
         nhưng vì đã set opacity: 0 ở style nên không cần thiết phải ẩn thủ công.
      */}
      
      {/* --- LEFT: INFO --- */}
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
}