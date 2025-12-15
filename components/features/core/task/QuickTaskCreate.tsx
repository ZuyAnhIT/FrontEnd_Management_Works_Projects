"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, X } from "lucide-react";
import { createProjectTask, TaskType, TaskPriority } from "@/services/apiProject";
import { useToast } from "@/components/ui/ToastProvider";

// =============================================================================
// 1. INTERFACES
// =============================================================================

interface QuickTaskCreateProps {
    // Các ID định danh dự án
    companyId: number;
    workspaceId: number;
    projectId: number;
    
    // Context
    sprintId?: number | null;
    statusId?: number;
    defaultType?: TaskType;
    
    // Props mới để quản lý UI
    initialMode?: 'button' | 'form'; 
    onCancel?: () => void;          
    
    // Callback khi tạo thành công
    onSuccess: (newTask: any) => void;
}

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function QuickTaskCreate({
    companyId, workspaceId, projectId,
    sprintId,
    statusId,
    defaultType = TaskType.TASK,
    initialMode = 'button',
    onCancel,
    onSuccess
}: QuickTaskCreateProps) {
    const { showToast } = useToast();
    
    // --- STATE ---
    // Khởi tạo state dựa trên initialMode
    const [isEditing, setIsEditing] = useState(initialMode === 'form');
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);

    // Sync state nếu props thay đổi (trường hợp cha re-render)
    useEffect(() => {
        if (initialMode === 'form') {
            setIsEditing(true);
        }
    }, [initialMode]);

    // --- HANDLER: CANCEL/RESET ---
    // Hàm xử lý hủy chung
    const handleCancel = () => {
        setIsEditing(false);
        setTitle("");
        if (onCancel) onCancel(); // Gọi ngược về cha để cha biết mà tắt state
    };

    // --- HANDLER: CREATE (Logic nghiệp vụ quan trọng) ---
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

            // Thêm context ID vào payload nếu có (Logic nghiệp vụ quan trọng)
            if (sprintId) {
                payload.sprintId = sprintId;
            }
            if (statusId) {
                payload.statusId = statusId;
            }

            const newTask = await createProjectTask(companyId, workspaceId, projectId, payload);
            
            onSuccess(newTask);
            setTitle(""); // Reset title sau khi tạo
           
        } catch (error: any) {
            console.error(error);
            // Lấy message lỗi từ API trả về
            const message = error.message || error.response?.data?.message || "Failed to create issue";
            showToast(message, "error");
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLER: KEYBOARD ---
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
                title="Click to create a new issue"
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
                />
                
                {loading ? (
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin absolute right-0 top-0" />
                ) : (
                    // ✅ FIX: Bọc X component trong button và thêm title cho A11y
                    <button
                         className="w-4 h-4 text-slate-300 hover:text-red-500 cursor-pointer absolute right-0 top-0 p-0"
                         onClick={handleCancel}
                         title="Cancel/Close"
                    >
                         <X className="w-full h-full" />
                    </button>
                )}
            </div>
            
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                <div className="text-[10px] text-slate-400">
                    Press <span className="font-bold bg-slate-100 px-1 rounded border border-slate-200">Enter</span> to create
                </div>
                <div className="flex gap-2">
                    <button
                        className="text-[11px] font-bold text-slate-500 hover:bg-slate-100 px-2 py-1 rounded"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}