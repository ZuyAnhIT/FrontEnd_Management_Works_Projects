"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Styles)
// =============================================================================

import React, { useState } from "react";
import { Plus, Loader2 } from "lucide-react";

// Internal Components & Utils
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";

// Internal Services & Types
import * as apiEpic from "@/services/apiEpic"; 
import { CreateEpicPayload } from "@/services/apiEpic"; 

// =============================================================================
// 2. INTERFACES & CONSTANTS
// =============================================================================

interface QuickEpicCreateProps {
    projectId: number;
    onSuccess: () => void; 
}

const DEFAULT_EPIC_COLOR = "#8b5cf6"; // Màu tím mặc định (Purple-500)

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Thành phần khởi tạo nhanh Epic (Quick Epic Create).
 * Cho phép tạo Epic ngay trên giao diện (thường dùng ở Gantt Chart/Roadmap).
 */
export default function QuickEpicCreate({ projectId, onSuccess }: QuickEpicCreateProps) {
    
    // ---------------------------------------------------------------------------
    // 4. HOOKS & STATE
    // ---------------------------------------------------------------------------
    
    const { showToast } = useToast();
    
    const [isEditing, setIsEditing] = useState(false);
    const [epicName, setEpicName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // ---------------------------------------------------------------------------
    // 5. HANDLERS
    // ---------------------------------------------------------------------------

    /**
     * Xử lý gọi API tạo Epic mới
     */
    const handleCreateEpic = async () => {
        if (!epicName.trim()) {
            setIsEditing(false);
            return;
        }

        setIsLoading(true);
        try {
            // Tự động set thời gian mặc định (Hôm nay -> 30 ngày sau)
            // Đảm bảo Epic vừa tạo sẽ hiển thị ngay trên Gantt Chart thay vì bị ẩn
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + 30);

            const payload: CreateEpicPayload = {
                name: epicName.trim(),
                description: "", 
                color: DEFAULT_EPIC_COLOR, 
                startDate: startDate.toISOString(),
                dueDate: endDate.toISOString(),
            };

            await apiEpic.createEpic(projectId, payload);
            
            showToast("Epic created successfully.", "success");
            onSuccess(); 
            setEpicName(""); // Giữ nguyên mode edit để người dùng có thể tạo liên tiếp (Bulk create)

        } catch (error: any) {
            console.error("Create Epic Error:", error);
            const message = error.response?.data?.message || error.message || "Failed to create epic.";
            showToast(message, "error");
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Xử lý các sự kiện bàn phím.
     * Cần chặn sự kiện (stopPropagation) để không bị xung đột với thư viện kéo thả (Gantt).
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        e.stopPropagation();

        if (e.key === "Enter") {
            e.preventDefault();
            handleCreateEpic();
        }
        
        if (e.key === "Escape") {
            setIsEditing(false);
            setEpicName("");
        }
    };

    // ---------------------------------------------------------------------------
    // 6. RENDER LOGIC
    // ---------------------------------------------------------------------------

    // TRẠNG THÁI CHỜ (IDLE STATE): Hiển thị nút bấm
    if (!isEditing) {
        return (
            <button 
                onClick={() => setIsEditing(true)}
                className={cn(
                    "w-full h-full flex items-center pl-4 group transition-colors",
                    "text-[12px] font-bold text-slate-500 hover:text-[#0052CC] hover:bg-slate-50/50"
                )}
                title="Create a new Epic"
            >
                <Plus className="w-3.5 h-3.5 mr-2 group-hover:scale-110 transition-transform stroke-[2.5]" /> 
                <span className="uppercase tracking-widest">Create Epic</span>
            </button>
        );
    }

    // TRẠNG THÁI NHẬP LIỆU (EDITING STATE): Hiển thị Form Input
    return (
        <div className="w-full h-full flex items-center px-3 bg-white border-l-4 border-[#0052CC] shadow-inner animate-in fade-in duration-200">
            <div className="relative w-full flex items-center">
                <input 
                    autoFocus
                    value={epicName}
                    onChange={(e) => setEpicName(e.target.value)}
                    onKeyDown={handleKeyDown} 
                    onKeyUp={(e) => e.stopPropagation()} // Đảm bảo không kích hoạt hotkey của cha
                    onBlur={() => {
                        if (!epicName.trim()) setIsEditing(false);
                    }}
                    placeholder="Type epic name & press Enter..."
                    className="w-full text-[13px] font-medium outline-none text-[#172B4D] placeholder:text-slate-400 bg-transparent h-8 pr-8 focus:ring-0"
                    disabled={isLoading}
                />
                
                {isLoading && (
                    <div className="absolute right-1">
                        <Loader2 className="w-4 h-4 animate-spin text-[#0052CC]" />
                    </div>
                )}
            </div>
        </div>
    );
}