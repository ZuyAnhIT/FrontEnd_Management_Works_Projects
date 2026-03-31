"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useState, useRef, useEffect } from "react";
import {
    ChevronDown,
    CheckSquare,
    Plus,
    Trash2,
    Edit2,
    Check,
    X,
    User as UserIcon,
    Search,
    ArrowUp,
    ArrowDown,
    Minus,
} from "lucide-react";

// Internal Components & Utils
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatars";
import { Input } from "@/components/ui/Inputs";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/Tooltips";
import { cn } from "@/lib/utils";

// Internal Services & Interfaces
import { Subtask } from "@/services/apiSubTask";

// =============================================================================
// 2. INTERFACES & HELPERS
// =============================================================================

/**
 * Mở rộng interface Subtask cục bộ để khắc phục lỗi TypeScript
 * mà không làm ảnh hưởng đến file service gốc.
 */
interface ExtendedSubtask extends Subtask {
    priority?: string;
}

interface TaskSubtasksProps {
    subtasks?: Subtask[];
    members?: any[];
    onAddSubtask?: () => void;
    onToggleStatus: (subtask: Subtask) => void;
    onDelete: (subTaskId: number) => void;
    onAssigneeChange: (subTaskId: number, newAssigneeId: number | null) => void;
    onEditContent: (subTaskId: number, data: { title: string }) => void;
    onViewDetail?: (subTaskId: number) => void;
    isReadOnly?: boolean; 
}

/**
 * Lấy màu nền ngẫu nhiên cho Avatar dựa trên ID
 */
const getAvatarColor = (id: number | string | null) => {
    if (!id) return "bg-slate-200 text-slate-500";
    const colors = [
        "bg-[#E54937]", "bg-[#FF991F]", "bg-[#F6C000]", 
        "bg-[#57D9A3]", "bg-[#00C7E6]", "bg-[#0052CC]", 
        "bg-[#6554C0]", "bg-[#FF5630]", "bg-[#36B37E]"
    ];
    const hash = typeof id === "number" ? id : id.toString().split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `${colors[hash % colors.length]} text-white`;
};

/**
 * Rút gọn chuỗi nếu quá dài
 */
const truncateString = (str: string, num: number) => {
    if (!str) return "";
    if (str.length <= num) return str;
    return str.slice(0, num) + "...";
};

// =============================================================================
// 3. SUB-COMPONENTS
// =============================================================================

/**
 * Icon hiển thị độ ưu tiên
 */
const PriorityIcon = ({ priority }: { priority?: string }) => {
    const p = (priority || "LOW").toUpperCase();
    let icon = <ArrowDown className="w-4 h-4 text-slate-400" />; 

    if (p === "URGENT") icon = <ArrowUp className="w-4 h-4 text-[#E54937]" />; // Red
    else if (p === "HIGH") icon = <ArrowUp className="w-4 h-4 text-[#FF991F]" />; // Orange
    else if (p === "MEDIUM") icon = <Minus className="w-4 h-4 text-[#0052CC]" />; // Blue

    return <div title={p} className="cursor-help flex justify-center">{icon}</div>;
};

/**
 * Dropdown nhỏ để gán người phụ trách ngay trên dòng Subtask
 */
