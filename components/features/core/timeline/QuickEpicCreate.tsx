"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { apiEpic, CreateEpicPayload } from "@/services/apiEpic"; 
import { useToast } from "@/components/ui/ToastProvider";

// =============================================================================
// 1. INTERFACES & CONFIG
// =============================================================================

interface QuickEpicCreateProps {
    projectId: number;
    onSuccess: () => void; // Callback để reload Gantt Chart
}

const DEFAULT_EPIC_COLOR = "#8b5cf6"; // Màu tím mặc định cho Epic

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function QuickEpicCreate({ projectId, onSuccess }: QuickEpicCreateProps) {
    const { showToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    // --- HANDLER: CREATE (Logic nghiệp vụ quan trọng) ---
    const handleCreate = async () => {
        if (!name.trim()) {
            setIsEditing(false);
            return;
        }

        setLoading(true);
        try {
            // 1. Tự động tạo ngày tháng mặc định (Hôm nay -> 30 ngày sau)
            // Để Epic hiện lên Timeline ngay lập tức thay vì bị ẩn
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + 30);

            // 2. Chuẩn bị Payload
            const payload: CreateEpicPayload = {
                name: name.trim(),
                description: "", 
                color: DEFAULT_EPIC_COLOR, 
                startDate: startDate.toISOString(),
                dueDate: endDate.toISOString(),
            };

            // 3. Gọi API
            await apiEpic.createEpic(projectId, payload);
            
            showToast("Epic created successfully", "success");
            onSuccess(); // Reload list
            setName(""); // Clear input để nhập tiếp (Bulk create style)

        } catch (error: any) {
            console.error(error);
            const message = error.message || error.response?.data?.message || "Failed to create epic";
            showToast(message, "error");
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLER: KEYBOARD (Logic nghiệp vụ quan trọng) ---
    const handleKeyDown = (e: React.KeyboardEvent) => {
        // ✅ QUAN TRỌNG: Ngăn sự kiện phím lan ra ngoài (lên thư viện Gantt)
        e.stopPropagation();

        if (e.key === 'Enter') {
            e.preventDefault();
            handleCreate();
        }
        if (e.key === 'Escape') {
            setIsEditing(false);
            setName("");
        }
    };

    // --- RENDER: NÚT BẤM (IDLE STATE) ---
    if (!isEditing) {
        return (
            <button 
                onClick={() => setIsEditing(true)}
                className="w-full h-full flex items-center pl-4 text-xs font-bold text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-colors group"
                title="Create a new Epic"
            >
                <Plus className="w-3.5 h-3.5 mr-2 group-hover:scale-110 transition-transform" /> 
                Create Epic
            </button>
        );
    }

    // --- RENDER: Ô NHẬP LIỆU (EDITING STATE) ---
    return (
        <div className="w-full h-full flex items-center px-2 bg-white border-l-4 border-blue-500">
            <div className="relative w-full">
                <input 
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyDown} 
                    onBlur={() => {
                        // Tự đóng nếu không có nội dung
                        if (!name.trim()) setIsEditing(false);
                    }}
                    placeholder="Type epic name & press Enter..."
                    className="w-full text-sm outline-none text-slate-800 placeholder:text-slate-400 bg-transparent h-8 pr-6"
                    disabled={loading}
                    // Thêm onKeyUp stopPropagation cho chắc chắn
                    onKeyUp={(e) => e.stopPropagation()}
                />
                {loading && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    </div>
                )}
            </div>
        </div>
    );
}