"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useMemo } from "react";
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

// Internal Services & Utils
import { TaskSummary } from "@/services/apiProject";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. CONFIGURATION & HELPERS
// =============================================================================

/**
 * Cấu hình màu sắc viền trái dựa trên mức độ ưu tiên của công việc.
 */
const PRIORITY_STYLES: Record<string, string> = {
  URGENT: "border-l-[3px] border-l-red-500 bg-red-50/20",
  HIGH: "border-l-[3px] border-l-orange-500 bg-orange-50/20",
  MEDIUM: "border-l-[3px] border-l-blue-500",
  LOW: "border-l-[3px] border-l-slate-400",
  DEFAULT: "border-l-[3px] border-l-slate-300",
};

/**
 * Định dạng ngày tháng hiển thị dạng ngắn gọn (Ví dụ: "Oct 24")
 */
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

/**
 * Hàm tạo CSS động cho các thẻ Badge (Epic, Status) dựa trên mã màu HEX từ API.
 */
const getDynamicBadgeStyle = (colorHex?: string): React.CSSProperties => {
  const color = colorHex || "#64748b"; // Fallback to slate-500
  return {
    color: color,
    borderColor: `${color}40`,     // Opacity 25% for border
    backgroundColor: `${color}10`, // Opacity 10% for background
  };
};

// =============================================================================
// 3. SUB-COMPONENTS
// =============================================================================

/**
 * Biểu tượng thể hiện loại công việc (Story, Bug, Task).
 */
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
// 4. MAIN COMPONENT
// =============================================================================

interface BacklogTaskItemProps {
  task: TaskSummary;
  index: number;
  onClick?: () => void;
  isOverlay?: boolean; // Cờ báo hiệu component đang được render dưới dạng "bóng" khi kéo thả
}

/**
 * Thành phần hiển thị một thẻ công việc trong danh sách Backlog.
 * Hỗ trợ kéo thả (Drag and Drop) và hiển thị thông tin metadata đầy đủ.
 */
export default function BacklogTaskItem({ 
  task, 
  index, 
  onClick, 
  isOverlay = false 
}: BacklogTaskItemProps) {
  
  // ---------------------------------------------------------------------------
  // 5. PREPARE DATA
  // ---------------------------------------------------------------------------
  
  const priorityClass = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.DEFAULT;
  const statusName = task.status?.name || "Unknown";
  const epicName = task.epic?.name;
  
  const statusStyle = useMemo(() => getDynamicBadgeStyle(task.status?.color), [task.status?.color]);
  const epicStyle = useMemo(() => getDynamicBadgeStyle(task.epic?.color), [task.epic?.color]);

  // Sinh ID duy nhất cho dnd-kit
  const sortableId = useMemo(() => task.id.toString(), [task.id]);

  // ---------------------------------------------------------------------------
  // 6. DND-KIT HOOK & STYLES
  // ---------------------------------------------------------------------------
  
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
    disabled: isOverlay, 
  });

  // Style áp dụng cho Item đang nằm trên luồng bình thường
  const baseStyle: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1, // Làm mờ nhẹ phần tử gốc khi kéo
    cursor: isDragging ? 'grabbing' : 'grab',
    touchAction: 'none',
  };

  // Style áp dụng cho Item "bóng" (Overlay) đang dính vào con trỏ chuột
  const overlayStyleConfig: React.CSSProperties = {
    cursor: 'grabbing',
    opacity: 1,
    transform: 'scale(1.02)', // Phóng to nhẹ để tạo cảm giác "nhấc lên"
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    zIndex: 999,
  };

  const finalStyle = isOverlay ? overlayStyleConfig : baseStyle;

  // ---------------------------------------------------------------------------
  // 7. RENDER
  // ---------------------------------------------------------------------------
  
  return (
    <div
      ref={setNodeRef}
      style={finalStyle}
      {...(!isOverlay ? { ...attributes, ...listeners } : {})}
      onClick={onClick}
      className={cn(
        "group flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-white border rounded-r-xl select-none mb-2",
        "outline-none", // Loại bỏ viền xanh mặc định của dnd-kit khi focus
        priorityClass,
        !isDragging && !isOverlay && "hover:shadow-md hover:border-blue-300 transition-all",
        isDragging ? "border-dashed border-slate-300 bg-slate-50/80" : "border-slate-200"
      )}
    >
      
      {/* KHỐI TRÁI: THÔNG TIN CHÍNH (IDENTIFICATION) */}
      <div className="flex-1 min-w-0 pointer-events-none"> 
        <div className="flex items-center gap-2.5 mb-1.5">
           
           <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
             <TaskTypeIcon type={task.taskType} />
             <span>{task.taskCode}</span>
           </div>

           {epicName && (
             <span 
               className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border truncate max-w-[140px]"
               style={epicStyle}
             >
               {epicName}
             </span>
           )}
        </div>
        
        <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
           {task.title}
        </h4>
      </div>

      {/* KHỐI PHẢI: THÔNG TIN PHỤ & NGƯỜI THỰC HIỆN (META DATA) */}
      <div className="flex items-center gap-3 sm:justify-end w-full sm:w-auto mt-3 sm:mt-0 text-xs text-slate-500 shrink-0 pointer-events-none">
          
          <span 
            className="px-2 py-1 rounded-md font-bold text-[9px] uppercase tracking-widest border"
            style={statusStyle}
          >
            {statusName}
          </span>

          {task.storyPoints != null && (
             <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                <Flame className="w-3 h-3 text-orange-500" />
                <span className="font-mono font-bold text-slate-600 text-[10px]">{task.storyPoints}</span>
             </div>
          )}

          {task.assignee?.avatarUrl ? (
             <img 
               src={task.assignee.avatarUrl} 
               alt="Assignee Avatar" 
               className="w-7 h-7 rounded-full border-2 border-white shadow-sm object-cover" 
             />
          ) : (
             <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-slate-400" />
             </div>
          )}

          {task.dueDate && (
             <div className="hidden sm:flex items-center gap-1.5 text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                <Calendar className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{formatDate(task.dueDate)}</span>
             </div>
          )}
      </div>
    </div>
  );
}