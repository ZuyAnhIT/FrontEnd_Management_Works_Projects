"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, AlertCircle, CheckCircle2, Bookmark, Bug } from "lucide-react";
import { StatsTask } from "@/services/apiStatistics";

// Helper Icons
const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "BUG": return <Bug className="w-3.5 h-3.5 text-red-500" />;
    case "STORY": return <Bookmark className="w-3.5 h-3.5 text-green-600" />;
    default: return <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />;
  }
};

export default function StatsTaskItem({ task }: { task: StatsTask }) {
  // Format Date
  const dateStr = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : "";
  
  // Initials for Avatar
  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-lg hover:border-blue-200 hover:shadow-sm transition-all group">
      
      {/* Icon & Code */}
      <div className="flex flex-col items-center w-12 shrink-0 gap-1">
         <TypeIcon type={task.taskType} />
         <span className="text-[10px] font-mono font-bold text-slate-500">{task.taskCode}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
         <h4 className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-700 transition-colors">
            {task.title}
         </h4>
         <div className="flex items-center gap-2 mt-1">
            {/* Priority Badge */}
            <span className={`text-[9px] font-bold px-1.5 rounded border uppercase
               ${task.priority === 'URGENT' ? 'text-red-600 bg-red-50 border-red-100' : 
                 task.priority === 'HIGH' ? 'text-orange-600 bg-orange-50 border-orange-100' : 
                 'text-slate-500 bg-slate-50 border-slate-200'}`}>
               {task.priority}
            </span>
            
            {/* Status Text */}
            <span className="text-[10px] font-medium" style={{ color: task.status.color }}>
               {task.status.name}
            </span>

            {/* Epic (Optional) */}
            {task.epic && (
               <span className="text-[9px] px-1.5 rounded bg-slate-100 text-slate-500 border border-slate-200 truncate max-w-[80px]">
                  {task.epic.name}
               </span>
            )}
         </div>
      </div>

      {/* Meta Right */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
         {/* Assignee */}
         {task.assignee ? (
            <Avatar className="w-5 h-5 border border-slate-200">
               <AvatarImage src={task.assignee.avatarUrl} />
               <AvatarFallback className="text-[8px] bg-blue-600 text-white">{getInitials(task.assignee.name)}</AvatarFallback>
            </Avatar>
         ) : (
            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] text-slate-400">?</div>
         )}

         {/* Due Date */}
         {task.dueDate && (
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
               <Calendar className="w-3 h-3" />
               <span className={new Date(task.dueDate) < new Date() ? "text-red-500 font-bold" : ""}>{dateStr}</span>
            </div>
         )}
      </div>
    </div>
  );
}