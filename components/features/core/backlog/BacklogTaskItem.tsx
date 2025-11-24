"use client";

import { 
  Calendar, 
  User, 
  Flame, 
  AlertCircle, 
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

// Cấu hình icon cho Task Type
const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "BUG": return <Bug className="w-3.5 h-3.5 text-red-500" />;
    case "STORY": return <Bookmark className="w-3.5 h-3.5 text-green-600" />;
    default: return <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />;
  }
};

interface BacklogTaskItemProps {
  task: TaskSummary;
  onClick?: () => void;
}

export default function BacklogTaskItem({ task, onClick }: BacklogTaskItemProps) {
  const priorityClass = priorityConfig[task.priority] || "border-l-4 border-l-slate-300";
  
  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-US', {day: '2-digit', month: 'short'}) : null;

  return (
    <div 
      onClick={onClick}
      className={`group flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-white border border-slate-200 rounded-r-lg hover:shadow-md hover:border-blue-300 transition-all cursor-pointer ${priorityClass}`}
    >
      {/* --- LEFT: INFO --- */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
           {/* Type & Code */}
           <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500">
              <TypeIcon type={task.taskType} />
              <span>{task.taskCode}</span>
           </div>

           {/* Epic Label (Nếu có) */}
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
        
        {/* Title */}
        <h4 className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-700">
           {task.title}
        </h4>
      </div>

      {/* --- RIGHT: META --- */}
      <div className="flex items-center gap-4 sm:justify-end w-full sm:w-auto mt-2 sm:mt-0 text-xs text-slate-500">
          
          {/* Status Badge */}
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

          {/* Story Points */}
          {task.storyPoints !== undefined && (
             <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                <Flame className="w-3 h-3 text-slate-400" />
                <span className="font-mono font-bold text-slate-600">{task.storyPoints}</span>
             </div>
          )}

          {/* Assignee Avatar */}
          {task.assigneeAvatarUrl ? (
             <img src={task.assigneeAvatarUrl} alt="Assignee" className="w-6 h-6 rounded-full border border-white shadow-sm" title={task.assigneeName} />
          ) : (
             <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                <User className="w-3 h-3 text-slate-400" />
             </div>
          )}

          {/* Due Date (Ẩn trên mobile nhỏ) */}
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