"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, X } from "lucide-react";
import { createProjectTask, TaskType, TaskPriority } from "@/services/apiProject";
import { useToast } from "@/components/ui/ToastProvider";

interface QuickTaskCreateProps {
  // Các ID định danh dự án
  companyId: number;
  workspaceId: number;
  projectId: number;
  
  // Context
  sprintId?: number | null;
  statusId?: number;
  defaultType?: TaskType;
  
  // ✅ 1. Thêm các props mới để fix lỗi TypeScript
  initialMode?: 'button' | 'form'; // 'button': hiện nút cộng trước, 'form': hiện input luôn
  onCancel?: () => void;           // Callback khi user hủy/đóng form
  
  // Callback khi tạo thành công
  onSuccess: (newTask: any) => void;
}

export default function QuickTaskCreate({
  companyId, workspaceId, projectId,
  sprintId,
  statusId,
  defaultType = TaskType.TASK,
  // ✅ 2. Nhận props và set default
  initialMode = 'button',
  onCancel,
  onSuccess
}: QuickTaskCreateProps) {
  const { showToast } = useToast();
  
  // ✅ 3. Khởi tạo state dựa trên initialMode
  const [isEditing, setIsEditing] = useState(initialMode === 'form');
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync state nếu props thay đổi (trường hợp cha re-render)
  useEffect(() => {
    if (initialMode === 'form') {
      setIsEditing(true);
    }
  }, [initialMode]);

  // ✅ 4. Hàm xử lý hủy chung
  const handleCancel = () => {
    setIsEditing(false);
    setTitle("");
    if (onCancel) onCancel(); // Gọi ngược về cha để cha biết mà tắt state
  };

  const handleCreate = async () => {
    if (!title.trim()) {
        handleCancel();
        return;
    }

    try {
      setLoading(true);

      const payload: any = {
        title: title.trim(),
        taskType: defaultType,
        priority: TaskPriority.MEDIUM,
        description: "",
      };

      if (sprintId) {
        payload.sprintId = sprintId;
      }
      if (statusId) {
        payload.statusId = statusId;
      }

      const newTask = await createProjectTask(companyId, workspaceId, projectId, payload);
      
      onSuccess(newTask);
      setTitle(""); 
      
      // Nếu là chế độ button (Backlog), tạo xong thì vẫn giữ form để nhập tiếp (Jira style)
      // Nếu là chế độ form (Board), tùy logic cha mà có thể đóng hoặc không.
      // Ở đây ta giữ nguyên form để nhập tiếp, user muốn đóng thì bấm Cancel/ESC.
     
    } catch (error) {
      console.error(error);
      showToast("Failed to create issue", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleCreate();
    }
    if (e.key === 'Escape') {
        handleCancel(); // Gọi hàm cancel chuẩn
    }
  };

  // --- RENDER: TRẠNG THÁI NÚT BẤM (IDLE) ---
  // Chỉ hiện nút khi không phải mode 'form' và không đang edit
  if (!isEditing && initialMode === 'button') {
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
            // Bỏ onBlur tự đóng để tránh UX khó chịu khi click nhầm ra ngoài
         />
         
         {loading ? (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin absolute right-0 top-0" />
         ) : (
            <X
                className="w-4 h-4 text-slate-300 hover:text-red-500 cursor-pointer absolute right-0 top-0"
                onClick={handleCancel} // ✅ Gọi handleCancel
            />
         )}
      </div>
     
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
          <div className="text-[10px] text-slate-400">
             Press <span className="font-bold bg-slate-100 px-1 rounded border border-slate-200">Enter</span> to create
          </div>
          <div className="flex gap-2">
             <button
                className="text-[11px] font-bold text-slate-500 hover:bg-slate-100 px-2 py-1 rounded"
                onClick={handleCancel} // ✅ Gọi handleCancel
             >
                Cancel
             </button>
          </div>
      </div>
    </div>
  );
}