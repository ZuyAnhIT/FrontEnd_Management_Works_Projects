"use client";

import React from "react";
import { MessageCircle, Calendar, CheckSquare, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TaskResponse } from "@/services/apiProject";

interface TaskRowProps {
  task: TaskResponse;
  onTaskSelect?: (task: TaskResponse) => void;
}

const TaskRow = React.memo(function TaskRow({ task, onTaskSelect }: TaskRowProps) {
  
  // Helper: Initials
  const getInitials = (name: string) => name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";
  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-US', {day: '2-digit', month: 'short'}) : "-";

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors group">
      
      {/* 1. Checkbox & Type */}
      <td className="w-12 px-4 py-3 text-center">
         <div className="flex items-center justify-center">
            <div className={`w-5 h-5 rounded-[3px] flex items-center justify-center text-white shadow-sm 
                ${task.taskType === 'BUG' ? 'bg-red-500' : task.taskType === 'STORY' ? 'bg-green-600' : 'bg-blue-600'}`}>
               <CheckSquare className="w-3 h-3" />
            </div>
         </div>
      </td>

      {/* 2. Key */}
      <td className="px-4 py-3 text-xs font-mono font-semibold text-slate-500 whitespace-nowrap">
         <button onClick={() => onTaskSelect?.(task)} className="hover:text-blue-600 hover:underline">
            {task.taskCode}
         </button>
      </td>

      {/* 3. Title (Summary) */}
      <td className="px-4 py-3 text-sm text-slate-900 font-medium max-w-md">
         <div className="truncate hover:text-blue-600 cursor-pointer" onClick={() => onTaskSelect?.(task)}>
            {task.title}
         </div>
      </td>

      {/* 4. Status */}
      <td className="px-4 py-3 whitespace-nowrap">
         <Badge variant="outline" className="text-[10px] font-bold uppercase" 
            style={{ color: task.statusColor, borderColor: `${task.statusColor}40`, backgroundColor: `${task.statusColor}10` }}>
            {task.statusName}
         </Badge>
      </td>

      {/* 5. Priority */}
      <td className="px-4 py-3 whitespace-nowrap">
         <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
             task.priority === 'URGENT' ? 'bg-red-50 text-red-600 border-red-100' :
             task.priority === 'HIGH' ? 'bg-orange-50 text-orange-600 border-orange-100' :
             'bg-slate-50 text-slate-500 border-slate-200'
         }`}>
            {task.priority}
         </span>
      </td>

      {/* 6. Assignee */}
      <td className="px-4 py-3 whitespace-nowrap">
         {task.assigneeName ? (
            <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6 border border-white shadow-sm">
                    <AvatarImage src={task.assigneeAvatarUrl} />
                    <AvatarFallback className="text-[9px] bg-blue-600 text-white">{getInitials(task.assigneeName)}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-slate-600 max-w-[100px] truncate">{task.assigneeName}</span>
            </div>
         ) : (
            <span className="text-xs text-slate-400 italic">Unassigned</span>
         )}
      </td>

      {/* 7. Due Date */}
      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
         {task.dueDate ? (
            <div className="flex items-center gap-1.5">
               <Calendar className="w-3.5 h-3.5" />
               {formatDate(task.dueDate)}
            </div>
         ) : "-"}
      </td>
    </tr>
  );
});

export default TaskRow;