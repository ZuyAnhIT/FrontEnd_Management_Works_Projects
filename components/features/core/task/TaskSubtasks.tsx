"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, CheckSquare, Plus, Trash2, Edit2, Check, X, User as UserIcon, Search } from "lucide-react"; 
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Subtask } from "@/services/apiSubTask"; 
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// --- HELPER: LẤY MÀU AVATAR ---
const getAvatarColor = (id: number | string | null) => {
  if (!id) return 'bg-slate-300';
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 
    'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 
    'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 
    'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
  ];
  const numId = typeof id === 'number' ? id : (id ? id.toString().charCodeAt(0) : 0);
  return colors[numId % colors.length];
};

// --- MINI ASSIGNEE DROPDOWN (Có Search) ---
const MiniAssigneeDropdown = ({ 
  subTaskId, 
  currentAssigneeId, 
  currentAssigneeName,
  currentAssigneeAvatar,
  members = [], 
  onUpdate 
}: { 
  subTaskId: number; 
  currentAssigneeId: number | null; 
  currentAssigneeName: string | null;
  currentAssigneeAvatar: string | null;
  members: any[]; 
  onUpdate: (id: number | null) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState(""); // State tìm kiếm
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lọc danh sách member theo từ khóa
  const filteredMembers = members.filter(m => 
    (m.fullName || m.name || "").toLowerCase().includes(keyword.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setKeyword(""); // Reset search khi đóng
      }
    };
    
    if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        // Auto focus vào ô search khi mở
        setTimeout(() => inputRef.current?.focus(), 100);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (e: React.MouseEvent, userId: number | null) => {
    e.stopPropagation();
    onUpdate(userId);
    setIsOpen(false);
    setKeyword("");
  };

  return (
    <div className="relative flex justify-center" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
      
      {/* Avatar Trigger */}
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div 
                className="cursor-pointer hover:scale-110 transition-transform"
                onClick={() => setIsOpen(!isOpen)}
            >
               <Avatar className="w-6 h-6 text-[10px] border border-white shadow-sm">
                  {currentAssigneeAvatar ? (
                     <AvatarImage src={currentAssigneeAvatar} className="object-cover" />
                  ) : (
                     <AvatarFallback className={`text-white ${getAvatarColor(currentAssigneeId)}`}>
                        {currentAssigneeName ? currentAssigneeName.substring(0,2).toUpperCase() : <UserIcon className="w-3 h-3" />}
                     </AvatarFallback>
                  )}
               </Avatar>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-800 text-white text-xs border-none px-2 py-1">
            {currentAssigneeName || "Unassigned"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-60 bg-white rounded-lg shadow-xl z-50 border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100">
           
           {/* Search Box */}
           <div className="p-2 border-b border-slate-100 bg-slate-50/50">
               <div className="relative">
                   <Search className="absolute left-2 top-1.5 w-3.5 h-3.5 text-slate-400" />
                   <input 
                      ref={inputRef}
                      className="w-full pl-7 pr-2 py-1 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Search user..."
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                   />
               </div>
           </div>

           <div className="max-h-56 overflow-y-auto py-1">
               {/* Option: Unassigned (Luôn hiện nếu không search hoặc search khớp) */}
               {("unassigned".includes(keyword.toLowerCase())) && (
                   <div 
                      className="px-3 py-2 hover:bg-slate-50 cursor-pointer flex items-center gap-2 text-xs text-slate-600 border-b border-slate-100"
                      onClick={(e) => handleSelect(e, null)}
                   >
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center"><UserIcon className="w-3.5 h-3.5"/></div>
                      <span>Unassigned</span>
                      {currentAssigneeId === null && <Check className="w-3.5 h-3.5 ml-auto text-blue-600"/>}
                   </div>
               )}

               {/* List Members */}
               {filteredMembers.length > 0 ? (
                   filteredMembers.map(user => {
                     const userId = user.userId || user.id;
                     const isSelected = userId === currentAssigneeId;
                     return (
                        <div 
                            key={userId} 
                            className={`px-3 py-2 cursor-pointer flex items-center gap-2 text-xs transition-colors ${isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'}`}
                            onClick={(e) => handleSelect(e, userId)}
                        >
                            <Avatar className="w-6 h-6">
                               <AvatarFallback className={`text-white text-[8px] ${getAvatarColor(userId)}`}>
                                  {user.fullName ? user.fullName.substring(0,2).toUpperCase() : "U"}
                               </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                                <span className="truncate font-medium">{user.fullName || user.name}</span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-blue-600"/>}
                        </div>
                     )
                   })
               ) : (
                   <div className="px-3 py-2 text-xs text-slate-400 text-center italic">No users found</div>
               )}
           </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---
interface TaskSubtasksProps {
  subtasks?: Subtask[]; 
  members?: any[]; 
  onAddSubtask?: () => void; 
  onToggleStatus: (subtask: Subtask) => void; 
  onDelete: (subTaskId: number) => void;      
  onAssigneeChange: (subTaskId: number, newAssigneeId: number | null) => void; 
  onEditContent: (subTaskId: number, data: { title: string }) => void;
}

export default function TaskSubtasks({ 
  subtasks = [], 
  members = [], 
  onAddSubtask,
  onToggleStatus,
  onDelete,
  onAssigneeChange,
  onEditContent
}: TaskSubtasksProps) {

  const [editingSubtaskId, setEditingSubtaskId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Edit Handlers
  const startEditing = (sub: Subtask) => {
    setEditingSubtaskId(sub.id);
    setEditTitle(sub.title);
  };
  const cancelEditing = () => {
    setEditingSubtaskId(null);
    setEditTitle("");
  };
  const saveEditing = () => {
    if (editingSubtaskId && editTitle.trim()) {
        onEditContent(editingSubtaskId, { title: editTitle });
        setEditingSubtaskId(null);
    }
  };

  // Progress
  const completedSubtasks = subtasks.filter(s => s.status === 'DONE').length;
  const totalSubtasks = subtasks.length;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Helpers
  // Helpers
  const getStatusColor = (status: string) => {
    // Chuẩn hóa về chữ thường để so sánh cho an toàn
    const s = status ? status.toUpperCase() : 'TODO';

    if (s === 'DONE') {
      return "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200";
    }
    
    // Thêm trường hợp In Progress
    if (s === 'IN_PROGRESS' || s === 'IN PROGRESS') {
      return "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200";
    }

    // Mặc định là Todo (màu xám)
    return "bg-slate-200 text-slate-700 hover:bg-slate-300 border border-slate-200";
  };

  const PriorityIcon = () => (
     <div className="flex items-center justify-center w-5 h-5" title="Medium">
        <div className="w-3 h-[2px] bg-orange-500 my-[1px]"></div>
        <div className="w-3 h-[2px] bg-orange-500 my-[1px]"></div>
     </div>
  );

return (
    <div className="space-y-3 pt-2">
      {/* Header Info (Progress bar) - Giữ nguyên */}
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
            <span className="text-xs text-slate-500 font-medium min-w-[60px] text-right">{progressPercent}% Done</span>
            <button className="p-1 hover:bg-slate-100 rounded ml-1" onClick={onAddSubtask} title="Add subtask">
                <Plus className="w-4 h-4 text-slate-600" />
            </button>
         </div>
      </div>

      {/* ✅ TABLE FIX: Bảng chuẩn HTML giúp cột thẳng hàng */}
      <div className="border border-slate-200 rounded-lg bg-white shadow-sm">
         <table className="w-full text-sm text-left border-collapse">
            {/* 1. HEADER: Định nghĩa độ rộng cột tại đây */}
            <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-200">
               <tr>
                  <th className="py-2.5 pl-4 pr-2 font-semibold w-auto">Work</th>
                  <th className="py-2.5 px-2 font-semibold text-center w-[50px]">Pri</th>
                  <th className="py-2.5 px-2 font-semibold text-center w-[100px]">Assignee</th>
                  <th className="py-2.5 px-2 font-semibold text-center w-[140px]">Status</th>
                  <th className="py-2.5 px-2 font-semibold w-[40px]"></th>
               </tr>
            </thead>

            {/* 2. BODY: Dữ liệu sẽ tự động theo độ rộng của Header */}
            <tbody className="divide-y divide-slate-100">
               {subtasks.length > 0 ? (
                  subtasks.map((sub) => (
                     <tr key={sub.id} className="group hover:bg-slate-50 transition-colors h-10 relative">
                        {editingSubtaskId === sub.id ? (
                           // --- EDIT MODE ---
                           <td colSpan={5} className="p-1 pl-2">
                              <div className="flex items-center gap-2 w-full bg-white z-10 relative p-1">
                                 <Input 
                                    autoFocus
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="h-8 text-sm flex-1"
                                    onKeyDown={(e) => {
                                       if(e.key === 'Enter') saveEditing();
                                       if(e.key === 'Escape') cancelEditing();
                                    }}
                                 />
                                 <button onClick={saveEditing} className="p-1.5 hover:bg-green-100 text-green-600 rounded"><Check className="w-4 h-4" /></button>
                                 <button onClick={cancelEditing} className="p-1.5 hover:bg-red-100 text-red-600 rounded"><X className="w-4 h-4" /></button>
                              </div>
                           </td>
                        ) : (
                           // --- VIEW MODE ---
                           <>
                              {/* 1. Work */}
                              <td className="py-2 pl-4 pr-2 align-middle">
                                 <div className="flex items-center gap-3 cursor-pointer group/title min-w-0" onClick={() => onToggleStatus(sub)}>
                                    <CheckSquare className={`w-4 h-4 shrink-0 transition-colors ${sub.status === 'DONE' ? 'text-green-600' : 'text-blue-500'}`} />
                                    
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <span className="text-slate-400 text-[10px] font-mono shrink-0 pt-0.5">SUB-{sub.id}</span>
                                        <TooltipProvider>
                                          <Tooltip delayDuration={300}>
                                            <TooltipTrigger asChild>
                                              <span className={`truncate text-slate-700 font-medium text-sm ${sub.status === 'DONE' ? 'line-through text-slate-400' : ''}`}>
                                                  {sub.title}
                                              </span>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-slate-800 text-white text-xs px-2 py-1 max-w-xs break-words">
                                              {sub.title}
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                    </div>

                                    {/* Nút Edit hiện khi hover */}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); startEditing(sub); }} 
                                        className="opacity-0 group-hover/title:opacity-100 p-1.5 hover:bg-slate-200 rounded text-slate-500 transition-all shrink-0"
                                        title="Edit title"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                 </div>
                              </td>

                              {/* 2. Priority */}
                              <td className="py-2 px-2 text-center align-middle border-l border-transparent group-hover:border-slate-100">
                                 <div className="flex justify-center">
                                    <PriorityIcon />
                                 </div>
                              </td>

                              {/* 3. Assignee */}
                              <td className="py-2 px-2 text-center align-middle border-l border-transparent group-hover:border-slate-100">
                                 <div className="flex justify-center relative z-10">
                                    <MiniAssigneeDropdown 
                                        subTaskId={Number(sub.id)}
                                        currentAssigneeId={sub.assigneeId}
                                        currentAssigneeName={sub.assigneeName}
                                        currentAssigneeAvatar={sub.assigneeAvatar}
                                        members={members}
                                        onUpdate={(newId) => onAssigneeChange(Number(sub.id), newId)}
                                    />
                                 </div>
                              </td>

                              {/* 4. Status */}
                              <td className="py-2 px-2 text-center align-middle border-l border-transparent group-hover:border-slate-100">
                                 <div className="flex justify-center">
                                     <div 
                                        className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-all select-none w-[120px] shadow-sm border ${getStatusColor(sub.status)}`}
                                        onClick={() => onToggleStatus(sub)}
                                     >
                                        <span className="whitespace-nowrap truncate">{sub.status?.replace(/_/g, " ") || 'TODO'}</span>
                                        <ChevronDown className="w-3 h-3 opacity-50 shrink-0" />
                                     </div>
                                 </div>
                              </td>

                              {/* 5. Delete Action */}
                              <td className="py-2 px-2 text-center align-middle">
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); onDelete(sub.id); }} 
                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                    title="Delete subtask"
                                 >
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              </td>
                           </>
                        )}
                     </tr>
                  ))
               ) : (
                  <tr>
                     <td colSpan={5} className="py-10 text-center text-xs text-slate-400 italic bg-slate-50/30">
                        No subtasks created yet. 
                        <button onClick={onAddSubtask} className="text-blue-600 hover:underline cursor-pointer ml-1 font-medium inline-flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Create one
                        </button>
                     </td>
                  </tr>
               )}
            </tbody>
         </table>

         {/* Footer Add Button */}
         {subtasks.length > 0 && (
            <div onClick={onAddSubtask} className="px-4 py-2.5 bg-slate-50/50 border-t border-slate-200 text-xs font-medium text-slate-500 hover:text-blue-600 hover:bg-slate-100 cursor-pointer flex items-center gap-2 transition-colors rounded-b-lg">
               <Plus className="w-3.5 h-3.5" /> Create subtask
            </div>
         )}
      </div>
    </div>
  );
}