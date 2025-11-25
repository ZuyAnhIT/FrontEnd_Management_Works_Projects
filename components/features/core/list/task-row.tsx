"use client";

import React from "react";
import { Calendar, CheckSquare, Bug, Bookmark, CheckCircle2, User, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TaskResponse } from "@/services/apiTask";

// --- CONFIGURATION ---

// 1. Priority Icons & Colors
const PriorityConfig = ({ priority }: { priority: string }) => {
  switch (priority) {
    case 'URGENT': 
      return <ArrowUp className="w-3.5 h-3.5 text-red-600" />;
    case 'HIGH': 
      return <ArrowUp className="w-3.5 h-3.5 text-orange-500" />;
    case 'LOW': 
      return <ArrowDown className="w-3.5 h-3.5 text-slate-400" />;
    default: // MEDIUM
      return <Minus className="w-3.5 h-3.5 text-yellow-500 rotate-90" />;
  }
};

// 2. Task Type Icons
const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "BUG": return <Bug className="w-3.5 h-3.5 text-red-500 fill-red-50" />;
    case "STORY": return <Bookmark className="w-3.5 h-3.5 text-green-600 fill-green-50" />;
    default: return <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />;
  }
};

// --- COMPONENT ---

interface TaskRowProps {
  task: TaskResponse;
  onTaskSelect?: (task: TaskResponse) => void;
}

const TaskRow = React.memo(function TaskRow({ task, onTaskSelect }: TaskRowProps) {
  
  // Helper: Format Date
  const formatDate = (d?: string) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
  };

  // Helper: Avatar Initials
  const getInitials = (name?: string) => {
    return name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";
  };

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors group/row">
      
      {/* 1. Checkbox (Selection) */}
      <td className="w-10 px-4 py-3 text-center">
         <input 
            type="checkbox" 
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
         />
      </td>

      {/* 2. Type & Key */}
      <td className="px-4 py-3 whitespace-nowrap">
         <div className="flex items-center gap-2">
            <TypeIcon type={task.taskType} />
            <span 
                onClick={() => onTaskSelect?.(task)}
                className="text-xs font-mono font-medium text-slate-500 hover:text-blue-600 hover:underline cursor-pointer"
            >
                {task.taskCode}
            </span>
         </div>
      </td>

      {/* 3. Title (Summary) */}
      <td className="px-4 py-3 text-sm text-slate-900 font-medium max-w-[300px] md:max-w-md">
         <div 
            className="truncate hover:text-blue-600 cursor-pointer transition-colors" 
            onClick={() => onTaskSelect?.(task)}
            title={task.title}
         >
            {task.title}
         </div>
      </td>

      {/* 4. Status */}
      <td className="px-4 py-3 whitespace-nowrap">
         <Badge 
            variant="outline" 
            className="text-[10px] font-bold uppercase border-0" 
            style={{ 
                color: task.statusColor || '#475569', 
                backgroundColor: `${task.statusColor}15` || '#f1f5f9' 
            }}
         >
            {task.statusName}
         </Badge>
      </td>

      {/* 5. Priority */}
      <td className="px-4 py-3 whitespace-nowrap">
         <div className="flex items-center gap-1.5" title={task.priority}>
            <PriorityConfig priority={task.priority} />
            <span className="text-xs text-slate-600 capitalize font-medium hidden sm:inline-block">
                {task.priority.toLowerCase()}
            </span>
         </div>
      </td>

      {/* 6. Assignee */}
      <td className="px-4 py-3 whitespace-nowrap">
         {task.assigneeName ? (
            <div className="flex items-center gap-2" title={task.assigneeName}>
                <Avatar className="w-6 h-6 border border-white shadow-sm">
                    <AvatarImage src={task.assigneeAvatarUrl} />
                    <AvatarFallback className="text-[9px] bg-blue-600 text-white">
                        {getInitials(task.assigneeName)}
                    </AvatarFallback>
                </Avatar>
                <span className="text-xs text-slate-600 max-w-[120px] truncate hidden lg:block">
                    {task.assigneeName}
                </span>
            </div>
         ) : (
            <div className="flex items-center gap-2 opacity-50">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                    <User className="w-3 h-3 text-slate-500" />
                </div>
                <span className="text-xs text-slate-400 italic hidden lg:block">Unassigned</span>
            </div>
         )}
      </td>

      {/* 7. Due Date */}
      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
         {task.dueDate ? (
            <div className="flex items-center gap-1.5">
               <Calendar className="w-3.5 h-3.5 text-slate-400" />
               <span className={new Date(task.dueDate) < new Date() ? "text-red-500 font-medium" : ""}>
                  {formatDate(task.dueDate)}
               </span>
            </div>
         ) : (
            <span className="text-slate-300">-</span>
         )}
      </td>
    </tr>
  );
});

export default TaskRow;