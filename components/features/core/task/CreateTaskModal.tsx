"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useState } from "react";
import { X, Loader2, Maximize2, ChevronDown, CheckSquare } from "lucide-react";
import { createProjectTask, CreateTaskPayload, TaskType, TaskPriority } from "@/services/apiProject";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES & INITIAL STATE
// =============================================================================

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newTask: any) => void;
  companyId: number;
  workspaceId: number;
  projectId: number;
  members?: any[]; 
}

const INITIAL_FORM_DATA: CreateTaskPayload = {
  title: "",
  description: "",
  taskType: TaskType.TASK,
  priority: TaskPriority.MEDIUM,
  sprintId: 0, 
  epicId: 0,
  assigneeId: 0,
  storyPoints: 0,
  dueDate: undefined
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Modal Khởi tạo Công việc (Create Issue Modal).
 * Sử dụng form Jira-style để thu thập thông tin cơ bản của một Task/Bug/Story mới.
 */
export default function CreateTaskModal({
  isOpen, 
  onClose, 
  onSuccess,
  companyId, 
  workspaceId, 
  projectId, 
  members = []
}: CreateTaskModalProps) {
  
  // ---------------------------------------------------------------------------
  // 4. STATE & HOOKS
  // ---------------------------------------------------------------------------
  
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateTaskPayload>(INITIAL_FORM_DATA);

  // ---------------------------------------------------------------------------
  // 5. HANDLERS
  // ---------------------------------------------------------------------------

  const handleSubmit = async () => {
    // 1. Validate Form cơ bản
    if (!formData.title.trim()) {
      showToast("Issue summary is required", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // 2. CHUẨN BỊ PAYLOAD (Cắt bỏ các trường phức tạp theo yêu cầu an toàn API)
      const basePayload: CreateTaskPayload = {
        title: formData.title.trim(),
        description: formData.description || "",
        taskType: formData.taskType,
        priority: formData.priority,
        // Chuyển đổi định dạng ngày giờ sang chuẩn ISO nếu có
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        
        // Hardcode các ID liên kết về 0 để tránh lỗi API (theo yêu cầu)
        sprintId: 0, 
        epicId: 0,   
        assigneeId: 0, 
        storyPoints: 0, 
      };
      
      // 3. Thực thi API
      const newTask = await createProjectTask(companyId, workspaceId, projectId, basePayload);
      
      // 4. Xử lý UI sau khi thành công
      showToast(`Issue created successfully`, "success");
      if (onSuccess) onSuccess(newTask);
      
      // Reset form & Đóng modal
      setFormData(INITIAL_FORM_DATA);
      onClose();

    } catch (error: any) {
      console.error("Create Task Error:", error);
      const message = error.response?.data?.message || error.message || "Failed to create issue. Please try again.";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 6. RENDER LOGIC
  // ---------------------------------------------------------------------------

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose} // Cho phép click ra ngoài để đóng (tùy chọn)
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-slate-200"
        onClick={(e) => e.stopPropagation()} // Ngăn sự kiện click lan ra ngoài
      >
        
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-[#0052CC] rounded-lg">
                 <CheckSquare className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-[#172B4D] tracking-tight">Create Issue</h2>
           </div>
           <div className="flex items-center gap-1">
              <button 
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors active:scale-95" 
                title="Maximize window"
              >
                <Maximize2 className="w-4 h-4"/>
              </button>
              <button 
                onClick={onClose} 
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors active:scale-95" 
                title="Close"
              >
                <X className="w-5 h-5"/>
              </button>
           </div>
        </div>

        {/* ================= BODY FORM ================= */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar flex-1 bg-white">
            
            {/* Trường 1: Summary (Title) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">
                Summary <span className="text-red-500">*</span>
              </label>
              <input 
                autoFocus
                type="text" 
                className={cn(
                  "w-full p-2.5 text-[13px] font-medium border border-slate-200 rounded-lg outline-none transition-all shadow-sm",
                  "bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] placeholder:text-slate-400"
                )}
                placeholder="What needs to be done?"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                disabled={isSubmitting}
              />
            </div>

            {/* Trường 2: Description */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">
                Description
              </label>
              <textarea 
                className={cn(
                  "w-full p-3 text-[13px] border border-slate-200 rounded-lg outline-none transition-all shadow-sm h-36 resize-y",
                  "bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] placeholder:text-slate-400 leading-relaxed"
                )}
                placeholder="Add a detailed description..."
                value={formData.description || ""}
                onChange={e => setFormData({...formData, description: e.target.value})}
                disabled={isSubmitting}
              />
            </div>

            {/* Khối Grid: Type & Priority */}
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">
                  Issue Type
                </label>
                <div className="relative group">
                  <select 
                     className={cn(
                       "w-full h-10 pl-3 pr-8 text-[13px] font-semibold border border-slate-200 rounded-lg appearance-none outline-none shadow-sm transition-all cursor-pointer",
                       "bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] hover:border-slate-300"
                     )}
                     value={formData.taskType}
                     onChange={e => setFormData({...formData, taskType: e.target.value as TaskType})}
                     disabled={isSubmitting}
                  >
                     {Object.values(TaskType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-slate-600" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">
                  Priority
                </label>
                <div className="relative group">
                  <select 
                     className={cn(
                       "w-full h-10 pl-3 pr-8 text-[13px] font-semibold border border-slate-200 rounded-lg appearance-none outline-none shadow-sm transition-all cursor-pointer",
                       "bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] hover:border-slate-300"
                     )}
                     value={formData.priority}
                     onChange={e => setFormData({...formData, priority: e.target.value as TaskPriority})}
                     disabled={isSubmitting}
                  >
                     {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-slate-600" />
                </div>
              </div>
            </div>

            {/* Khối Grid: Assignee & Due Date */}
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">
                  Assignee
                </label>
                <div className="relative group">
                  <select 
                      className={cn(
                        "w-full h-10 pl-3 pr-8 text-[13px] font-medium border border-slate-200 rounded-lg appearance-none outline-none shadow-sm transition-all cursor-pointer",
                        "bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] hover:border-slate-300"
                      )}
                      value={formData.assigneeId || 0}
                      onChange={e => setFormData({...formData, assigneeId: Number(e.target.value)})}
                      disabled={isSubmitting}
                  >
                      <option value={0}>Unassigned</option>
                      {members.map(m => (
                          <option key={m.memberId || m.id} value={m.memberId || m.id}>
                            {m.fullName || m.name}
                          </option>
                      ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-slate-600" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">
                  Due Date
                </label>
                <input 
                    type="datetime-local"
                    className={cn(
                      "w-full h-10 p-2.5 text-[13px] font-medium border border-slate-200 rounded-lg outline-none shadow-sm transition-all cursor-pointer",
                      "bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] hover:border-slate-300 text-slate-700"
                    )}
                    value={formData.dueDate ? formData.dueDate.slice(0, 16) : ""} 
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    disabled={isSubmitting}
                />
              </div>
            </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/80 rounded-b-2xl shrink-0">
           <button 
               onClick={onClose}
               className="px-5 py-2 text-[12px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors uppercase tracking-widest active:scale-95"
               disabled={isSubmitting}
           >
               Cancel
           </button>
           <button 
               onClick={handleSubmit}
               disabled={isSubmitting || !formData.title.trim()}
               className={cn(
                 "px-6 py-2 text-[12px] font-bold text-white rounded-lg flex items-center gap-2 uppercase tracking-widest shadow-sm transition-all active:scale-95",
                 "bg-[#0052CC] hover:bg-[#0047B3] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
               )}
           >
               {isSubmitting && <Loader2 className="w-4 h-4 animate-spin"/>}
               Create
           </button>
        </div>

      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}