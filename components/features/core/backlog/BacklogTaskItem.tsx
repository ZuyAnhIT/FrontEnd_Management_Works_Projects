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

// Configuration for Priority Colors
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
  isOverlay?: boolean; // Prop to styling drag overlay
}

export default function BacklogTaskItem({ task, index, onClick, isOverlay }: BacklogTaskItemProps) {
  // ✅ SAFELY EXTRACT DATA FROM NESTED OBJECTS
  const priorityClass = priorityConfig[task.priority] || "border-l-4 border-l-slate-300";
  
  // Status Access
  const statusName = task.status?.name || "Unknown";
  const statusColor = task.status?.color || "#64748b";

  // Epic Access
  const epicName = task.epic?.name;
  const epicColor = task.epic?.color;

  // Assignee Access
  const assigneeAvatar = task.assignee?.avatarUrl;

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-US', {day: '2-digit', month: 'short'}) : null;

  // Create unique ID for dnd-kit
  const sortableId = useMemo(() => task.id.toString(), [task.id]);

  // Hook for drag and drop logic
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
    disabled: isOverlay // Disable sortable logic if this is the overlay
  });

  // 🛠️ STYLE CONFIGURATION (Optimized for dnd-kit)
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    cursor: isOverlay ? 'grabbing' : (isDragging ? 'grabbing' : 'grab'),
    touchAction: 'none',
    opacity: isDragging ? 0.3 : 1, // Dim original item when dragging
  };

  // Overlay specific style
  const overlayStyle: React.CSSProperties = isOverlay ? {
     cursor: 'grabbing',
     opacity: 1,
     transform: 'scale(1.02)',
     boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
     zIndex: 999
  } : style;

  return (
    <div
      ref={setNodeRef}
      style={overlayStyle}
      {...(!isOverlay ? { ...attributes, ...listeners } : {})}
      onClick={onClick}
      className={`
        group flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-white border rounded-r-lg select-none mb-2
        ${priorityClass}
        
        /* Hover effect only when NOT dragging */
        ${!isDragging && !isOverlay ? "hover:shadow-md hover:border-blue-300 transition-all" : ""}

        /* Placeholder style when dragging */
        ${isDragging ? "border-dashed border-slate-300 bg-slate-50" : "border-slate-200"}
      `}
    >
      
      {/* --- LEFT: INFO --- */}
      <div className="flex-1 min-w-0 pointer-events-none"> 
        <div className="flex items-center gap-2 mb-1">
           <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500">
             <TypeIcon type={task.taskType} />
             <span>{task.taskCode}</span>
           </div>

           {epicName && (
             <span 
               className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border truncate max-w-[120px]"
               style={{
                  borderColor: `${epicColor}40` || '#cbd5e1',
                  color: epicColor || '#64748b',
                  backgroundColor: `${epicColor}10` || '#f1f5f9'
               }}
             >
               {epicName}
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
            className="px-2 py-0.5 rounded font-bold text-[10px] uppercase border"
            style={{
               color: statusColor,
               borderColor: `${statusColor}40`,
               backgroundColor: `${statusColor}10`
            }}
          >
            {statusName}
          </span>

          {task.storyPoints !== undefined && task.storyPoints !== null && (
             <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                <Flame className="w-3 h-3 text-slate-400" />
                <span className="font-mono font-bold text-slate-600">{task.storyPoints}</span>
             </div>
          )}

          {assigneeAvatar ? (
             <img src={assigneeAvatar} alt="Assignee" className="w-6 h-6 rounded-full border border-white shadow-sm object-cover" />
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