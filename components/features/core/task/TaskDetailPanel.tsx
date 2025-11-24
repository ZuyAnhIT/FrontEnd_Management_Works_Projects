"use client";

import { useEffect, useState } from "react";
import { 
  X, Loader2, Calendar, User, Flag, 
  CheckCircle2, Bug, Bookmark, 
  Clock, Trash2, Link as LinkIcon, MoreHorizontal
} from "lucide-react";
import { getTaskDetails, TaskDetail } from "@/services/apiTask";
import { useToast } from "@/components/ui/ToastProvider";

// Helper Icons
const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "BUG": return <Bug className="w-4 h-4 text-red-500" />;
    case "STORY": return <Bookmark className="w-4 h-4 text-green-600" />;
    default: return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
  }
};

const PriorityIcon = ({ priority }: { priority: string }) => {
    switch (priority) {
      case "URGENT": return <Flag className="w-4 h-4 text-red-600 fill-red-100" />;
      case "HIGH": return <Flag className="w-4 h-4 text-orange-500 fill-orange-100" />;
      case "MEDIUM": return <Flag className="w-4 h-4 text-blue-500" />;
      default: return <Flag className="w-4 h-4 text-slate-400" />;
    }
};

interface TaskDetailPanelProps {
  taskId: number | null;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function TaskDetailPanel({ taskId, onClose, onUpdate }: TaskDetailPanelProps) {
  const { showToast } = useToast();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (taskId) {
      setLoading(true);
      getTaskDetails(taskId)
        .then(data => setTask(data))
        .catch(() => showToast("Failed to load task details", "error"))
        .finally(() => setLoading(false));
    }
  }, [taskId, showToast]);

  if (!taskId) return null;

  // ✅ GIAO DIỆN PANEL: Border Left, Full Height, Shadow
  return (
    <div className="w-[450px] lg:w-[500px] h-full bg-white border-l border-slate-200 shadow-xl flex flex-col animate-in slide-in-from-right duration-200 z-20">
        
        {/* 1. HEADER */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            {task && (
              <div className="flex items-center gap-2 text-sm text-slate-500 font-mono hover:bg-slate-100 px-2 py-1 rounded cursor-pointer transition-colors">
                 <TypeIcon type={task.taskType} />
                 <span className="font-bold text-slate-700">{task.taskCode}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
             <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                <LinkIcon className="w-4 h-4" />
             </button>
             <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                <MoreHorizontal className="w-4 h-4" />
             </button>
             <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors ml-1">
                <X className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* 2. BODY SCROLLABLE */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
           {loading ? (
              <div className="h-full flex items-center justify-center">
                 <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
           ) : task ? (
              <div className="space-y-6">
                 {/* Title */}
                 <h1 className="text-xl font-bold text-slate-900 leading-snug">
                    {task.title}
                 </h1>

                 {/* Status Picker (Quick) */}
                 <div>
                    <span className="text-xs font-bold text-slate-500 uppercase mb-2 block">Status</span>
                    <div className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold border bg-white shadow-sm cursor-pointer hover:bg-slate-50"
                        style={{ borderColor: task.statusColor, color: task.statusColor }}
                    >
                        <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: task.statusColor }}></span>
                        {task.statusName}
                    </div>
                 </div>

                 {/* Description */}
                 <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase">Description</h3>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed p-3 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all cursor-text min-h-[80px]">
                        {task.description || <span className="text-slate-400 italic">Add a description...</span>}
                    </div>
                 </div>

                 {/* Meta Data Grid */}
                 <div className="space-y-4 pt-4 border-t border-slate-100">
                     {/* Assignee */}
                     <div className="grid grid-cols-3 items-center">
                        <span className="text-xs font-medium text-slate-500 col-span-1">Assignee</span>
                        <div className="col-span-2 flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded -ml-2">
                           {task.assigneeAvatar ? (
                              <img src={task.assigneeAvatar} alt="" className="w-5 h-5 rounded-full" />
                           ) : (
                              <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">?</div>
                           )}
                           <span className="text-sm text-slate-700">{task.assigneeName || "Unassigned"}</span>
                        </div>
                     </div>

                     {/* Priority */}
                     <div className="grid grid-cols-3 items-center">
                        <span className="text-xs font-medium text-slate-500 col-span-1">Priority</span>
                        <div className="col-span-2 flex items-center gap-2 px-2 py-1 hover:bg-slate-100 rounded -ml-2 cursor-pointer">
                           <PriorityIcon priority={task.priority} />
                           <span className="text-sm text-slate-700 capitalize">{task.priority.toLowerCase()}</span>
                        </div>
                     </div>

                     {/* Story Points */}
                     <div className="grid grid-cols-3 items-center">
                        <span className="text-xs font-medium text-slate-500 col-span-1">Estimate</span>
                        <div className="col-span-2 flex items-center gap-2 px-2 py-1 hover:bg-slate-100 rounded -ml-2 cursor-pointer">
                           <div className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                              {task.storyPoints || "-"}
                           </div>
                           <span className="text-sm text-slate-600">points</span>
                        </div>
                     </div>

                      {/* Due Date */}
                     <div className="grid grid-cols-3 items-center">
                        <span className="text-xs font-medium text-slate-500 col-span-1">Due Date</span>
                        <div className="col-span-2 flex items-center gap-2 px-2 py-1 hover:bg-slate-100 rounded -ml-2 cursor-pointer">
                           <Calendar className="w-4 h-4 text-slate-400" />
                           <span className="text-sm text-slate-700">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "None"}</span>
                        </div>
                     </div>
                 </div>

                 {/* Activity / Comments (Placeholder) */}
                 <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Activity</h3>
                    <div className="flex gap-3">
                       <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">ME</div>
                       <div className="flex-1">
                          <input placeholder="Leave a comment..." className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" />
                       </div>
                    </div>
                 </div>

              </div>
           ) : (
              <div className="h-full flex items-center justify-center text-slate-500">Task not found.</div>
           )}
        </div>
    </div>
  );
}