"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  X, Lock, Eye, Share2, MoreHorizontal, Maximize2, 
  Link as LinkIcon, CheckSquare, ChevronDown, Plus, 
  Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // ✅ Import Tooltip

// API Services & Types
import { getTaskDetails, updateTask, TaskDetail, UpdateTaskData } from "@/services/apiTask";
import { 
  getSubtaskList, 
  createSubtask, 
  updateSubtask, 
  deleteSubtask, 
  Subtask 
} from "@/services/apiSubTask";
import { useToast } from "@/components/ui/ToastProvider";

// Components Con
import TaskComment from "@/components/features/core/task/TaskComment";
import TaskSubtasks from "@/components/features/core/task/TaskSubtasks";

// --- HELPER COMPONENT: PRIORITY SELECT ---
const PrioritySelect = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const colors: Record<string, string> = {
    URGENT: "text-red-600 bg-red-50 border-red-200",
    HIGH: "text-orange-600 bg-orange-50 border-orange-200",
    MEDIUM: "text-blue-600 bg-blue-50 border-blue-200",
    LOW: "text-slate-600 bg-slate-100 border-slate-200"
  };
  return (
    <div className="relative">
      <select 
        className={`appearance-none w-full text-xs font-bold px-2 py-1 rounded border ${colors[value] || colors.LOW} focus:ring-2 focus:ring-offset-1 outline-none cursor-pointer uppercase`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="URGENT">Urgent</option>
      </select>
    </div>
  );
};

// --- MAIN COMPONENT ---
interface TaskDetailModalProps {
  taskId: number | null; 
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
  onSwitchToFloating?: () => void; 
  
  members?: any[]; 
  sprints?: any[]; 
  epics?: any[]; 
  statuses?: any[];

  // ID Context (Required for Subtasks)
  companyId: number;
  workspaceId: number;
  projectId: number;
}

