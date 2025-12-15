"use client";

import { useState } from "react";
import { X, Loader2, Maximize2 } from "lucide-react";
import { createProjectTask, CreateTaskPayload, TaskType, TaskPriority } from "@/services/apiProject";
import { useToast } from "@/components/ui/ToastProvider";

// =============================================================================
// 1. INTERFACES & INITIAL STATE
// =============================================================================

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
// 2. MAIN COMPONENT
// =============================================================================

export default function CreateTaskModal({
    isOpen, onClose, onSuccess,
    companyId, workspaceId, projectId, members = []
}: CreateTaskModalProps) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState<CreateTaskPayload>(INITIAL_FORM_DATA);

    // --- HANDLER: SUBMIT (Logic nghiệp vụ quan trọng) ---
    const handleSubmit = async () => {
        // 1. Validate
        if (!formData.title.trim()) {
            showToast("Task title is required", "error");
            return;
        }

        try {
            setLoading(true);
            
            // 2. CHUẨN BỊ PAYLOAD (CẮT BỎ các trường phức tạp theo yêu cầu)
            // Chỉ gửi các trường cơ bản: title, description, type, priority, dueDate
            const basePayload: CreateTaskPayload = {
                title: formData.title.trim(),
                description: formData.description || "",
                taskType: formData.taskType,
                priority: formData.priority,
                // Xử lý ngày tháng: Nếu có thì convert ISO, không thì undefined
                dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
                
                // Thêm các trường ID cơ bản, Backend sẽ tự xử lý nếu chúng là 0/undefined
                // NOTE: Để đảm bảo an toàn API theo yêu cầu, tôi chỉ gửi các trường không ID phức tạp
                sprintId: 0, // Giá trị mặc định
                epicId: 0,   // Giá trị mặc định
                assigneeId: 0, // Giá trị mặc định
                storyPoints: 0, // Giá trị mặc định
            };
            
            // ⚠️ Ghi chú: Logic thêm ID đã bị xóa khỏi payload gửi đi theo yêu cầu của bạn.
            // Nếu API yêu cầu Assignee/Sprint/Epic/StoryPoints, cần thêm logic sau:
            // if (formData.assigneeId) basePayload.assigneeId = formData.assigneeId;
            
            // 3. Gọi API
            const newTask = await createProjectTask(companyId, workspaceId, projectId, basePayload);
            
            // 4. Xử lý thành công
            showToast("Task created successfully", "success");
            if (onSuccess) onSuccess(newTask);
            onClose();
            
            // 5. Reset form
            setFormData(INITIAL_FORM_DATA);

        } catch (error: any) {
            console.error(error);
            // Lấy message lỗi từ API trả về
            const message = error.message || error.response?.data?.message || "Failed to create task";
            showToast(message, "error");
        } finally {
            setLoading(false);
        }
    };

    // --- RENDER GUARD ---
    if (!isOpen) return null;

    // --- RENDER UI ---
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                
                {/* HEADER */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
                   <h2 className="text-lg font-bold text-slate-800">Create Issue</h2>
                   <div className="flex items-center gap-2">
                         {/* Button này hiện chưa có chức năng (maximize) */}
                         <button className="text-slate-400 hover:text-slate-600" title="Maximize"><Maximize2 className="w-4 h-4"/></button>
                         <button onClick={onClose} className="text-slate-400 hover:text-red-500" title="Close"><X className="w-5 h-5"/></button>
                   </div>
                </div>

                {/* BODY (Scrollable) */}
                <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
                    
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
                            disabled={loading}
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
                            disabled={loading}
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
                               disabled={loading}
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
                               disabled={loading}
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
                                 disabled={loading}
                             >
                                 <option value={0}>Unassigned</option>
                                 {members.map(m => (
                                     <option key={m.memberId || m.id} value={m.memberId || m.id}>{m.fullName || m.name}</option>
                                 ))}
                                 {/* Fallback mock data (nếu cần test UI) */}
                                 {/* {!members.length && (
                                     <>
                                        <option value={5}>Le Van Cuong</option>
                                        <option value={7}>Hoang Van Em</option>
                                     </>
                                 )} */}
                             </select>
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Due Date</label>
                             <input 
                                 type="datetime-local"
                                 className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                 // Cắt bỏ giây và timezone cho input
                                 value={formData.dueDate ? formData.dueDate.slice(0, 16) : ""} 
                                 onChange={e => setFormData({...formData, dueDate: e.target.value})}
                                 disabled={loading}
                             />
                         </div>
                    </div>

                    {/* NOTE: Các trường Story Points, Epic, Sprint đã bị ẩn dữ liệu gửi đi */}
                </div>

                {/* FOOTER */}
                <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 rounded-b-lg shrink-0">
                   <button 
                       onClick={onClose}
                       className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
                       disabled={loading}
                   >
                       Cancel
                   </button>
                   <button 
                       onClick={handleSubmit}
                       disabled={loading || !formData.title.trim()}
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