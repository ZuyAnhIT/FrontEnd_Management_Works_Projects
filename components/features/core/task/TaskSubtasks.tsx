"use client";

import React, { useState } from "react";
import { ChevronDown, CheckSquare, Plus, Trash2, Edit2, Check, X } from "lucide-react"; 
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input"; // Import Input
import { Subtask } from "@/services/apiSubTask"; 

interface TaskSubtasksProps {
  subtasks?: Subtask[]; 
  members?: any[]; 
  onAddSubtask?: () => void; 
  onToggleStatus: (subtask: Subtask) => void; 
  onDelete: (subTaskId: number) => void;      
  onAssigneeChange: (subTaskId: number, newAssigneeId: number | null) => void; 
  
  // ✅ Thêm prop callback sửa nội dung
  onEditContent: (subTaskId: number, data: { title: string }) => void;
}

export default function TaskSubtasks({ 
  subtasks = [], 
  members = [], 
  onAddSubtask,
  onToggleStatus,
  onDelete,
  onAssigneeChange,
  onEditContent // ✅ Destructure prop mới
}: TaskSubtasksProps) {

  // --- STATE QUẢN LÝ VIỆC SỬA ---
  const [editingSubtaskId, setEditingSubtaskId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Bắt đầu sửa
  const startEditing = (sub: Subtask) => {
    setEditingSubtaskId(sub.id);
    setEditTitle(sub.title);
  };

  // Hủy sửa
  const cancelEditing = () => {
    setEditingSubtaskId(null);
    setEditTitle("");
  };

  // Lưu sửa
  const saveEditing = () => {
    if (editingSubtaskId && editTitle.trim()) {
        onEditContent(editingSubtaskId, { title: editTitle });
        setEditingSubtaskId(null);
    }
  };

  // Tính toán progress bar
  const completedSubtasks = subtasks.filter(s => s.status === 'DONE').length;
  const totalSubtasks = subtasks.length;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Helper màu Status
  const getStatusColor = (status: string) => {
    if (status === 'DONE') return "bg-green-100 text-green-700 hover:bg-green-200";
    return "bg-slate-200 text-slate-700 hover:bg-slate-300";
  };

  const PriorityIcon = () => (
     <div className="flex items-center justify-center w-5 h-5" title="Medium">
        <div className="w-3 h-[2px] bg-orange-500 my-[1px]"></div>
        <div className="w-3 h-[2px] bg-orange-500 my-[1px]"></div>
     </div>
  );

  return (
    <div className="space-y-3 pt-2">
      {/* Header Section */}
      <div className="flex items-center justify-between">
         <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 -ml-1 rounded transition-colors">
            <ChevronDown className="w-4 h-4" /> Subtasks
         </h3>
         <div className="flex items-center gap-2">
            <div className="h-2 w-32 bg-slate-200 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-green-600 transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
            </div>
            <span className="text-xs text-slate-500 font-medium">{progressPercent}% Done</span>
            <button className="p-1 hover:bg-slate-100 rounded ml-1" onClick={onAddSubtask} title="Add subtask">
                <Plus className="w-4 h-4 text-slate-600" />
            </button>
         </div>
      </div>

      {/* Subtask Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
         <div className="flex items-center bg-slate-50/80 border-b border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-500">
             <div className="flex-1 pl-6">Work</div>
             <div className="w-12 text-center">Pri</div>
             <div className="w-12 text-center">As...</div>
             <div className="w-24 text-center">Status</div>
         </div>

         {/* Table Body */}
         {subtasks.length > 0 ? (
            subtasks.map((sub) => (
               <div 
                  key={sub.id} 
                  className="flex items-center border-b border-slate-100 last:border-0 hover:bg-slate-50 group transition-colors h-10 px-2 text-sm relative"
               >
                  {/* --- LOGIC HIỂN THỊ: CHẾ ĐỘ SỬA HOẶC XEM --- */}
                  {editingSubtaskId === sub.id ? (
                      // 🔥 CHẾ ĐỘ SỬA (INPUT)
                      <div className="flex-1 flex items-center gap-2 pl-6 pr-2">
                          <Input 
                              autoFocus
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="h-7 text-sm"
                              onKeyDown={(e) => {
                                  if(e.key === 'Enter') saveEditing();
                                  if(e.key === 'Escape') cancelEditing();
                              }}
                          />
                          <button onClick={saveEditing} className="p-1 hover:bg-green-100 text-green-600 rounded"><Check className="w-4 h-4" /></button>
                          <button onClick={cancelEditing} className="p-1 hover:bg-red-100 text-red-600 rounded"><X className="w-4 h-4" /></button>
                      </div>
                  ) : (
                      // 👀 CHẾ ĐỘ XEM (TEXT)
                      <>
                        <div className="flex-1 flex items-center gap-2 min-w-0 pl-6 pr-2" onClick={() => onToggleStatus(sub)}>
                            <CheckSquare className={`w-3.5 h-3.5 shrink-0 ${sub.status === 'DONE' ? 'text-green-600' : 'text-blue-500'}`} />
                            <span className="text-slate-500 text-xs font-mono shrink-0">SUB-{sub.id}</span>
                            <span className={`truncate text-slate-700 cursor-pointer ${sub.status === 'DONE' ? 'line-through text-slate-400' : ''}`}>
                                {sub.title}
                            </span>

                            {/* Nút Edit (chỉ hiện khi hover) */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); startEditing(sub); }}
                                className="ml-auto opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded text-slate-500 transition-opacity"
                                title="Edit title"
                            >
                                <Edit2 className="w-3 h-3" />
                            </button>
                        </div>

                        {/* Các cột khác (Priority, Assignee, Status) chỉ hiện khi không sửa */}
                        <div className="w-12 flex justify-center border-l border-transparent group-hover:border-slate-100">
                            <PriorityIcon />
                        </div>

                        <div className="w-12 flex justify-center border-l border-transparent group-hover:border-slate-100 relative group/assignee">
                            <div className="cursor-pointer hover:scale-110 transition-transform">
                                <Avatar className="w-5 h-5 text-[9px] border border-white shadow-sm">
                                    {sub.assigneeAvatar ? (
                                        <AvatarImage src={sub.assigneeAvatar} />
                                    ) : (
                                        <AvatarFallback className="bg-orange-500 text-white">
                                            {sub.assigneeName ? sub.assigneeName.substring(0,2).toUpperCase() : "U"}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                            </div>
                            <select 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                value={sub.assigneeId || 0}
                                onChange={(e) => onAssigneeChange(sub.id, Number(e.target.value))}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <option value={0}>Unassigned</option>
                                {members.map(m => (
                                    <option key={m.userId || m.id} value={m.userId || m.id}>
                                        {m.fullName || m.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="w-24 flex justify-center items-center border-l border-transparent group-hover:border-slate-100 gap-1 pr-1">
                            <div 
                                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${getStatusColor(sub.status)}`}
                                onClick={() => onToggleStatus(sub)}
                            >
                                {sub.status} <ChevronDown className="w-3 h-3 opacity-50" />
                            </div>

                            <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(sub.id); }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all ml-1"
                                title="Delete"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                      </>
                  )}
               </div>
            ))
         ) : (
            <div className="py-8 text-center">
               <p className="text-xs text-slate-400 italic mb-2">No subtasks created yet.</p>
               <button onClick={onAddSubtask} className="text-xs text-blue-600 hover:underline font-medium flex items-center justify-center gap-1 mx-auto">
                  <Plus className="w-3 h-3" /> Create one
               </button>
            </div>
         )}
         
         {subtasks.length > 0 && (
             <div 
                onClick={onAddSubtask}
                className="px-3 py-2 bg-slate-50/50 border-t border-slate-200 text-xs font-medium text-slate-500 hover:text-blue-600 hover:bg-slate-100 cursor-pointer flex items-center gap-2 transition-colors"
             >
                 <Plus className="w-3.5 h-3.5" /> Create subtask
             </div>
         )}
      </div>
    </div>
  );
}