const MiniAssigneeDropdown = ({
    subTaskId,
    currentAssigneeId,
    currentAssigneeName,
    currentAssigneeAvatar,
    members = [],
    onUpdate,
    isLastRow = false,
    readOnly = false 
}: {
    subTaskId: number;
    currentAssigneeId: number | null;
    currentAssigneeName: string | null;
    currentAssigneeAvatar: string | null;
    members: any[];
    onUpdate: (id: number | null) => void;
    isLastRow?: boolean;
    readOnly?: boolean;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [keyword, setKeyword] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredMembers = members.filter((m) =>
        (m.fullName || m.name || "").toLowerCase().includes(keyword.toLowerCase())
    );

    // Xử lý đóng Dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setKeyword("");
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleSelect = (e: React.MouseEvent, userId: number | null) => {
        e.stopPropagation();
        onUpdate(userId);
        setIsOpen(false);
        setKeyword("");
    };

    return (
        <div className="relative flex justify-center" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
            <TooltipProvider>
                <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                        <div
                            className={cn(
                                "transition-transform",
                                readOnly ? "cursor-default opacity-80" : "cursor-pointer hover:scale-110"
                            )}
                            onClick={() => !readOnly && setIsOpen(!isOpen)} 
                        >
                            <Avatar className="w-6 h-6 text-[10px] border border-white shadow-sm ring-1 ring-slate-100">
                                {currentAssigneeAvatar ? (
                                    <AvatarImage src={currentAssigneeAvatar} className="object-cover" />
                                ) : (
                                    <AvatarFallback className={cn("font-bold", getAvatarColor(currentAssigneeId))}>
                                        {currentAssigneeName ? currentAssigneeName.substring(0, 2).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-800 text-white text-[11px] font-bold border-none px-2.5 py-1">
                        {currentAssigneeName || "Unassigned"}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {/* Dropdown Menu (Ẩn nếu là ReadOnly) */}
            {isOpen && !readOnly && (
                <div className={cn(
                    "absolute right-0 w-56 bg-white rounded-lg shadow-xl z-50 border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150",
                    isLastRow ? "bottom-full mb-2" : "top-full mt-2"
                )}>
                    <div className="p-2 border-b border-slate-100 bg-slate-50/80">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                                ref={inputRef}
                                className="w-full pl-8 pr-2 py-1.5 text-[12px] font-medium border border-slate-200 rounded-md bg-white focus:outline-none focus:border-[#2684FF] focus:ring-1 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                                placeholder="Search user..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    <div className="max-h-56 overflow-y-auto py-1 custom-scrollbar">
                        {"unassigned".includes(keyword.toLowerCase()) && (
                            <div 
                                className="px-3 py-2 hover:bg-slate-50 cursor-pointer flex items-center gap-2.5 text-[12px] text-slate-600 border-b border-slate-100 transition-colors" 
                                onClick={(e) => handleSelect(e, null)}
                            >
                                <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                    <UserIcon className="w-3 h-3 text-slate-400" />
                                </div>
                                <span className="font-medium">Unassigned</span>
                                {currentAssigneeId === null && <Check className="w-4 h-4 ml-auto text-[#0052CC]" />}
                            </div>
                        )}
                        {filteredMembers.length > 0 ? (
                            filteredMembers.map((user) => {
                                const userId = user.userId || user.id;
                                const isSelected = userId === currentAssigneeId;
                                return (
                                    <div 
                                        key={userId} 
                                        className={cn(
                                            "px-3 py-2 cursor-pointer flex items-center gap-2.5 text-[12px] transition-colors",
                                            isSelected ? "bg-blue-50/50 text-[#0052CC]" : "hover:bg-slate-50 text-slate-700"
                                        )} 
                                        onClick={(e) => handleSelect(e, userId)}
                                    >
                                        <Avatar className="w-6 h-6 border border-white shadow-sm shrink-0">
                                            <AvatarImage src={user.avatarUrl || user.avatar} className="object-cover" />
                                            <AvatarFallback className={cn("text-[9px] font-bold", getAvatarColor(userId))}>
                                                {user.fullName ? user.fullName.substring(0, 2).toUpperCase() : "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="truncate font-medium flex-1">{user.fullName || user.name}</span>
                                        {isSelected && <Check className="w-4 h-4 ml-auto text-[#0052CC] shrink-0" />}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="px-3 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 text-center">
                                No users found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// =============================================================================
// 4. MAIN COMPONENT (TaskSubtasks)
// =============================================================================

export default function TaskSubtasks({
    subtasks = [],
    members = [],
    onAddSubtask,
    onToggleStatus,
    onDelete,
    onAssigneeChange,
    onEditContent,
    onViewDetail,
    isReadOnly = false 
}: TaskSubtasksProps) {
    
    // --- STATE ---
    const [editingSubtaskId, setEditingSubtaskId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState("");

    // --- HANDLERS: EDIT ---
    const startEditing = (sub: Subtask) => {
        if (isReadOnly) return; 
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

    // --- CALCULATIONS ---
    const completedSubtasks = subtasks.filter((s) => s.status === "DONE").length;
    const totalSubtasks = subtasks.length;
    const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

    /**
     * Lấy màu sắc nhãn Trạng thái chuẩn Jira
     */
    const getStatusStyle = (status: string) => {
        const s = status ? status.toUpperCase() : "TO_DO";
        if (s === "DONE") return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
        if (s === "IN_PROGRESS" || s === "IN PROGRESS") return "bg-blue-50 text-[#0052CC] border-blue-200 hover:bg-blue-100";
        return "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200";
    };

    // --- RENDER LOGIC ---
    return (
        <div className="space-y-4 pt-2">
            
            {/* Header: Tiêu đề & Thanh tiến độ */}
            <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-[#172B4D] flex items-center gap-1.5">
                    <ChevronDown className="w-4 h-4 text-slate-400" /> Subtasks
                </h3>
                <div className="flex items-center gap-3">
                    <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div 
                            className="h-full bg-emerald-500 transition-all duration-500 ease-out" 
                            style={{ width: `${progressPercent}%` }} 
                        />
                    </div>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest min-w-[50px] text-right">
                        {progressPercent}%
                    </span>
                    
                    {!isReadOnly && (
                        <button 
                            className="p-1.5 hover:bg-[#091E4214] rounded-md transition-colors text-slate-500 hover:text-[#172B4D] ml-2 active:scale-95" 
                            onClick={onAddSubtask} 
                            title="Add subtask"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Bảng danh sách Subtask */}
            <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-visible transition-all">
                <table className="w-full text-left border-collapse table-fixed">
                    <thead className="bg-slate-50/80 border-b border-slate-200">
                        <tr>
                            <th className="py-2.5 pl-4 pr-2 text-[10px] font-black text-slate-400 uppercase tracking-widest w-auto">Summary</th>
                            <th className="py-2.5 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-[50px]">Pri</th>
                            <th className="py-2.5 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-[90px]">Assignee</th>
                            <th className="py-2.5 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-[120px]">Status</th>
                            {!isReadOnly && <th className="py-2.5 px-2 w-[40px]"></th>}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {subtasks.length > 0 ? (
                            subtasks.map((sub, index) => {
                                // Ép kiểu an toàn bằng Interface mở rộng
                                const extendedSub = sub as ExtendedSubtask;

                                return (
                                    <tr key={sub.id} className="group hover:bg-[#091E420A] transition-colors h-11 relative">
                                        {editingSubtaskId === sub.id ? (
                                            /* --- CHẾ ĐỘ CHỈNH SỬA TÊN (INLINE EDIT) --- */
                                            <td colSpan={isReadOnly ? 4 : 5} className="p-1 pl-2">
                                                <div className="flex items-center gap-2 w-full bg-white rounded-md ring-2 ring-[#2684FF] shadow-sm z-10 relative p-1 transition-all animate-in fade-in zoom-in-95">
                                                    <Input
                                                        autoFocus
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        className="h-8 text-[13px] font-medium flex-1 w-full min-w-0 border-none focus-visible:ring-0 shadow-none px-2 text-[#172B4D]"
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") saveEditing();
                                                            if (e.key === "Escape") cancelEditing();
                                                        }}
                                                    />
                                                    <div className="flex shrink-0 gap-1 pr-1">
                                                        <button 
                                                            onClick={saveEditing} 
                                                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-md transition-colors active:scale-95" 
                                                            title="Save"
                                                        >
                                                            <Check className="w-4 h-4 stroke-[2.5]" />
                                                        </button>
                                                        <button 
                                                            onClick={cancelEditing} 
                                                            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-md transition-colors active:scale-95" 
                                                            title="Cancel"
                                                        >
                                                            <X className="w-4 h-4 stroke-[2.5]" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        ) : (
                                            /* --- CHẾ ĐỘ XEM THÔNG THƯỜNG --- */
                                            <>
                                                {/* 1. Tiêu đề */}
                                                <td className="py-2 pl-4 pr-2 align-middle">
                                                    <div 
                                                        className={cn(
                                                            "flex items-center gap-3 min-w-0 w-full",
                                                            isReadOnly ? "" : "cursor-pointer group/title"
                                                        )} 
                                                        onClick={() => !isReadOnly && onToggleStatus(sub)}
                                                    >
                                                        <CheckSquare 
                                                            className={cn(
                                                                "w-4 h-4 shrink-0 transition-colors",
                                                                sub.status === "DONE" ? "text-emerald-500" : "text-[#4C9AFF]",
                                                                isReadOnly ? "opacity-70" : ""
                                                            )} 
                                                        />
                                                        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                                                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest shrink-0 pt-0.5">
                                                                SUB-{sub.id}
                                                            </span>
                                                            
                                                            <TooltipProvider>
                                                                <Tooltip delayDuration={300}>
                                                                    <TooltipTrigger asChild>
                                                                        <span
                                                                            onClick={(e) => { 
                                                                                e.stopPropagation(); 
                                                                                if (onViewDetail) onViewDetail(sub.id); 
                                                                            }}
                                                                            className={cn(
                                                                                "truncate font-medium text-[13px] block w-full transition-colors",
                                                                                isReadOnly ? "text-[#172B4D]" : "cursor-pointer hover:text-[#0052CC] hover:underline",
                                                                                sub.status === "DONE" ? "line-through text-slate-400" : "text-[#172B4D]"
                                                                            )}
                                                                        >
                                                                            {truncateString(sub.title, 65)}
                                                                        </span>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent className="bg-slate-800 text-white text-[12px] px-3 py-2 max-w-[300px] break-words leading-relaxed font-medium">
                                                                        {sub.title}
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                        
                                                        {/* Nút sửa nhanh (Inline Edit) */}
                                                        {!isReadOnly && (
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); startEditing(sub); }} 
                                                                className="opacity-0 group-hover/title:opacity-100 p-1.5 hover:bg-[#091E4214] rounded-md text-slate-400 hover:text-slate-600 transition-all shrink-0 active:scale-95" 
                                                                title="Edit summary"
                                                            >
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* 2. Độ ưu tiên */}
                                                <td className="py-2 px-1 text-center align-middle">
                                                    <PriorityIcon priority={extendedSub.priority} />
                                                </td>

                                                {/* 3. Người phụ trách */}
                                                <td className="py-2 px-1 text-center align-middle overflow-visible">
                                                    <div className="flex justify-center relative z-10">
                                                        <MiniAssigneeDropdown
                                                            subTaskId={Number(sub.id)}
                                                            currentAssigneeId={sub.assigneeId}
                                                            currentAssigneeName={sub.assigneeName}
                                                            currentAssigneeAvatar={sub.assigneeAvatar}
                                                            members={members}
                                                            onUpdate={(newId) => onAssigneeChange(Number(sub.id), newId)}
                                                            isLastRow={index >= subtasks.length - 2 && subtasks.length > 2}
                                                            readOnly={isReadOnly} 
                                                        />
                                                    </div>
                                                </td>

                                                {/* 4. Trạng thái */}
                                                <td className="py-2 px-2 text-center align-middle">
                                                    <div className="flex justify-center">
                                                        <div
                                                            className={cn(
                                                                "inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-[3px] text-[10px] font-black uppercase tracking-wider transition-all select-none w-full max-w-[110px] border",
                                                                getStatusStyle(sub.status),
                                                                isReadOnly ? "cursor-default opacity-80 hover:bg-inherit" : "cursor-pointer"
                                                            )}
                                                            onClick={() => !isReadOnly && onToggleStatus(sub)}
                                                            title={isReadOnly ? undefined : "Click to toggle status"}
                                                        >
                                                            <span className="whitespace-nowrap truncate pt-px">
                                                                {sub.status?.replace(/_/g, " ") || "TO DO"}
                                                            </span>
                                                            {!isReadOnly && <ChevronDown className="w-3 h-3 opacity-50 shrink-0 hidden sm:block" />}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* 5. Xóa Subtask (Ẩn nếu ReadOnly) */}
                                                {!isReadOnly && (
                                                    <td className="py-2 px-2 text-center align-middle">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onDelete(sub.id); }}
                                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all active:scale-95"
                                                            title="Delete subtask"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                )}
                                            </>
                                        )}
                                    </tr>
                                );
                            })
                        ) : (
                            /* State trống */
                            <tr>
                                <td colSpan={isReadOnly ? 4 : 5} className="py-12 text-center bg-slate-50/50">
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <p className="text-[11px] font-bold uppercase tracking-widest mb-2">No subtasks created</p>
                                        {!isReadOnly && (
                                            <button 
                                                onClick={onAddSubtask} 
                                                className="text-[#0052CC] hover:text-[#0047B3] hover:underline cursor-pointer font-bold text-[12px] inline-flex items-center gap-1.5 transition-colors"
                                            >
                                                <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Create first subtask
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Footer: Thêm Subtask mới */}
                {subtasks.length > 0 && !isReadOnly && (
                    <div 
                        onClick={onAddSubtask} 
                        className={cn(
                            "px-5 py-3 bg-slate-50/50 border-t border-slate-100 text-[12px] font-bold text-slate-500 cursor-pointer flex items-center gap-2 rounded-b-xl transition-colors",
                            "hover:text-[#0052CC] hover:bg-[#E3F2FD] active:bg-blue-100"
                        )}
                    >
                        <Plus className="w-4 h-4 stroke-[2.5]" /> Create subtask
                    </div>
                )}
            </div>
        </div>
    );
}