export default function TaskDetailModalFloating({ 
  taskId, 
  isOpen, 
  onClose, 
  onUpdate,
  onSwitchToFloating,
  members = [], 
  sprints = [], 
  epics = [],
  statuses = [],
  companyId,
  workspaceId,
  projectId
}: TaskDetailModalProps) {
  
  const { showToast } = useToast();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [formData, setFormData] = useState<UpdateTaskData>({});
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- SUBTASK STATE ---
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  // Floating Window State
  const [position, setPosition] = useState({ x: 100, y: 50 });
  const [size, setSize] = useState({ width: 1100, height: 700 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  // --- 1. LOAD DATA ---
  useEffect(() => {
    if (isOpen && taskId) {
      setLoading(true);
      
      // Fetch Task Details
      getTaskDetails(taskId)
        .then(data => {
          setTask(data);
          setFormData({
            title: data.title,
            description: data.description || "",
            taskType: data.taskType as any,
            priority: data.priority as any,
            statusId: data.statusId,
            sprintId: data.sprintId,
            assigneeId: data.assigneeId,
            storyPoints: data.storyPoints || 0,
            estimatedHours: 0,
            startDate: data.startDate || undefined,
            dueDate: data.dueDate || undefined,
          });
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));

      // Fetch Subtasks
      fetchSubtasks(taskId);
    }
  }, [isOpen, taskId]);

  const fetchSubtasks = async (id: number) => {
    try {
      const data = await getSubtaskList(companyId, workspaceId, projectId, id);
      setSubtasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load subtasks", error);
    }
  };

  // --- 2. SUBTASK HANDLERS ---

  // Create
  const handleCreateSubtask = async () => {
    if (!newSubtaskTitle.trim() || !taskId) return;
    try {
      await createSubtask(companyId, workspaceId, projectId, taskId, {
        title: newSubtaskTitle,
      });
      setNewSubtaskTitle("");
      setIsAddingSubtask(false);
      fetchSubtasks(taskId);
      showToast("Subtask created", "success");
    } catch (error) {
      showToast("Failed to create subtask", "error");
    }
  };

  // Update Status
  const handleToggleSubtask = async (subtask: Subtask) => {
    if (!taskId) return;
    const oldStatus = subtask.status;
    const newStatus = oldStatus === 'DONE' ? 'TO_DO' : 'DONE'; 
    
    setSubtasks(prev => prev.map(s => s.id === subtask.id ? { ...s, status: newStatus } : s));

    try {
      await updateSubtask(companyId, workspaceId, projectId, taskId, subtask.id, {
        status: newStatus
      });
    } catch (error) {
      showToast("Failed to update subtask", "error");
      setSubtasks(prev => prev.map(s => s.id === subtask.id ? { ...s, status: oldStatus } : s));
    }
  };

  // Update Assignee (Subtask)
  const handleSubtaskAssigneeChange = async (subTaskId: number, userId: number | null) => {
    if (!taskId) return;
    
    const selectedUser = members.find(m => (m.userId || m.id) === userId);
    const oldSubtasks = [...subtasks];

    setSubtasks(prev => prev.map(s => {
        if (s.id === subTaskId) {
            return {
                ...s,
                assigneeId: userId === 0 ? null : userId,
                assigneeName: selectedUser ? (selectedUser.fullName || selectedUser.name) : null,
                assigneeAvatar: selectedUser ? (selectedUser.avatarUrl || selectedUser.avatar) : null
            };
        }
        return s;
    }));

    try {
        const payloadValue = (userId === 0 || userId === null) ? null : userId;
        await updateSubtask(companyId, workspaceId, projectId, taskId, subTaskId, {
            assigneeId: payloadValue
        });
        showToast("Subtask assignee updated", "success");
    } catch (error) {
        showToast("Failed to update assignee", "error");
        setSubtasks(oldSubtasks);
    }
  };

  // Edit Content (Title)
  const handleEditSubtask = async (subTaskId: number, data: { title: string }) => {
    if (!taskId) return;

    const oldSubtasks = [...subtasks];
    setSubtasks(prev => prev.map(s => s.id === subTaskId ? { ...s, ...data } : s));

    try {
        await updateSubtask(companyId, workspaceId, projectId, taskId, subTaskId, data);
        showToast("Subtask updated", "success");
    } catch (error) {
        console.error("Failed to update subtask", error);
        showToast("Failed to update subtask", "error");
        setSubtasks(oldSubtasks);
    }
  };

  // Delete
  const handleDeleteSubtask = async (subTaskId: number) => {
    if (!taskId || !confirm("Delete this subtask?")) return;
    
    const oldSubtasks = [...subtasks];
    setSubtasks(prev => prev.filter(s => s.id !== subTaskId));

    try {
      await deleteSubtask(companyId, workspaceId, projectId, taskId, subTaskId);
      showToast("Subtask deleted", "success");
    } catch (error) {
      showToast("Failed to delete subtask", "error");
      setSubtasks(oldSubtasks);
    }
  };


  // --- 3. MAIN TASK UPDATE HANDLER ---
  const handleUpdate = async (field: keyof UpdateTaskData, value: any) => {
    if (!task || !taskId) return;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'assigneeId') {
        const user = members.find(m => m.id === value || m.userId === value);
        if (user) setTask(prev => prev ? ({ ...prev, assigneeName: user.name || user.fullName, assigneeAvatar: user.avatar || user.avatarUrl }) : null);
        else if (value === 0 || value === null) setTask(prev => prev ? ({ ...prev, assigneeName: null, assigneeAvatar: null }) : null);
    }

    let payloadValue = value;
    if (field === 'startDate' || field === 'dueDate') payloadValue = value ? new Date(value).toISOString() : null;
    if (['sprintId', 'epicId', 'assigneeId'].includes(field) && (value === 0 || value === "0")) payloadValue = null;

    try {
      setIsSaving(true);
      await updateTask(taskId, { [field]: payloadValue });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error(error);
      showToast("Update failed", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const toInputDate = (iso?: string | null) => iso ? new Date(iso).toISOString().slice(0, 16) : "";
  const getInitials = (name: string) => name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) : "UN";

  // --- 4. DRAG & RESIZE HANDLERS ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".resize-handle")) return;
    if (!(e.target as HTMLElement).closest(".modal-header")) return;
    setIsDragging(true);
    setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) setPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
      if (isResizing) {
        setSize({ 
           width: Math.max(800, e.clientX - position.x), 
           height: Math.max(500, e.clientY - position.y) 
        });
      }
    };
    const handleMouseUp = () => { setIsDragging(false); setIsResizing(false); };

    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, position, dragOffset]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40" onClick={onClose} />

      <div
        ref={modalRef}
        className="fixed bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col transition-shadow"
        style={{ left: `${position.x}px`, top: `${position.y}px`, width: `${size.width}px`, height: `${size.height}px` }}
      >
        {/* --- HEADER (DRAGGABLE) --- */}
        <div
          className="modal-header bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between cursor-grab active:cursor-grabbing select-none shrink-0"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckSquare className="w-3.5 h-3.5 text-purple-600" />
            <span className="hover:underline cursor-pointer">Task</span>
            <span>/</span>
            
            {/* ✅ TOOLTIP CHO TASK NAME TRONG HEADER */}
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1 hover:underline cursor-pointer text-slate-600 font-medium">
                    {task?.taskCode || (taskId ? `TASK-${taskId}` : '...')}
                  </span>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-800 text-white border-slate-700 max-w-[300px]">
                    <p className="font-bold text-xs mb-1 text-blue-300">{task?.taskCode}</p>
                    <p className="text-xs leading-relaxed">{formData.title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {isSaving && <span className="ml-2 flex items-center gap-1 text-blue-600"><Loader2 className="w-3 h-3 animate-spin"/> Saving...</span>}
          </div>

          <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-100 rounded-md"><Lock className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-100 rounded-md"><Eye className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-100 rounded-md"><Share2 className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-100 rounded-md"><MoreHorizontal className="w-4 h-4" /></Button>
            <div className="w-px h-4 bg-slate-200 mx-1"></div>
            {onSwitchToFloating && (
               <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-100 rounded-md" onClick={onSwitchToFloating}>
                  <Maximize2 className="w-3.5 h-3.5" />
               </Button>
            )}
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-md" 
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* --- BODY CONTENT --- */}
        <div className="flex flex-1 overflow-hidden bg-white">
          {loading ? (
             <div className="w-full h-full flex items-center justify-center"><Loader2 className="w-10 h-10 text-blue-500 animate-spin"/></div>
          ) : task ? (
             <>
                {/* --- LEFT PANEL --- */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                   <div className="p-8 space-y-8">
                      {/* Summary */}
                      <Input
                         value={formData.title || ''}
                         onChange={e => setFormData({...formData, title: e.target.value})}
                         onBlur={e => handleUpdate('title', e.target.value)}
                         className="text-2xl font-bold border-none px-0 h-auto focus-visible:ring-0 text-slate-900 leading-tight bg-transparent"
                         placeholder="Task Title"
                      />

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                         <Button variant="outline" className="h-8 bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"><LinkIcon className="w-3 h-3 mr-1.5"/> Attach</Button>
                         <Button variant="outline" className="h-8 bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100" onClick={() => setIsAddingSubtask(true)}><Plus className="w-3 h-3 mr-1.5"/> Add child</Button>
                      </div>

                      {/* Description */}
                      <div className="space-y-2 group">
                         <h3 className="text-sm font-bold text-slate-900 group-focus-within:text-blue-600 transition-colors">Description</h3>
                         <Textarea 
                            placeholder="Add a description..." 
                            className="min-h-[120px] resize-none border-transparent hover:border-slate-200 bg-transparent focus:bg-white focus:border-blue-500 transition-all text-sm px-2 py-1 leading-relaxed"
                            value={formData.description || ''}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            onBlur={e => handleUpdate('description', e.target.value)}
                         />
                      </div>

                      {/* ✅ SUBTASKS SECTION (Updated with all handlers) */}
                      <TaskSubtasks 
                          subtasks={subtasks} 
                          members={members}
                          onToggleStatus={handleToggleSubtask}
                          onDelete={(id) => handleDeleteSubtask(Number(id))}
                          onAddSubtask={() => setIsAddingSubtask(true)}
                          onAssigneeChange={handleSubtaskAssigneeChange}
                          onEditContent={handleEditSubtask}
                      />

                      {/* Create Subtask Input Form */}
                      {isAddingSubtask && (
                          <div className="mt-2 flex items-center gap-2 animate-in slide-in-from-top-2 duration-200 px-1">
                              <Input 
                                 placeholder="What needs to be done?" 
                                 className="h-9 text-sm" 
                                 autoFocus
                                 value={newSubtaskTitle}
                                 onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                 onKeyDown={(e) => { if(e.key === 'Enter') handleCreateSubtask(); else if(e.key === 'Escape') setIsAddingSubtask(false); }}
                              />
                              <Button size="sm" className="h-9 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCreateSubtask}>Create</Button>
                              <Button size="sm" variant="ghost" className="h-9" onClick={() => setIsAddingSubtask(false)}>Cancel</Button>
                          </div>
                      )}

                      {/* ✅ COMMENT SECTION */}
                      {taskId && <TaskComment taskId={taskId} />}

                   </div>
                </div>

                {/* --- RIGHT PANEL (Details) --- */}
                <div className="w-[340px] border-l border-slate-200 flex flex-col overflow-y-auto custom-scrollbar bg-slate-50/30">
                   <div className="p-6 space-y-6">
                      {/* Status Selector */}
                      <div className="flex items-center justify-between">
                         <div className="relative">
                            <select 
                               className="appearance-none h-8 pl-3 pr-8 bg-white border border-slate-300 rounded text-xs font-bold text-slate-700 uppercase cursor-pointer hover:bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                               value={formData.statusId || ''}
                               onChange={e => handleUpdate('statusId', Number(e.target.value))}
                            >
                               {statuses.length > 0 ? (
                                  statuses.map(st => <option key={st.id} value={st.id}>{st.name}</option>)
                               ) : (
                                  <option value={0}>Loading...</option>
                               )}
                            </select>
                            <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"/>
                         </div>
                      </div>

                      <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-sm text-slate-900">Details</h3>
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                         </div>
                         <div className="space-y-4 text-xs">
                            {/* Assignee */}
                            <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                               <span className="text-slate-500 font-medium">Assignee</span>
                               <div className="relative group">
                                  <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 -ml-1 rounded transition-colors">
                                     <Avatar className="w-6 h-6">
                                        {task.assigneeAvatar ? <AvatarImage src={task.assigneeAvatar} className="object-cover" /> : <AvatarFallback className="bg-blue-600 text-white text-[10px]">{task.assigneeName ? task.assigneeName.substring(0,2).toUpperCase() : "UN"}</AvatarFallback>}
                                     </Avatar>
                                     <span className="text-blue-600 hover:underline font-medium truncate max-w-[150px]">{task.assigneeName || "Unassigned"}</span>
                                  </div>
                                  <select 
                                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                     value={formData.assigneeId || 0}
                                     onChange={e => handleUpdate('assigneeId', Number(e.target.value))}
                                  >
                                     <option value={0}>Unassigned</option>
                                     {members.map(m => (
                                        <option key={m.userId || m.id} value={m.userId || m.id}>{m.fullName || m.name}</option>
                                     ))}
                                  </select>
                               </div>
                            </div>

                            {/* Priority */}
                            <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                               <span className="text-slate-500 font-medium">Priority</span>
                               <PrioritySelect value={formData.priority || 'LOW'} onChange={(v) => handleUpdate('priority', v)} />
                            </div>

                            {/* Sprint */}
                            <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                               <span className="text-slate-500 font-medium">Sprint</span>
                               <div className="relative w-fit">
                                  <span className="text-blue-600 hover:underline cursor-pointer">{sprints.find(s => s.id === formData.sprintId)?.name || "No Sprint"}</span>
                                  <select className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" value={formData.sprintId || 0} onChange={e => handleUpdate('sprintId', Number(e.target.value))}>
                                     <option value={0}>Backlog</option>
                                     {sprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                  </select>
                               </div>
                            </div>
                            {/* Dates ... (giữ nguyên) */}
                         </div>
                      </div>
                      
                      <div className="text-[10px] text-slate-400 pt-6 space-y-0.5 pb-10">
                         <p>Created {task.createdAt ? new Date(task.createdAt).toLocaleString() : ''}</p>
                         <p>Updated recently</p>
                      </div>
                   </div>
                </div>
             </>
          ) : null}
        </div>

        <div className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50" onMouseDown={() => setIsResizing(true)}>
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-slate-300 rounded-sm"></div>
        </div>
      </div>
    </>
  );
}