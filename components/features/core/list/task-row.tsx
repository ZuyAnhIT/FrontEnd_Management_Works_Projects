"use client";

import React from "react";
import { Calendar, Bug, Bookmark, CheckCircle2, User, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
// ✅ FIX: Import đúng từ apiProject
import { TaskResponse } from "@/services/apiProject"; 

// --- CONFIGURATION ---
const PriorityConfig = ({ priority }: { priority: string }) => {
  const p = priority?.toUpperCase();
  switch (p) {
    case 'URGENT': return <ArrowUp className="w-3.5 h-3.5 text-red-600" />;
    case 'HIGH': return <ArrowUp className="w-3.5 h-3.5 text-orange-500" />;
    case 'LOW': return <ArrowDown className="w-3.5 h-3.5 text-green-500" />; // Chỉnh lại màu green cho Low
    default: return <Minus className="w-3.5 h-3.5 text-slate-400" />; // Medium/Normal
  }
};

const TypeIcon = ({ type }: { type: string }) => {
  const t = type?.toUpperCase();
  switch (t) {
    case "BUG": return <Bug className="w-3.5 h-3.5 text-red-500" />;
    case "STORY": return <Bookmark className="w-3.5 h-3.5 text-green-600" />;
    default: return <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />;
  }
};

// --- COMPONENT ---
interface TaskRowProps {
  task: TaskResponse;
  onTaskSelect?: (task: TaskResponse) => void;
  isSelected?: boolean; // Support selection state
  onToggleSelect?: (id: number) => void;
}

const TaskRow = React.memo(function TaskRow({ task, onTaskSelect, isSelected, onToggleSelect }: TaskRowProps) {
  
  // ✅ SAFELY EXTRACT DATA (Hỗ trợ cả flat và nested object)
  // Ưu tiên lấy từ nested object (task.status.name) theo chuẩn DTO mới nhất
  const statusName = task.status?.name || (task as any).statusName || "Unknown";
  const statusColor = task.status?.color || (task as any).statusColor || "#64748b";
  const assigneeName = task.assignee?.name || (task as any).assigneeName;
  const assigneeAvatar = task.assignee?.avatarUrl || (task as any).assigneeAvatarUrl; 
  
  // Helper: Format Date
  const formatDate = (d?: string | null) => {
    if (!d) return "-";
    try {
        return new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    } catch (e) { return d; }
  };

  // Logic quá hạn: Có DueDate + Chưa xong + Ngày quá hạn < Hiện tại
  const isCompleted = task.status?.isCompleted || statusName.toLowerCase() === 'done';
  const isOverdue = !isCompleted && task.dueDate ? new Date(task.dueDate) < new Date() : false;

  // Helper: Avatar Initials
  const getInitials = (name?: string) => {
    return name ? name.substring(0, 2).toUpperCase() : "UN";
  };

  return (
    <tr 
        className={`border-b border-slate-100 hover:bg-slate-50/80 transition-colors group/row ${isSelected ? 'bg-blue-50/30' : ''}`}
    >
      
      {/* 1. Checkbox */}
      <td className="w-10 px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
         <input 
            type="checkbox" 
            checked={isSelected}
            onChange={() => onToggleSelect?.(task.id)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4" 
         />
      </td>

      {/* 2. Type & Key */}
      <td className="px-4 py-3 whitespace-nowrap w-24">
         <div className="flex items-center gap-2 cursor-pointer" onClick={() => onTaskSelect?.(task)}>
            <div className="mt-0.5"><TypeIcon type={task.taskType} /></div>
            <span className="text-xs font-mono font-medium text-slate-500 group-hover:text-blue-600 transition-colors">
                {task.taskCode}
            </span>
         </div>
      </td>

      {/* 3. Title */}
      <td className="px-4 py-3 text-sm text-slate-700 font-medium max-w-[300px] md:max-w-md cursor-pointer" onClick={() => onTaskSelect?.(task)}>
         <div className="truncate group-hover:text-blue-600 transition-colors" title={task.title}>
            {task.title}
         </div>
      </td>

      {/* 4. Status */}
      <td className="px-4 py-3 whitespace-nowrap w-32">
         <Badge 
            variant="outline" 
            className="text-[10px] font-bold uppercase border border-transparent px-2 py-0.5 rounded-sm" 
            style={{ 
                color: statusColor, 
                backgroundColor: `${statusColor}15`,
            }}
         >
            {statusName}
         </Badge>
      </td>

      {/* 5. Priority */}
      <td className="px-4 py-3 whitespace-nowrap w-28">
         <div className="flex items-center gap-1.5">
            <PriorityConfig priority={task.priority} />
            <span className="text-xs text-slate-600 capitalize font-medium hidden sm:inline-block">
                {task.priority?.toLowerCase()}
            </span>
         </div>
      </td>

      {/* 6. Assignee */}
      <td className="px-4 py-3 whitespace-nowrap w-40">
         {assigneeName ? (
            <div className="flex items-center gap-2">
                <Avatar className="w-5 h-5 border border-slate-200">
                    <AvatarImage src={assigneeAvatar} />
                    <AvatarFallback className="text-[9px] bg-blue-100 text-blue-600 font-bold">
                        {getInitials(assigneeName)}
                    </AvatarFallback>
                </Avatar>
                <span className="text-xs text-slate-600 truncate max-w-[100px] hidden lg:block" title={assigneeName}>
                    {assigneeName}
                </span>
            </div>
         ) : (
            <div className="flex items-center gap-2 opacity-50">
                <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                    <User className="w-3 h-3 text-slate-400" />
                </div>
                <span className="text-xs text-slate-400 italic hidden lg:block">Unassigned</span>
            </div>
         )}
      </td>

      {/* 7. Due Date */}
      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap w-28 text-right">
         {task.dueDate ? (
            <div className={`flex items-center justify-end gap-1.5 ${isOverdue ? "text-red-600 bg-red-50 px-2 py-0.5 rounded-md w-fit ml-auto" : ""}`}>
               <Calendar className={`w-3.5 h-3.5 ${isOverdue ? "text-red-500" : "text-slate-400"}`} />
               <span className="font-medium">{formatDate(task.dueDate)}</span>
            </div>
         ) : (
            <span className="text-slate-300">-</span>
         )}
      </td>
    </tr>
  );
});

export default TaskRow;