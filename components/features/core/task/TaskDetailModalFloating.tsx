"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Styles)
// =============================================================================

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    X, Lock, Eye, Share2, MoreHorizontal, Maximize2, Link as LinkIcon,
    CheckSquare, ChevronDown, Plus, Loader2, Tag as TagIcon, Flag,
    User, Clock, Layers, Zap, Check, Trash2, Minimize2, Archive,
} from "lucide-react";

// Components
import { Button } from "@/components/ui/Buttons";
import { Input } from "@/components/ui/Inputs";
import { Textarea } from "@/components/ui/TextAreas";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatars";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltips";
import { Badge } from "@/components/ui/Badges";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useToast } from "@/components/ui/ToastProvider";

// Internal Sub-components
import SubtaskDetailView from "./SubtaskDetailView";
import TaskComment from "@/components/features/core/task/TaskComment";
import TaskSubtasks from "@/components/features/core/task/SubTasks";
import EpicModal from "@/components/features/core/epic/EpicModal";
import TagModal from "@/components/features/core/tag/TagModal";

// API Services & Types
import { getTaskDetails, updateTask, archiveTask, TaskDetail, UpdateTaskData } from "@/services/apiTask";
import { getSubtaskList, createSubtask, updateSubtask, deleteSubtask, Subtask } from "@/services/apiSubTask";
import * as apiTag from "@/services/apiTag"; // ✅ FIX: Import as namespace
import { Tag } from "@/services/apiTag";
import { getSprints, Sprint } from "@/services/apiSprint";

// Utils
import { cn } from "@/lib/utils";

// =============================================================================
// 2. CONSTANTS & HELPERS
// =============================================================================

/**
 * Lấy chữ cái đầu của tên cho Avatar Fallback
 */
const getInitials = (name?: string) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "UN";

/**
 * Chuyển đổi định dạng ISO sang datetime-local input
 */
const toInputDate = (iso?: string | null) =>
    iso ? new Date(iso).toISOString().slice(0, 16) : "";

/**
 * Mở rộng interface Subtask cục bộ nếu cần thiết cho các component con
 */
interface ExtendedSubtask extends Subtask {
    priority?: string;
}

// --- COMPONENT PHỤ: CHỌN ĐỘ ƯU TIÊN ---
const PrioritySelect = ({ value, onChange, disabled = false }: {
    value: string;
    onChange: (val: string) => void;
    disabled?: boolean;
}) => {
    const config: Record<string, { class: string; icon: any }> = {
        URGENT: { class: "text-red-700 bg-red-50 hover:bg-red-100 border-red-200", icon: <Flag className="w-3 h-3 fill-red-700 text-red-700" /> },
        HIGH: { class: "text-orange-700 bg-orange-50 hover:bg-orange-100 border-orange-200", icon: <Flag className="w-3 h-3 fill-orange-700 text-orange-700" /> },
        MEDIUM: { class: "text-[#0052CC] bg-blue-50 hover:bg-blue-100 border-blue-200", icon: <Flag className="w-3 h-3 fill-[#0052CC] text-[#0052CC]" /> },
        LOW: { class: "text-slate-600 bg-slate-100 hover:bg-slate-200 border-slate-200", icon: <Flag className="w-3 h-3 text-slate-500" /> },
    };

    const current = config[value] || config.LOW;

    return (
        <div className="relative group w-full">
            <div className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-[3px] border transition-colors cursor-pointer",
                current.class,
                disabled && "opacity-70 cursor-not-allowed"
            )}>
                {current.icon}
                <span className="text-[11px] font-black uppercase tracking-wider flex-1">{value || "LOW"}</span>
                <ChevronDown className="w-3 h-3 opacity-50" />
            </div>
            <select
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                value={value || "LOW"}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
            >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
            </select>
        </div>
    );
};

// =============================================================================
// 3. MAIN COMPONENT PROPS
// =============================================================================

interface TaskDetailModalProps {
    taskId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: () => void;
    onSwitchToFloating?: () => void;
    onSwitchToPanel?: () => void;
    members?: any[];
    sprints?: any[];
    epics?: any[];
    statuses?: any[];
    companyId: number;
    workspaceId: number;
    projectId: number;
    readOnly?: boolean;
}

