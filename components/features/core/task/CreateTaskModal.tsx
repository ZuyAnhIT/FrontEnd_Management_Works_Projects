"use client";

import { useState } from "react";
import { X, Loader2, Maximize2 } from "lucide-react";
import { createProjectTask, CreateTaskPayload, TaskType, TaskPriority } from "@/services/apiProject";
import { useToast } from "@/components/ui/ToastProvider";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newTask: any) => void;
  // IDs
  companyId: number;
  workspaceId: number;
  projectId: number;
  // Data lists
  members?: any[]; 
}

export default function CreateTaskModal({
  isOpen, onClose, onSuccess,
  companyId, workspaceId, projectId, members = []
}: CreateTaskModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<CreateTaskPayload>({
    title: "",
    description: "",
    taskType: TaskType.TASK,
    priority: TaskPriority.MEDIUM,
    sprintId: 0, 
    epicId: 0,
    assigneeId: 0,
    storyPoints: 0,
    dueDate: undefined
  });

  const handleSubmit = async () => {
    // 1. Validate
    if (!formData.title.trim()) {
        showToast("Task title is required", "error");
        return;
    }

    try {
      setLoading(true);
      
      // 2. CHUẨN BỊ PAYLOAD (CẮT BỎ Sprint/Assignee/Epic theo yêu cầu)
      // Chỉ gửi các trường cơ bản để tránh lỗi Backend
      const payload: any = {
        title: formData.title.trim(),
        description: formData.description || "",
        taskType: formData.taskType,
        priority: formData.priority,
        // Xử lý ngày tháng: Nếu có thì convert ISO, không thì undefined
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined
      };

      // ⚠️ LƯU Ý: Các trường dưới đây ĐÃ BỊ LOẠI BỎ khỏi payload gửi đi
      // Khi nào Backend sẵn sàng nhận ID = 0 hoặc null thì bỏ comment
      /*
      if (formData.assigneeId) payload.assigneeId = formData.assigneeId;
      if (formData.sprintId) payload.sprintId = formData.sprintId;
      if (formData.epicId) payload.epicId = formData.epicId;
      if (formData.storyPoints) payload.storyPoints = formData.storyPoints;
      */

      // 3. Gọi API
      const newTask = await createProjectTask(companyId, workspaceId, projectId, payload);
      
      // 4. Xử lý thành công
      showToast("Task created successfully", "success");
      if (onSuccess) onSuccess(newTask);
      onClose();
      
      // 5. Reset form
      setFormData({
        title: "",
        description: "",
        taskType: TaskType.TASK,
        priority: TaskPriority.MEDIUM,
        sprintId: 0, assigneeId: 0, epicId: 0, storyPoints: 0, dueDate: undefined
      });

    } catch (error) {
      console.error(error);
      showToast("Failed to create task", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
           <h2 className="text-lg font-bold text-slate-800">Create Issue</h2>
           <div className="flex items-center gap-2">
              <button className="text-slate-400 hover:text-slate-600"><Maximize2 className="w-4 h-4"/></button>
              <button onClick={onClose} className="text-slate-400 hover:text-red-500"><X className="w-5 h-5"/></button>
           </div>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
           
           {/* Title (Required) */}
           <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Summary <span className="text-red-500">*</span></label>
              <input 
                autoFocus
                type="text" 
                className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-300"
                placeholder="What needs to be done?"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
           </div>

           {/* Description */}
           <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
              <textarea 
                className="w-full border border-slate-300 rounded p-2 text-sm h-32 focus:ring-2 focus:ring-blue-500 outline-none resize-y placeholder:text-slate-300"
                placeholder="Add a detailed description..."
                value={formData.description || ""}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
           </div>

           {/* Row: Type & Priority */}
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Issue Type</label>
                <select 
                   className="w-full border border-slate-300 rounded p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                   value={formData.taskType}
                   onChange={e => setFormData({...formData, taskType: e.target.value as TaskType})}
                >
                   {Object.values(TaskType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Priority</label>
                <select 
                   className="w-full border border-slate-300 rounded p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                   value={formData.priority}
                   onChange={e => setFormData({...formData, priority: e.target.value as TaskPriority})}
                >
                   {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
           </div>

            {/* Row: Assignee & Due Date */}
           <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assignee</label>
                 <select 
                    className="w-full border border-slate-300 rounded p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.assigneeId || 0}
                    onChange={e => setFormData({...formData, assigneeId: Number(e.target.value)})}
                 >
                    <option value={0}>Unassigned</option>
                    {members.map(m => (
                        <option key={m.memberId || m.id} value={m.memberId || m.id}>{m.fullName || m.name}</option>
                    ))}
                    {/* Fallback mock data (nếu cần test UI) */}
                    {!members.length && (
                        <>
                           <option value={5}>Lê Văn Cường</option>
                           <option value={7}>Hoàng Văn Em</option>
                        </>
                    )}
                 </select>
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Due Date</label>
                 <input 
                    type="datetime-local"
                    className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.dueDate ? formData.dueDate.slice(0, 16) : ""}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                 />
              </div>
           </div>

           {/* NOTE: Các trường Story Points, Epic, Sprint tạm ẩn UI hoặc để đó nhưng không gửi dữ liệu */}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 rounded-b-lg">
           <button 
             onClick={onClose}
             className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
           >
             Cancel
           </button>
           <button 
             onClick={handleSubmit}
             disabled={loading}
             className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-2 disabled:opacity-70 transition-colors"
           >
             {loading && <Loader2 className="w-4 h-4 animate-spin"/>}
             Create
           </button>
        </div>

      </div>
    </div>
  );
}