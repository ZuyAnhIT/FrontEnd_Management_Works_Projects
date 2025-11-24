"use client";

import { useState } from "react";
import { Plus, Loader2, X } from "lucide-react";
import { createProjectTask, TaskType, TaskPriority } from "@/services/apiProject";
import { useToast } from "@/components/ui/ToastProvider";

interface QuickTaskCreateProps {
  // Các ID định danh dự án
  companyId: number;
  workspaceId: number;
  projectId: number;
  
  // Context: Đang tạo ở đâu? (Sprint nào hay Backlog)
  sprintId?: number | null; 
  
  // Loại task mặc định (thường là TASK)
  defaultType?: TaskType;
  
  // Callback khi tạo thành công (để cha reload list)
  onSuccess: (newTask: any) => void;
}

export default function QuickTaskCreate({
  companyId, workspaceId, projectId,
  sprintId, // Nhận vào có thể là ID sprint hoặc null/undefined
  defaultType = TaskType.TASK,
  onSuccess
}: QuickTaskCreateProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleCreate = async () => {
    // 1. Validate cơ bản
    if (!title.trim()) {
        setIsEditing(false);
        return;
    }

    try {
      setLoading(true);

      // 2. Cấu trúc Payload tối giản (Clean Payload)
      // Chỉ gửi những gì API thực sự cần cho việc tạo nhanh
      const payload: any = {
        title: title.trim(),
        taskType: defaultType,
        priority: TaskPriority.MEDIUM, // Mặc định Medium
        description: "",
      };

      // 3. Logic xử lý Dynamic Sprint ID
      // Chỉ append sprintId nếu nó tồn tại (truthy number)
      // Nếu sprintId là null, undefined hoặc 0 -> KHÔNG GỬI để API tự hiểu là vào Backlog
      if (sprintId) {
        payload.sprintId = sprintId;
      }

      // 4. Gọi API
      const newTask = await createProjectTask(companyId, workspaceId, projectId, payload);
      
      // 5. Success Flow
      onSuccess(newTask); 
      setTitle(""); // Clear input để nhập task tiếp theo luôn (Jira style)
      // Lưu ý: Không đóng form (setIsEditing(false)) để user nhập liên tục
      
    } catch (error) {
      console.error(error);
      showToast("Failed to create issue", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Tránh xuống dòng
        handleCreate();
    }
    if (e.key === 'Escape') {
        setIsEditing(false);
        setTitle("");
    }
  };

  // --- RENDER: TRẠNG THÁI NÚT BẤM (IDLE) ---
  if (!isEditing) {
    return (
      <button 
        onClick={() => setIsEditing(true)}
        className="group flex items-center gap-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 w-full p-2 rounded-md transition-all text-sm font-medium mt-1"
      >
        <Plus className="w-4 h-4 text-slate-400 group-hover:text-slate-600" /> 
        <span className="text-slate-500 group-hover:text-slate-700">Create issue</span>
      </button>
    );
  }

  // --- RENDER: TRẠNG THÁI NHẬP LIỆU (EDITING) ---
  return (
    <div className="mt-1 p-2 bg-white border border-blue-500 rounded shadow-md animate-in fade-in zoom-in-95 duration-200">
      <div className="relative">
         <input
            autoFocus
            type="text"
            className="w-full text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 pr-8 bg-transparent"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            onBlur={() => {
                // Tùy chọn: Nếu click ra ngoài mà không có text thì đóng form
                if(!title.trim()) setIsEditing(false);
            }}
         />
         
         {loading ? (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin absolute right-0 top-0" />
         ) : (
            // Nút X nhỏ để cancel nhanh nếu muốn
            <X 
                className="w-4 h-4 text-slate-300 hover:text-red-500 cursor-pointer absolute right-0 top-0" 
                onClick={() => setIsEditing(false)}
            />
         )}
      </div>
      
      {/* Helper text giống Jira */}
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
          <div className="text-[10px] text-slate-400">
             Press <span className="font-bold bg-slate-100 px-1 rounded border border-slate-200">Enter</span> to create
          </div>
          <div className="flex gap-2">
             <button 
                className="text-[11px] font-bold text-slate-500 hover:bg-slate-100 px-2 py-1 rounded"
                onClick={() => setIsEditing(false)}
             >
                Cancel
             </button>
          </div>
      </div>
    </div>
  );
}