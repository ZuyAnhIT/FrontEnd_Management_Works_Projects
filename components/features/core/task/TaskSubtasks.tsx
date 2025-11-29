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
      {/* Header */}
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

      {/* Table */}
      {/* ✅ QUAN TRỌNG: Đã xóa overflow-hidden để Dropdown assignee không bị cắt */}
      <div className="border border-slate-200 rounded-lg bg-white shadow-sm">
         {/* Table Header */}
         <div className="flex items-center bg-slate-50/80 border-b border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wide rounded-t-lg">
             <div className="flex-1 pl-6">Work</div>
             <div className="w-12 text-center">Pri</div>
             <div className="w-12 text-center">Assignee</div>
             <div className="w-24 text-center">Status</div>
         </div>

         {/* Table Body */}
         {subtasks.length > 0 ? (
            subtasks.map((sub) => (
               <div 
                  key={sub.id} 
                  className="flex items-center border-b border-slate-100 last:border-0 hover:bg-slate-50 group transition-colors h-10 px-2 text-sm relative"
               >
                  {editingSubtaskId === sub.id ? (
                      // Edit Mode
                      <div className="flex-1 flex items-center gap-2 pl-6 pr-2 z-10 bg-white absolute inset-0 px-2">
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
                      // View Mode
                      <>
                        {/* 1. Work */}
                        <div className="flex-1 flex items-center gap-2 min-w-0 pl-6 pr-2 cursor-pointer" onClick={() => onToggleStatus(sub)}>
                            <CheckSquare className={`w-3.5 h-3.5 shrink-0 ${sub.status === 'DONE' ? 'text-green-600' : 'text-blue-500'}`} />
                            <span className="text-slate-500 text-xs font-mono shrink-0">SUB-{sub.id}</span>
                            
                            <TooltipProvider>
                              <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                  <span className={`truncate text-slate-700 block flex-1 ${sub.status === 'DONE' ? 'line-through text-slate-400' : ''}`}>
                                      {sub.title}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-800 text-white text-xs border-none px-2 py-1 max-w-xs break-words">
                                  {sub.title}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <button onClick={(e) => { e.stopPropagation(); startEditing(sub); }} className="ml-auto opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded text-slate-500 transition-opacity" title="Edit title"><Edit2 className="w-3 h-3" /></button>
                        </div>

                        {/* 2. Priority */}
                        <div className="w-12 flex justify-center border-l border-transparent group-hover:border-slate-100">
                            <PriorityIcon />
                        </div>

                        {/* 3. Assignee (Using Mini Dropdown) */}
                        <div className="w-12 flex justify-center border-l border-transparent group-hover:border-slate-100 relative z-10">
                            <MiniAssigneeDropdown 
                                subTaskId={Number(sub.id)}
                                currentAssigneeId={sub.assigneeId}
                                currentAssigneeName={sub.assigneeName}
                                currentAssigneeAvatar={sub.assigneeAvatar}
                                members={members}
                                onUpdate={(newId) => onAssigneeChange(Number(sub.id), newId)}
                            />
                        </div>

                        {/* 4. Status & Delete */}
                        <div className="w-24 flex justify-center items-center border-l border-transparent group-hover:border-slate-100 gap-1 pr-1">
                            <div 
                                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${getStatusColor(sub.status)}`}
                                onClick={() => onToggleStatus(sub)}
                            >
                                {sub.status} <ChevronDown className="w-3 h-3 opacity-50" />
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(sub.id); }} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all ml-1" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </>
                  )}
               </div>
            ))
         ) : (
            <div className="py-8 text-center">
               <p className="text-xs text-slate-400 italic mb-2">No subtasks created yet.</p>
               <button onClick={onAddSubtask} className="text-xs text-blue-600 hover:underline font-medium flex items-center justify-center gap-1 mx-auto"><Plus className="w-3 h-3" /> Create one</button>
            </div>
         )}
         
         {/* Footer Add */}
         {subtasks.length > 0 && (
             <div onClick={onAddSubtask} className="px-3 py-2 bg-slate-50/50 border-t border-slate-200 text-xs font-medium text-slate-500 hover:text-blue-600 hover:bg-slate-100 cursor-pointer flex items-center gap-2 rounded-b-lg transition-colors">
                 <Plus className="w-3.5 h-3.5" /> Create subtask
             </div>
         )}
      </div>
    </div>
  );
}