export default function TaskDetailModalFloating({
    taskId, isOpen, onClose, onUpdate, onSwitchToPanel,
    members = [], sprints = [], statuses = [],
    companyId, workspaceId, projectId, readOnly = false
}: TaskDetailModalProps) {
    
    // ---------------------------------------------------------------------------
    // 4. HOOKS & REFS
    // ---------------------------------------------------------------------------
    
    const { showToast } = useToast();
    
    const modalRef = useRef<HTMLDivElement>(null);
    const tagButtonRef = useRef<HTMLButtonElement>(null);
    const tagPopoverRef = useRef<HTMLDivElement>(null);
    const tagInputRef = useRef<HTMLInputElement>(null);
    const sprintButtonRef = useRef<HTMLButtonElement>(null);
    const sprintPopoverRef = useRef<HTMLDivElement>(null);

    // ---------------------------------------------------------------------------
    // 5. STATE
    // ---------------------------------------------------------------------------
    
    // Dữ liệu chính
    const [task, setTask] = useState<TaskDetail | null>(null);
    const [formData, setFormData] = useState<UpdateTaskData>({});
    const [subtasks, setSubtasks] = useState<ExtendedSubtask[]>([]);
    const [allProjectTags, setAllProjectTags] = useState<Tag[]>([]);
    const [localSprints, setLocalSprints] = useState<any[]>(sprints);

    // Trạng thái Loading
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Trạng thái UI nhập liệu
    const [selectedSubtaskId, setSelectedSubtaskId] = useState<number | null>(null);
    const [isAddingSubtask, setIsAddingSubtask] = useState(false);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [tagSearch, setTagSearch] = useState("");
    const [editingTag, setEditingTag] = useState<Tag | null>(null);

    // Trạng thái hiển thị Popover / Modal con
    const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
    const [isSprintPopoverOpen, setIsSprintPopoverOpen] = useState(false);
    const [isEpicModalOpen, setIsEpicModalOpen] = useState(false);
    const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [subtaskToDelete, setSubtaskToDelete] = useState<number | null>(null);
    const [isDeletingSubtask, setIsDeletingSubtask] = useState(false);

    // Trạng thái cửa sổ (Kéo, Thả, Kích thước)
    const [position, setPosition] = useState({ x: 100, y: 50 });
    const [size, setSize] = useState({ width: 1100, height: 750 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // ---------------------------------------------------------------------------
    // 6. EFFECTS (Window Events & Data Fetching)
    // ---------------------------------------------------------------------------

    // Xử lý Click Outside cho các Popover
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            if (tagPopoverRef.current && !tagPopoverRef.current.contains(target) && !tagButtonRef.current?.contains(target)) {
                setIsTagPopoverOpen(false);
                setTagSearch("");
            }
            if (sprintPopoverRef.current && !sprintPopoverRef.current.contains(target) && !sprintButtonRef.current?.contains(target)) {
                setIsSprintPopoverOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus input khi mở Popover Tags
    useEffect(() => {
        if (isTagPopoverOpen && tagInputRef.current) {
            setTimeout(() => tagInputRef.current?.focus(), 50);
        }
    }, [isTagPopoverOpen]);

    // Xử lý sự kiện di chuyển và thay đổi kích thước cửa sổ
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) setPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
            if (isResizing) setSize({ width: Math.max(800, e.clientX - position.x), height: Math.max(500, e.clientY - position.y) });
        };
        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        if (isDragging || isResizing) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
            return () => {
                window.removeEventListener("mousemove", handleMouseMove);
                window.removeEventListener("mouseup", handleMouseUp);
            };
        }
    }, [isDragging, isResizing, position, dragOffset]);

    // Tải dữ liệu ban đầu
    useEffect(() => {
        if (isOpen && taskId) {
            setIsLoading(true);

            getTaskDetails(taskId)
                .then((data) => {
                    setTask(data);
                    setFormData({
                        title: data.title,
                        description: data.description || "",
                        taskType: data.taskType,
                        priority: data.priority,
                        statusId: data.status?.id,
                        sprintId: data.sprint?.id,
                        epicId: data.epic?.id,
                        assigneeId: data.assignee?.id,
                        storyPoints: data.storyPoints || 0,
                        estimatedHours: data.estimatedHours || 0,
                        startDate: data.startDate || undefined,
                        dueDate: data.dueDate || undefined,
                    });
                })
                .catch((err: any) => {
                    const message = err.response?.data?.message || err.message || "Failed to load task details.";
                    showToast(message, "error");
                })
                .finally(() => setIsLoading(false));

            fetchSubtasks(taskId);

            // ✅ FIX: Định nghĩa kiểu Tag[] rõ ràng
            apiTag.getTags(companyId, workspaceId, projectId)
                .then((tags: Tag[]) => setAllProjectTags(tags))
                .catch(() => {}); // Silent fail

            getSprints(projectId)
                .then((data) => setLocalSprints(data))
                .catch(() => {}); // Silent fail
        }
    }, [isOpen, taskId, companyId, workspaceId, projectId, showToast]);

    // ---------------------------------------------------------------------------
    // 7. HANDLERS (Core Logic)
    // ---------------------------------------------------------------------------

    /**
     * Tải danh sách Subtasks
     */
    const fetchSubtasks = async (id: number) => {
        try {
            const data = await getSubtaskList(companyId, workspaceId, projectId, id);
            setSubtasks(Array.isArray(data) ? (data as ExtendedSubtask[]) : []);
        } catch (error) {}
    };

    /**
     * Khởi tạo quá trình kéo cửa sổ
     */
    const handleHeaderMouseDown = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest(".resize-handle") || target.closest("button")) return;
        setIsDragging(true);
        setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    /**
     * Cập nhật thông tin Task chính (Tự động lưu)
     */
    /**
     * Cập nhật thông tin Task chính (Tự động lưu)
     */
    const handleUpdateTask = async (field: keyof UpdateTaskData, value: any) => {
        if (!task || !taskId || readOnly) return; 
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Cập nhật giao diện giả lập (Optimistic UI) cho Assignee
        if (field === "assigneeId") {
            const userId = Number(value);
            if (userId === 0) {
                setTask({ ...task, assignee: null });
            } else {
                const user = members.find((m) => (m.userId || m.id) === userId);
                if (user) {
                    setTask({
                        ...task,
                        assignee: { id: userId, name: user.fullName || user.name, avatarUrl: user.avatarUrl || user.avatar },
                    });
                }
            }
        }

        // Cập nhật giao diện giả lập (Optimistic UI) cho Status
        if (field === "statusId") {
            const newStatusId = Number(value);
            const statusObj = statuses.find((s) => s.id === newStatusId);
            if (statusObj) {
                setTask({
                    ...task,
                    status: { id: newStatusId, name: statusObj.name, color: statusObj.color, isCompleted: statusObj.isCompleted || false },
                });
            }
        }

        // --- BẮT ĐẦU FIX LỖI TYPESCRIPT Ở ĐÂY ---
        // Chuẩn bị payload: Đổi toàn bộ gán 'null' thành 'undefined' để API/FormData chấp nhận
        let payloadValue = value;
        
        if (field === "startDate" || field === "dueDate") {
            payloadValue = value ? new Date(value).toISOString() : undefined; 
        }
        if (field === "storyPoints" || field === "estimatedHours") {
            payloadValue = Number(value);
        }
        if (["sprintId", "epicId", "assigneeId"].includes(field as string) && (value === 0 || value === "0" || value === null)) {
            payloadValue = undefined; 
        }
        if (field === "statusId") {
            payloadValue = Number(value);
        }
        // --- KẾT THÚC FIX LỖI ---

        try {
            setIsSaving(true);
            await updateTask(taskId, { [field]: payloadValue });
            if (onUpdate) onUpdate();
            showToast("Issue updated", "success");
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || "Update failed.";
            showToast(message, "error");
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * Xử lý lưu trữ Task (Archive)
     */
    const handleArchiveConfirm = async () => {
        if (!taskId || readOnly) return; 

        try {
            setIsSaving(true);
            await archiveTask(taskId);
            showToast("Task archived", "success");
            onClose();
            if (onUpdate) onUpdate();
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || "Failed to archive task.";
            showToast(message, "error");
        } finally {
            setIsSaving(false);
            setIsArchiveConfirmOpen(false);
        }
    };

    /**
     * Xử lý liên kết Epic
     */
    const handleSelectEpic = async (epic: any | null) => {
        if (readOnly) return; 
        setTask((prev) => prev ? { ...prev, epic: epic ? { id: epic.id, name: epic.name, color: epic.color } : null } : null);
        setFormData((prev) => ({ ...prev, epicId: epic ? epic.id : null }));
        await handleUpdateTask("epicId", epic ? epic.id : null);
    };

    // --- QUẢN LÝ TAGS ---

    const filteredTags = useMemo(() => {
        if (!tagSearch.trim()) return allProjectTags;
        return allProjectTags.filter((t) => t.name.toLowerCase().includes(tagSearch.toLowerCase()));
    }, [allProjectTags, tagSearch]);

    const handleAddTag = async (tag: Tag) => {
        if (!taskId || !task || readOnly) return; 
        const currentTags = (task.tags as unknown as Tag[]) || [];
        if (currentTags.some((t) => t.id === tag.id)) return;

        const newTags = [...currentTags, tag];
        setTask({ ...task, tags: newTags as any });
        setIsTagPopoverOpen(false);

        try {
            await apiTag.assignTagToTask(companyId, workspaceId, projectId, taskId, tag.id);
        } catch (error: any) {
            setTask({ ...task, tags: currentTags as any });
            const message = error.response?.data?.message || error.message || "Failed to add label.";
            showToast(message, "error");
        }
    };

    const handleRemoveTag = async (tagId: number) => {
        if (!taskId || !task || readOnly) return; 
        const currentTags = (task.tags as unknown as Tag[]) || [];
        const newTags = currentTags.filter((t) => t.id !== tagId);

        setTask({ ...task, tags: newTags as any });
        try {
            await apiTag.removeTagFromTask(companyId, workspaceId, projectId, taskId, tagId);
        } catch (error: any) {
            setTask({ ...task, tags: currentTags as any });
            const message = error.response?.data?.message || error.message || "Failed to remove label.";
            showToast(message, "error");
        }
    };

    const handleCreateNewTag = async () => {
        if (!taskId || !tagSearch.trim() || readOnly) return; 
        try {
            const newTag = await apiTag.createTag(companyId, workspaceId, projectId, { name: tagSearch.trim(), color: "#95a5a6" });
            setAllProjectTags((prev) => [...prev, newTag]);
            handleAddTag(newTag);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || "Error creating new label.";
            showToast(message, "error");
        }
    };

    // --- QUẢN LÝ SUBTASKS & MÔ TẢ ---

    const handleSaveDescription = async () => {
        if (!taskId || readOnly) return; 
        await handleUpdateTask("description", formData.description);
        setIsEditingDescription(false);
    };

    const handleCancelDescription = () => {
        setFormData((prev) => ({ ...prev, description: task?.description || "" }));
        setIsEditingDescription(false);
    };

    const handleCreateSubtask = async () => {
        if (!newSubtaskTitle.trim() || !taskId || readOnly) return; 
        try {
            await createSubtask(companyId, workspaceId, projectId, taskId, { title: newSubtaskTitle.trim() });
            setNewSubtaskTitle("");
            setIsAddingSubtask(false);
            fetchSubtasks(taskId);
            showToast("Subtask created", "success");
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || "Failed to create subtask.";
            showToast(message, "error");
        }
    };

    const handleToggleSubtaskStatus = async (subtask: Subtask) => {
        if (!taskId || readOnly) return; 
        const newStatus = subtask.status === "DONE" ? "TO_DO" : "DONE";
        setSubtasks((prev) => prev.map((s) => (s.id === subtask.id ? { ...s, status: newStatus } : s)));
        try {
            await updateSubtask(companyId, workspaceId, projectId, taskId, subtask.id, { status: newStatus });
        } catch (error) {
            fetchSubtasks(taskId);
            showToast("Failed to update status.", "error");
        }
    };

    const handleConfirmDeleteSubtask = async () => {
        if (!taskId || !subtaskToDelete || readOnly) return; 
        setIsDeletingSubtask(true);
        try {
            await deleteSubtask(companyId, workspaceId, projectId, taskId, subtaskToDelete);
            setSubtasks((prev) => prev.filter((s) => s.id !== subtaskToDelete));
            showToast("Subtask deleted", "success");
            setIsDeleteConfirmOpen(false);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || "Failed to delete subtask.";
            showToast(message, "error");
            fetchSubtasks(taskId); 
        } finally {
            setIsDeletingSubtask(false);
            setSubtaskToDelete(null);
        }
    };

    const handleUpdateSubtaskData = async (subTaskId: number, data: any) => {
        if (!taskId || readOnly) return; 

        setSubtasks((prev) => prev.map((s) => {
            if (s.id === subTaskId) {
                if (data.assigneeId !== undefined) {
                    const userId = Number(data.assigneeId);
                    if (userId === 0) return { ...s, ...data, assigneeId: null, assigneeName: "Unassigned", assigneeAvatar: null };
                    const member = members.find((m) => (m.userId || m.id) === userId);
                    return { ...s, ...data, assigneeId: userId, assigneeName: member?.fullName || member?.name, assigneeAvatar: member?.avatarUrl || member?.avatar };
                }
                return { ...s, ...data };
            }
            return s;
        }));

        try {
            await updateSubtask(companyId, workspaceId, projectId, taskId, subTaskId, data);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || "Subtask update failed.";
            showToast(message, "error");
            fetchSubtasks(taskId);
        }
    };

    // ---------------------------------------------------------------------------
    // 8. RENDER LOGIC
    // ---------------------------------------------------------------------------

    if (!taskId) return null;

    return (
        <>
            {/* Overlay nền */}
            <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-[1px] z-40 transition-opacity" onClick={onClose} />

            {/* Cửa sổ nổi */}
            <div
                ref={modalRef}
                className="fixed bg-white border border-slate-200 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-50 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
                style={{ left: `${position.x}px`, top: `${position.y}px`, width: `${size.width}px`, height: `${size.height}px` }}
            >
                {selectedSubtaskId ? (
                    <SubtaskDetailView
                        subtaskId={selectedSubtaskId} taskId={taskId}
                        companyId={companyId} workspaceId={workspaceId} projectId={projectId}
                        members={members}
                        onBack={() => setSelectedSubtaskId(null)}
                        onClose={onClose} onUpdateParent={() => fetchSubtasks(taskId)}
                    />
                ) : (
                    <>
                        {/* --- HEADER --- */}
                        <div
                            className="bg-white border-b border-slate-100 px-6 py-3.5 flex items-center justify-between cursor-grab active:cursor-grabbing shrink-0"
                            onMouseDown={handleHeaderMouseDown}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-[#E3F2FD] rounded-lg">
                                    <CheckSquare className="w-4 h-4 text-[#0052CC]" />
                                </div>
                                <TooltipProvider>
                                    <Tooltip delayDuration={200}>
                                        <TooltipTrigger asChild>
                                            <span className="text-[13px] font-black text-slate-500 hover:text-[#0052CC] hover:underline transition-colors tracking-tight uppercase">
                                                {task?.taskCode || `TASK-${taskId}`}
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-slate-800 text-white max-w-[300px]">
                                            <p className="font-bold text-[11px] mb-1 text-blue-300">{task?.taskCode}</p>
                                            <p className="text-[12px] leading-relaxed">{formData.title}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                {isSaving && (
                                    <span className="ml-3 flex items-center gap-1.5 text-[#0052CC] animate-pulse bg-blue-50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">
                                        <Loader2 className="w-3 h-3 animate-spin" /> Syncing
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5" onMouseDown={(e) => e.stopPropagation()}>
                                {!readOnly && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-red-50 hover:text-red-600 active:scale-95" onClick={() => setIsArchiveConfirmOpen(true)} disabled={isSaving}>
                                                    <Archive className="w-4 h-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent><p className="text-[11px] font-bold">Archive Task</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                                <div className="w-px h-4 bg-slate-200 mx-1" />
                                {onSwitchToPanel && (
                                    <Button variant="ghost" size="icon" onClick={onSwitchToPanel} className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95" title="Minimize">
                                        <Minimize2 className="w-4 h-4" />
                                    </Button>
                                )}
                                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 active:scale-95" title="Close">
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* --- BODY --- */}
                        <div className="flex flex-1 overflow-hidden bg-white">
                            {isLoading ? (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                    <Loader2 className="w-8 h-8 text-[#0052CC] animate-spin opacity-80" />
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loading issue...</span>
                                </div>
                            ) : task ? (
                                <div className="flex flex-col h-full w-full animate-in fade-in duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] h-full min-h-0">
                                        
                                        {/* CỘT TRÁI (Nội dung chính) */}
                                        <div className="p-8 border-r border-slate-100 overflow-y-auto custom-scrollbar">
                                            <div className="max-w-4xl">
                                                <Textarea
                                                    className={cn(
                                                        "w-full text-2xl font-black text-[#172B4D] border-2 border-transparent px-2 -ml-2 py-1 h-auto outline-none transition-all shadow-none focus-visible:ring-0 leading-tight resize-none overflow-hidden",
                                                        readOnly ? "cursor-not-allowed" : "hover:bg-slate-50 focus:bg-white focus:border-[#2684FF] placeholder:text-slate-300"
                                                    )}
                                                    value={formData.title || ""}
                                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                    onBlur={(e) => handleUpdateTask("title", e.target.value)}
                                                    placeholder="Issue summary"
                                                    disabled={isSaving || readOnly}
                                                    rows={Math.max(1, Math.ceil((formData.title?.length || 1) / 50))}
                                                />

                                                <div className="flex gap-2.5 mt-4 mb-8">
                                                    <Button variant="outline" className="h-8 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#172B4D] text-[11px] font-bold uppercase tracking-widest active:scale-95">
                                                        <LinkIcon className="w-3.5 h-3.5 mr-2" /> Attach
                                                    </Button>
                                                    {!readOnly && (
                                                        <Button variant="outline" onClick={() => setIsAddingSubtask(true)} disabled={isSaving} className="h-8 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#172B4D] text-[11px] font-bold uppercase tracking-widest active:scale-95">
                                                            <Plus className="w-3.5 h-3.5 mr-2" /> Add Subtask
                                                        </Button>
                                                    )}
                                                </div>

                                                {/* Description */}
                                                <div className="space-y-3 group mb-10">
                                                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Description</h3>
                                                    {isEditingDescription && !readOnly ? (
                                                        <div className="animate-in fade-in duration-200 space-y-3">
                                                            <Textarea
                                                                className="min-h-[160px] border-[#2684FF] focus-visible:ring-2 focus-visible:ring-blue-100 resize-y text-[14px] leading-relaxed shadow-sm"
                                                                value={formData.description || ""}
                                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                                autoFocus placeholder="Describe the issue in detail..."
                                                            />
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="sm" onClick={handleSaveDescription} disabled={isSaving} className="bg-[#0052CC] hover:bg-[#0047B3] text-white text-[11px] font-bold uppercase tracking-widest active:scale-95">Save</Button>
                                                                <Button size="sm" variant="ghost" onClick={handleCancelDescription} disabled={isSaving} className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Cancel</Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className={cn(
                                                                "min-h-[80px] text-[14px] text-[#172B4D] p-3 rounded-xl border border-transparent leading-relaxed transition-all",
                                                                readOnly ? "" : "hover:bg-slate-50 hover:border-slate-200 cursor-pointer"
                                                            )}
                                                            onClick={() => !readOnly && setIsEditingDescription(true)}
                                                        >
                                                            {formData.description ? <div className="whitespace-pre-wrap">{formData.description}</div> : <span className="text-slate-400 italic">Click to add description...</span>}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Subtasks */}
                                                <TaskSubtasks
                                                    subtasks={subtasks} members={members}
                                                    onToggleStatus={handleToggleSubtaskStatus}
                                                    onDelete={(id) => { setSubtaskToDelete(id); setIsDeleteConfirmOpen(true); }}
                                                    onAddSubtask={() => setIsAddingSubtask(true)}
                                                    onAssigneeChange={(id, uid) => handleUpdateSubtaskData(id, { assigneeId: uid })}
                                                    onEditContent={(id, data) => handleUpdateSubtaskData(id, data)}
                                                    onViewDetail={setSelectedSubtaskId}
                                                    isReadOnly={readOnly}
                                                />

                                                {isAddingSubtask && !readOnly && (
                                                    <div className="mt-3 flex gap-2 animate-in slide-in-from-top-2 duration-200">
                                                        <Input
                                                            className="h-9 text-[13px] font-medium placeholder:text-slate-400 focus-visible:ring-[#2684FF]"
                                                            value={newSubtaskTitle} onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                                            onKeyDown={(e) => e.key === "Enter" && handleCreateSubtask()}
                                                            autoFocus placeholder="What needs to be done?" disabled={isSaving}
                                                        />
                                                        <Button size="sm" onClick={handleCreateSubtask} className="h-9 bg-[#0052CC] hover:bg-[#0047B3] text-[11px] font-bold uppercase tracking-widest active:scale-95" disabled={isSaving || !newSubtaskTitle.trim()}>Add</Button>
                                                        <Button size="sm" variant="ghost" onClick={() => setIsAddingSubtask(false)} className="h-9 text-[11px] font-bold uppercase tracking-widest text-slate-500" disabled={isSaving}>Cancel</Button>
                                                    </div>
                                                )}

                                                <TaskComment taskId={taskId} />
                                            </div>
                                        </div>

                                        {/* CỘT PHẢI (Metadata) */}
                                        <div className="bg-[#F4F5F7] overflow-y-auto custom-scrollbar p-6 space-y-8 shrink-0">
                                            
                                            {/* Status */}
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</label>
                                                <div className="relative">
                                                    <select
                                                        className={cn(
                                                            "w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-[12px] font-black uppercase tracking-wider shadow-sm cursor-pointer outline-none appearance-none transition-all",
                                                            "hover:border-slate-300 focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF]",
                                                            "disabled:cursor-not-allowed disabled:opacity-70"
                                                        )}
                                                        value={formData.statusId || ""}
                                                        onChange={(e) => handleUpdateTask("statusId", Number(e.target.value))}
                                                        style={{ borderLeft: `4px solid ${task.status?.color || "#ddd"}` }}
                                                        disabled={isSaving || readOnly}
                                                    >
                                                        {statuses.length > 0 ? statuses.map((st) => <option key={st.id} value={st.id}>{st.name}</option>) : <option value={task.status?.id || 0}>{task.status?.name}</option>}
                                                    </select>
                                                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                                                </div>
                                            </div>

                                            <hr className="border-slate-200" />

                                            {/* Planning */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Planning</h4>
                                                
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-600"><Flag className="w-4 h-4" /> Priority</div>
                                                    <div className="w-[120px]"><PrioritySelect value={formData.priority || "LOW"} onChange={(v) => handleUpdateTask("priority", v)} disabled={readOnly} /></div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-600"><Layers className="w-4 h-4" /> Epic</div>
                                                    <button 
                                                        onClick={() => !readOnly && setIsEpicModalOpen(true)} 
                                                        className={cn(
                                                            "max-w-[160px] px-2.5 py-1.5 rounded-[3px] text-[11px] font-black uppercase tracking-wider truncate transition-colors border",
                                                            task?.epic ? "bg-white border-slate-200 text-slate-700 hover:border-[#2684FF]" : "bg-slate-100 border-transparent text-slate-400 hover:bg-slate-200",
                                                            readOnly && "cursor-default opacity-80"
                                                        )}
                                                        style={task?.epic ? { borderLeftColor: task.epic.color || "#ccc", borderLeftWidth: "3px" } : {}}
                                                        disabled={isSaving}
                                                    >
                                                        {task?.epic ? task.epic.name : "Add Epic"}
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-600"><Clock className="w-4 h-4" /> Sprint</div>
                                                    <div className="relative w-[140px]">
                                                        <select
                                                            className="w-full text-[13px] font-semibold text-right bg-transparent border-none outline-none text-[#172B4D] hover:text-[#0052CC] cursor-pointer truncate transition-colors hover:bg-[#091E4214] rounded px-2 py-1 appearance-none disabled:cursor-not-allowed"
                                                            value={Number(formData.sprintId) || 0}
                                                            onChange={(e) => handleUpdateTask("sprintId", Number(e.target.value))}
                                                            disabled={isSaving || readOnly}
                                                        >
                                                            <option value={0}>Backlog</option>
                                                            {localSprints.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                        </select>
                                                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1 top-1.5 pointer-events-none" />
                                                    </div>
                                                </div>
                                            </div>

                                            <hr className="border-slate-200" />

                                            {/* Details */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Details</h4>
                                                
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-600"><User className="w-4 h-4" /> Assignee</div>
                                                    <div className="relative group min-w-[140px]">
                                                        <div className={cn("flex items-center justify-end gap-2.5 px-2 py-1.5 rounded transition-all", !readOnly && "cursor-pointer hover:bg-[#091E4214]")}>
                                                            <Avatar className="w-6 h-6 border border-white shadow-sm ring-1 ring-slate-100">
                                                                <AvatarImage src={task.assignee?.avatarUrl || undefined} className="object-cover" />
                                                                <AvatarFallback className="bg-slate-200 text-slate-500 text-[10px] font-black">
                                                                    {task.assignee?.name ? getInitials(task.assignee.name) : "?"}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className={cn("text-[13px] font-semibold truncate max-w-[120px]", !task.assignee?.name ? "text-slate-400 italic" : "text-[#172B4D]")}>
                                                                {task.assignee?.name || "Unassigned"}
                                                            </span>
                                                        </div>
                                                        {!readOnly && (
                                                            <select
                                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                                value={formData.assigneeId ? String(formData.assigneeId) : "0"}
                                                                onChange={(e) => handleUpdateTask("assigneeId", Number(e.target.value))}
                                                                disabled={isSaving || readOnly}
                                                            >
                                                                <option value="0">Unassigned</option>
                                                                {members.map((m) => <option key={m.userId || m.id} value={String(m.userId || m.id)}>{m.fullName || m.name}</option>)}
                                                            </select>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-600"><Zap className="w-4 h-4" /> Reporter</div>
                                                    <span className="text-[13px] font-semibold text-[#172B4D] px-2">{task.createdByName || "Unknown"}</span>
                                                </div>

                                                {/* Labels */}
                                                <div className="space-y-3 relative pt-2" ref={tagPopoverRef}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-600"><TagIcon className="w-4 h-4" /> Labels</div>
                                                        {!readOnly && (
                                                            <button ref={tagButtonRef} onClick={() => setIsTagPopoverOpen(!isTagPopoverOpen)} className="text-slate-400 hover:text-[#0052CC] transition-colors p-1 hover:bg-[#091E4214] rounded-md active:scale-95" title="Add Label" disabled={isSaving}><Plus className="w-4 h-4" /></button>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {task.tags && task.tags.length > 0 ? (
                                                            (task.tags as unknown as Tag[]).map((tag) => (
                                                                <Badge key={tag.id} className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] bg-white border border-slate-200 shadow-sm text-[10px] font-black uppercase tracking-wider text-slate-700 transition-all", !readOnly && "cursor-pointer hover:bg-slate-50 hover:border-slate-300")} onClick={() => !readOnly && setEditingTag(tag)}>
                                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color || "#cbd5e1" }} />
                                                                    {tag.name}
                                                                    {!readOnly && <X className="w-3 h-3 cursor-pointer hover:text-red-500 ml-0.5 transition-colors" onClick={(e) => { e.stopPropagation(); handleRemoveTag(tag.id); }} />}
                                                                </Badge>
                                                            ))
                                                        ) : <span className="text-[12px] text-slate-400 italic px-2">None</span>}
                                                    </div>
                                                    {isTagPopoverOpen && !readOnly && (
                                                        <div className="absolute right-0 top-8 z-20 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-3 animate-in fade-in zoom-in-95 duration-100">
                                                            <Input
                                                                ref={tagInputRef} placeholder="Search or create..." className="h-9 text-[13px] mb-3 focus-visible:ring-[#2684FF]"
                                                                value={tagSearch} onChange={(e) => setTagSearch(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter" && tagSearch.trim()) {
                                                                        const exactMatch = allProjectTags.find((t) => t.name.toLowerCase() === tagSearch.trim().toLowerCase());
                                                                        if (exactMatch) handleAddTag(exactMatch);
                                                                        else handleCreateNewTag();
                                                                    }
                                                                }} disabled={isSaving}
                                                            />
                                                            <div className="text-[10px] text-slate-400 px-2 py-1 uppercase font-black tracking-widest border-b border-slate-100 mb-1">Select label</div>
                                                            <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-0.5 pr-1">
                                                                {filteredTags.length > 0 ? (
                                                                    filteredTags.filter((t) => !(task.tags as unknown as Tag[])?.find((tt) => tt.id === t.id)).map((tag) => (
                                                                        <button key={tag.id} className="w-full text-left px-2.5 py-1.5 text-[12px] font-semibold hover:bg-[#E3F2FD] hover:text-[#0052CC] rounded-md flex items-center gap-2.5 transition-colors" onClick={() => handleAddTag(tag)} disabled={isSaving}>
                                                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tag.color || "#cbd5e1" }} /> {tag.name}
                                                                        </button>
                                                                    ))
                                                                ) : <div className="px-2 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 text-center">No matches</div>}
                                                                {tagSearch.trim() && !allProjectTags.find((t) => t.name.toLowerCase() === tagSearch.trim().toLowerCase()) && (
                                                                    <button className="w-full text-left px-2.5 py-2 text-[12px] font-bold hover:bg-[#E3F2FD] text-[#0052CC] rounded-md flex items-center gap-2 border-t border-slate-100 mt-2 pt-2 transition-colors" onClick={handleCreateNewTag} disabled={isSaving}>
                                                                        <Plus className="w-3.5 h-3.5" /> Create "{tagSearch}"
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <hr className="border-slate-200" />

                                            {/* Time Tracking */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm transition-colors focus-within:border-[#2684FF] focus-within:ring-1 focus-within:ring-blue-100">
                                                    <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">Story Points</label>
                                                    <input type="number" min="0" className="w-full font-bold text-[#172B4D] outline-none text-[14px] bg-transparent disabled:cursor-not-allowed" value={formData.storyPoints || ""} onChange={(e) => setFormData({ ...formData, storyPoints: Number(e.target.value) })} onBlur={(e) => handleUpdateTask("storyPoints", Number(e.target.value))} disabled={isSaving || readOnly} placeholder="0" />
                                                </div>
                                                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm transition-colors focus-within:border-[#2684FF] focus-within:ring-1 focus-within:ring-blue-100">
                                                    <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">Est. Hours</label>
                                                    <div className="flex items-center gap-1.5">
                                                        <input type="number" min="0" className="w-full font-bold text-[#172B4D] outline-none text-[14px] bg-transparent disabled:cursor-not-allowed" value={formData.estimatedHours || ""} onChange={(e) => setFormData({ ...formData, estimatedHours: Number(e.target.value) })} onBlur={(e) => handleUpdateTask("estimatedHours", Number(e.target.value))} disabled={isSaving || readOnly} placeholder="0" />
                                                        <span className="text-[11px] font-black uppercase text-slate-400">h</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <hr className="border-slate-200" />

                                            {/* Timeline */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">Timeline</h4>
                                                <div className="space-y-4">
                                                    <div className="space-y-1.5">
                                                        <div className="flex justify-between text-[11px] text-slate-500 font-bold uppercase tracking-widest px-1"><span>Start Date</span></div>
                                                        <input type="datetime-local" className="w-full text-[13px] font-medium p-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-[#2684FF] focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed" value={toInputDate(formData.startDate)} onChange={(e) => handleUpdateTask("startDate", e.target.value)} disabled={isSaving || readOnly} />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <div className="flex justify-between items-center text-[11px] text-slate-500 font-bold uppercase tracking-widest px-1">
                                                            <span>Due Date</span>
                                                            {task.dueDate && new Date(task.dueDate) < new Date() && <span className="text-[#E54937] px-1.5 py-0.5 bg-red-50 rounded text-[9px]">Overdue</span>}
                                                        </div>
                                                        <input type="datetime-local" className="w-full text-[13px] font-medium p-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-[#2684FF] focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed" value={toInputDate(formData.dueDate)} onChange={(e) => handleUpdateTask("dueDate", e.target.value)} disabled={isSaving || readOnly} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Meta */}
                                            <div className="mt-auto pt-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest space-y-1 px-1">
                                                {task.createdAt && <p>Created: {new Date(task.createdAt).toLocaleString("en-US", { dateStyle: 'medium', timeStyle: 'short' })}</p>}
                                                <p className="mt-1">Updated: Just now</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {/* Resize Handle */}
                        <div
                            className="resize-handle absolute bottom-0 right-0 w-6 h-6 cursor-se-resize z-[60] group"
                            onMouseDown={(e) => { e.stopPropagation(); setIsResizing(true); }}
                        >
                            <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 bg-slate-300 rounded-sm group-hover:bg-[#0052CC] transition-colors" />
                        </div>
                    </>
                )}
            </div>

            {/* Modals Phụ trợ */}
            <TagModal 
                isOpen={!!editingTag} onClose={() => setEditingTag(null)} tag={editingTag} 
                companyId={companyId} workspaceId={workspaceId} projectId={projectId} 
                onUpdate={(updatedTag) => { 
                    setAllProjectTags((prev) => prev.map((t) => (t.id === updatedTag.id ? updatedTag : t))); 
                    setTask((prev) => prev ? { ...prev, tags: prev.tags?.map((t) => t.id === updatedTag.id ? updatedTag : t) as any } : null); 
                }} 
                onDelete={(deletedTagId) => { 
                    setAllProjectTags((prev) => prev.filter((t) => t.id !== deletedTagId)); 
                    setTask((prev) => prev ? { ...prev, tags: prev.tags?.filter((t) => t.id !== deletedTagId) as any } : null); 
                }} 
            />
            <EpicModal isOpen={isEpicModalOpen} onClose={() => setIsEpicModalOpen(false)} projectId={projectId} currentEpicId={formData.epicId || null} onSelectEpic={handleSelectEpic} />
            <ConfirmationModal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} onConfirm={handleConfirmDeleteSubtask} isLoading={isDeletingSubtask} title="Delete Subtask" description="Are you sure you want to delete this subtask? This action cannot be undone." confirmText="Delete" modalVariant="danger" />
            <ConfirmationModal isOpen={isArchiveConfirmOpen} onClose={() => setIsArchiveConfirmOpen(false)} onConfirm={handleArchiveConfirm} isLoading={isSaving} title="Archive Issue" description="This issue will be moved to the archive. You can restore it later if needed." confirmText="Archive" cancelText="Cancel" modalVariant="warning" />
        </>
    );
}