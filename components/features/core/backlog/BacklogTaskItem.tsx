"use client";

import { useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  Calendar, 
  User, 
  Flame, 
  CheckCircle2, 
  Bookmark, 
  Bug,
  LucideIcon
} from "lucide-react";
import { TaskSummary } from "@/services/apiProject";

// =============================================================================
// 1. CONFIGURATION & HELPERS
// =============================================================================

// Cấu hình style cho mức độ ưu tiên
const PRIORITY_STYLES: Record<string, string> = {
  URGENT: "border-l-4 border-l-red-500 bg-red-50/30",
  HIGH: "border-l-4 border-l-orange-500 bg-orange-50/30",
  MEDIUM: "border-l-4 border-l-blue-500",
  LOW: "border-l-4 border-l-slate-400",
  DEFAULT: "border-l-4 border-l-slate-300",
};

// Hàm format ngày tháng (Tách ra để tái sử dụng và tránh tạo lại hàm)
const formatDate = (dateString?: string) => {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit', 
      month: 'short'
    });
  } catch {
    return null;
  }
};

// Hàm tạo style động cho Badge (Epic, Status) dựa trên mã màu Hex
const getDynamicBadgeStyle = (colorHex?: string) => {
  const color = colorHex || "#64748b"; // Slate-500 fallback
  return {
    color: color,
    borderColor: `${color}40`,     // Opacity 25%
    backgroundColor: `${color}10`, // Opacity 10%
  };
};

// =============================================================================
// 2. SUB-COMPONENTS
// =============================================================================

const TaskTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "BUG": 
      return <Bug className="w-3.5 h-3.5 text-red-500" />;
    case "STORY": 
      return <Bookmark className="w-3.5 h-3.5 text-green-600" />;
    default: 
      return <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />;
  }
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

interface BacklogTaskItemProps {
  task: TaskSummary;
  index: number;
  onClick?: () => void;
  isOverlay?: boolean; // Cờ báo hiệu item này đang được kéo (Overlay)
}

export default function BacklogTaskItem({ 
  task, 
  index, 
  onClick, 
  isOverlay 
}: BacklogTaskItemProps) {
  
  // --- PREPARE DATA ---
  
  // Style ưu tiên
  const priorityClass = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.DEFAULT;
  
  // Thông tin Status & Epic
  const statusName = task.status?.name || "Unknown";
  const epicName = task.epic?.name;
  
  // Style động
  const statusStyle = getDynamicBadgeStyle(task.status?.color);
  const epicStyle = getDynamicBadgeStyle(task.epic?.color);

  // ID cho dnd-kit
  const sortableId = useMemo(() => task.id.toString(), [task.id]);

  // --- DND-KIT HOOK ---
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sortableId,
    data: { type: "Task", task, index },
    disabled: isOverlay, // Vô hiệu hóa sortable logic nếu đây là item overlay
  });

  // --- DND STYLES ---
  
  // Style cơ bản
  const baseStyle: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1, // Làm mờ item gốc khi đang kéo
    cursor: isDragging ? 'grabbing' : 'grab',
    touchAction: 'none',
  };

  // Style khi đang kéo (Overlay) - Nổi lên trên
  const overlayStyleConfig: React.CSSProperties = {
    cursor: 'grabbing',
    opacity: 1,
    transform: 'scale(1.02)',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    zIndex: 999,
  };

  const finalStyle = isOverlay ? overlayStyleConfig : baseStyle;

  // --- RENDER ---
  return (
    <div
      ref={setNodeRef}
      style={finalStyle}
      {...(!isOverlay ? { ...attributes, ...listeners } : {})}
      onClick={onClick}
      className={`
        group flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-white border rounded-r-lg select-none mb-2
        ${priorityClass}
        ${!isDragging && !isOverlay ? "hover:shadow-md hover:border-blue-300 transition-all" : ""}
        ${isDragging ? "border-dashed border-slate-300 bg-slate-50" : "border-slate-200"}
      `}
    >
      
      {/* --- LEFT COLUMN: INFO --- */}
      <div className="flex-1 min-w-0 pointer-events-none"> 
        {/* Meta Row: Type, Code, Epic */}
        <div className="flex items-center gap-2 mb-1">
           <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500">
             <TaskTypeIcon type={task.taskType} />
             <span>{task.taskCode}</span>
           </div>

           {epicName && (
             <span 
               className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border truncate max-w-[120px]"
               style={epicStyle}
             >
               {epicName}
             </span>
           )}
        </div>
        
        {/* Task Title */}
        <h4 className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-700">
           {task.title}
        </h4>
      </div>

      {/* --- RIGHT COLUMN: META DATA --- */}
      <div className="flex items-center gap-4 sm:justify-end w-full sm:w-auto mt-2 sm:mt-0 text-xs text-slate-500 shrink-0 pointer-events-none">
          
          {/* Status Badge */}
          <span 
            className="px-2 py-0.5 rounded font-bold text-[10px] uppercase border"
            style={statusStyle}
          >
            {statusName}
          </span>

          {/* Story Points */}
          {task.storyPoints != null && (
             <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                <Flame className="w-3 h-3 text-slate-400" />
                <span className="font-mono font-bold text-slate-600">{task.storyPoints}</span>
             </div>
          )}

          {/* Assignee Avatar */}
          {task.assignee?.avatarUrl ? (
             <img 
               src={task.assignee.avatarUrl} 
               alt="Assignee" 
               className="w-6 h-6 rounded-full border border-white shadow-sm object-cover" 
             />
          ) : (
             <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                <User className="w-3 h-3 text-slate-400" />
             </div>
          )}

          {/* Due Date */}
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