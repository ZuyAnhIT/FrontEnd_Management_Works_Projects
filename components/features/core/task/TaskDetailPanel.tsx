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

// Internal Components
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
import { getTaskDetails, updateTask, updateTaskEpic, archiveTask, TaskDetail, UpdateTaskData } from "@/services/apiTask";
import { getSubtaskList, createSubtask, updateSubtask, deleteSubtask, Subtask } from "@/services/apiSubTask";
import * as apiTag from "@/services/apiTag";
import { Tag } from "@/services/apiTag";
import { getSprints, Sprint } from "@/services/apiSprint";

// Utils
import { cn } from "@/lib/utils";

// =============================================================================
// 2. CONSTANTS & HELPERS
// =============================================================================

/**
 * Mở rộng giao diện Task Detail để hỗ trợ mảng tags tĩnh
 */
interface ExtendedTaskDetail extends TaskDetail {
    tags?: Tag[];
}

/**
 * Mở rộng Subtask để hỗ trợ các thuộc tính UI cục bộ
 */
interface ExtendedSubtask extends Subtask {
    priority?: string;
}

interface TaskDetailPanelProps {
    taskId: number | null;
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

/**
 * Lấy chữ cái đầu của tên để làm Avatar Fallback
 */
const getInitials = (name?: string) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "UN";

/**
 * Format chuỗi ISO sang định dạng tương thích với thẻ input datetime-local
 */
const toInputDate = (iso?: string | null) =>
    iso ? new Date(iso).toISOString().slice(0, 16) : "";

// --- SUB-COMPONENT: CHỌN ĐỘ ƯU TIÊN ---
const PrioritySelect = ({ value, onChange, disabled = false }: {
    value: string;
    onChange: (val: string) => void;
    disabled?: boolean;
}) => {
    const config: Record<string, { class: string; icon: any }> = {
        URGENT: { class: "text-red-700 bg-red-50 border-red-200", icon: <Flag className="w-3 h-3 fill-red-700 text-red-700" /> },
        HIGH: { class: "text-orange-700 bg-orange-50 border-orange-200", icon: <Flag className="w-3 h-3 fill-orange-700 text-orange-700" /> },
        MEDIUM: { class: "text-[#0052CC] bg-blue-50 border-blue-200", icon: <Flag className="w-3 h-3 fill-[#0052CC] text-[#0052CC]" /> },
        LOW: { class: "text-slate-600 bg-slate-100 border-slate-200", icon: <Flag className="w-3 h-3 text-slate-500" /> },
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
// 3. MAIN COMPONENT
// =============================================================================

export default function TaskDetailPanel({
    taskId, onClose, onUpdate, onSwitchToFloating,
    members = [], sprints = [], statuses = [],
    companyId, workspaceId, projectId, readOnly = false
}: TaskDetailPanelProps) {
    
    // ---------------------------------------------------------------------------
    // 4. HOOKS & REFS
    // ---------------------------------------------------------------------------
    
    const { showToast } = useToast();

    const tagButtonRef = useRef<HTMLButtonElement>(null);
    const tagPopoverRef = useRef<HTMLDivElement>(null);
    const tagInputRef = useRef<HTMLInputElement>(null);

    // ---------------------------------------------------------------------------
    // 5. STATE
    // ---------------------------------------------------------------------------
    
    // Dữ liệu chính
    const [task, setTask] = useState<ExtendedTaskDetail | null>(null);
    const [formData, setFormData] = useState<UpdateTaskData>({});
    const [subtasks, setSubtasks] = useState<ExtendedSubtask[]>([]);
    const [allProjectTags, setAllProjectTags] = useState<Tag[]>([]);
    const [localSprints, setLocalSprints] = useState<any[]>(sprints);

    // Trạng thái Loading
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Trạng thái UI
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [selectedSubtaskId, setSelectedSubtaskId] = useState<number | null>(null);
    const [isAddingSubtask, setIsAddingSubtask] = useState(false);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
    
    // Tags
    const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
    const [tagSearch, setTagSearch] = useState("");
    const [editingTag, setEditingTag] = useState<Tag | null>(null);

    // Modals
    const [isEpicModalOpen, setIsEpicModalOpen] = useState(false);
    const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
    const [subtaskToDelete, setSubtaskToDelete] = useState<number | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isDeletingSubtask, setIsDeletingSubtask] = useState(false);

    // ---------------------------------------------------------------------------
    // 6. EFFECTS
    // ---------------------------------------------------------------------------

    // Đóng Popover khi click ra ngoài
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            if (tagPopoverRef.current && !tagPopoverRef.current.contains(target) && !tagButtonRef.current?.contains(target)) {
                setIsTagPopoverOpen(false);
                setTagSearch("");
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus input tag khi mở Popover
    useEffect(() => {
        if (isTagPopoverOpen && tagInputRef.current) {
            setTimeout(() => tagInputRef.current?.focus(), 50);
        }
    }, [isTagPopoverOpen]);

    // Fetch toàn bộ dữ liệu ban đầu
    useEffect(() => {
        if (taskId) {
            setIsLoading(true);

            getTaskDetails(taskId)
                .then((data) => {
                    const safeAssigneeId = data.assignee?.id ?? data.assigneeId ?? null;
                    const safeStatusId = data.status?.id ?? data.statusId;
                    const safeSprintId = data.sprint?.id ?? data.sprintId ?? null;
                    const safeEpicId = data.epic?.id ?? data.epicId ?? null;
                    const statusObj = statuses.find((s) => s.id === safeStatusId);

                    setTask({
                        ...data,
                        assigneeId: safeAssigneeId,
                        sprintId: safeSprintId,
                        epicId: safeEpicId,
                        statusId: safeStatusId,
                        assigneeName: data.assignee?.name || data.assigneeName,
                        assigneeAvatar: data.assignee?.avatarUrl || data.assigneeAvatar,
                        statusName: statusObj?.name || data.statusName,
                        statusColor: statusObj?.color || data.statusColor,
                    } as ExtendedTaskDetail);

                    setFormData({
                        title: data.title,
                        description: data.description || "",
                        taskType: data.taskType,
                        priority: data.priority,
                        statusId: safeStatusId,
                        sprintId: safeSprintId,
                        epicId: safeEpicId,
                        assigneeId: safeAssigneeId,
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

            apiTag.getTags(companyId, workspaceId, projectId)
                .then((tags: Tag[]) => setAllProjectTags(tags))
                .catch(() => {});

            getSprints(projectId)
                .then((data) => setLocalSprints(data))
                .catch(() => {});
        }
    }, [taskId, companyId, workspaceId, projectId, statuses, showToast]);

    // ---------------------------------------------------------------------------
    // 7. HANDLERS (Business Logic)
    // ---------------------------------------------------------------------------

    const fetchSubtasks = async (id: number) => {
        try {
            const data = await getSubtaskList(companyId, workspaceId, projectId, id);
            setSubtasks(Array.isArray(data) ? (data as ExtendedSubtask[]) : []);
        } catch (error) {}
    };

    /**
     * Cập nhật thông tin Task chính (Auto-save)
     */
    const handleUpdateTask = async (field: keyof UpdateTaskData, value: any) => {
        if (!task || !taskId || readOnly) return;

        setFormData((prev) => ({ ...prev, [field]: value }));

        // Optimistic UI Assignee
        if (field === "assigneeId") {
            const userId = Number(value);
            const user = members.find((m) => (m.userId || m.id) === userId);
            setTask((prev) => prev ? {
                ...prev,
                assigneeId: userId === 0 ? null : userId,
                assigneeName: userId === 0 ? "Unassigned" : user?.fullName || user?.name,
                assigneeAvatar: userId === 0 ? null : user?.avatarUrl || user?.avatar,
            } : null);
        }

        // Optimistic UI Status
        if (field === "statusId") {
            const newStatusId = Number(value);
            const statusObj = statuses.find((s) => s.id === newStatusId);
            if (statusObj) {
                setTask((prev) => prev ? { ...prev, statusId: newStatusId, statusName: statusObj.name, statusColor: statusObj.color } : null);
            }
        }

        // Chuẩn bị Payload an toàn
        let payloadValue = value;
        if (field === "startDate" || field === "dueDate") payloadValue = value ? new Date(value).toISOString() : undefined;
        if (field === "storyPoints" || field === "estimatedHours") payloadValue = Number(value);
        if (["sprintId", "epicId", "assigneeId"].includes(field as string) && (value === 0 || value === "0" || value === null)) {
            payloadValue = undefined;
        }
        if (field === "statusId") payloadValue = Number(value);

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
     * Cập nhật mô tả (Description)
     */
    const handleSaveDescription = async () => {
        if (!taskId || readOnly) return;
        await handleUpdateTask("description", formData.description);
        setIsEditingDescription(false);
    };

    const handleCancelDescription = () => {
        setFormData((prev) => ({ ...prev, description: task?.description || "" }));
        setIsEditingDescription(false);
    };

    /**
     * Archive Task
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
     * Xử lý Tag
     */
    const filteredTags = useMemo(() => {
        if (!tagSearch.trim()) return allProjectTags;
        return allProjectTags.filter((t) => t.name.toLowerCase().includes(tagSearch.toLowerCase()));
    }, [allProjectTags, tagSearch]);

    const handleAddTag = async (tag: Tag) => {
        if (!taskId || !task || readOnly) return;
        const currentTags = task?.tags || [];
        if (currentTags.some((t) => t.id === tag.id)) return;

        setTask((prev) => (prev ? { ...prev, tags: [...currentTags, tag] } : null));
        setIsTagPopoverOpen(false);
        setTagSearch("");

        try {
            await apiTag.assignTagToTask(companyId, workspaceId, projectId, taskId, tag.id);
        } catch (error: any) {
            setTask((prev) => (prev ? { ...prev, tags: currentTags } : null));
            showToast(error.response?.data?.message || "Failed to assign label.", "error");
        }
    };

    const handleCreateNewTag = async () => {
        if (!taskId || !tagSearch.trim() || readOnly) return;
        try {
            const newTag = await apiTag.createTag(companyId, workspaceId, projectId, { name: tagSearch.trim(), color: "#95a5a6" });
            setAllProjectTags((prev) => [...prev, newTag]);
            handleAddTag(newTag);
        } catch (error: any) {
            showToast(error.response?.data?.message || "Failed to create new label.", "error");
        }
    };

    const handleRemoveTag = async (tagId: number) => {
        if (!taskId || !task || readOnly) return;
        const currentTags = task?.tags || [];
        setTask((prev) => (prev ? { ...prev, tags: currentTags.filter((t) => t.id !== tagId) } : null));

        try {
            await apiTag.removeTagFromTask(companyId, workspaceId, projectId, taskId, tagId);
        } catch (error: any) {
            setTask((prev) => (prev ? { ...prev, tags: currentTags } : null));
            showToast(error.response?.data?.message || "Failed to remove label.", "error");
        }
    };

    /**
     * Xử lý Epic
     */
    const handleEpicChange = async (selectedEpic: any | null) => {
        if (readOnly || !taskId) return;
        const newEpicId = selectedEpic ? selectedEpic.id : null;
        
        setTask((prev) => prev ? { ...prev, epicId: newEpicId, epic: selectedEpic ? { id: selectedEpic.id, name: selectedEpic.name, color: selectedEpic.color } : null } : null);
        setFormData((prev) => ({ ...prev, epicId: newEpicId }));

        try {
            setIsSaving(true);
            await updateTaskEpic(taskId, newEpicId);
            if (onUpdate) onUpdate();
        } catch (error: any) {
            showToast(error.response?.data?.message || "Failed to update Epic.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * Xử lý Subtask
     */
    const handleCreateSubtaskAction = async () => {
        if (!newSubtaskTitle.trim() || !taskId || readOnly) return;
        try {
            await createSubtask(companyId, workspaceId, projectId, taskId, { title: newSubtaskTitle.trim() });
            setNewSubtaskTitle("");
            setIsAddingSubtask(false);
            fetchSubtasks(taskId);
            showToast("Subtask created", "success");
        } catch (error: any) {
            showToast(error.response?.data?.message || "Failed to create subtask.", "error");
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
        const previousSubtasks = [...subtasks];
        setSubtasks((prev) => prev.filter((s) => s.id !== subtaskToDelete));

        try {
            await deleteSubtask(companyId, workspaceId, projectId, taskId, subtaskToDelete);
            showToast("Subtask deleted", "success");
            setIsDeleteConfirmOpen(false);
        } catch (error: any) {
            setSubtasks(previousSubtasks);
            showToast(error.response?.data?.message || "Failed to delete subtask.", "error");
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
                    if (data.assigneeId === 0 || data.assigneeId === null) return { ...s, ...data, assigneeId: null, assigneeName: "Unassigned", assigneeAvatar: null };
                    const member = members.find((m) => (m.userId || m.id) === Number(data.assigneeId));
                    return { ...s, ...data, assigneeId: Number(data.assigneeId), assigneeName: member?.fullName || member?.name, assigneeAvatar: member?.avatarUrl || member?.avatar };
                }
                return { ...s, ...data };
            }
            return s;
        }));

        try {
            await updateSubtask(companyId, workspaceId, projectId, taskId, subTaskId, data);
        } catch (error: any) {
            showToast(error.response?.data?.message || "Subtask update failed.", "error");
            fetchSubtasks(taskId);
        }
    };

    // ---------------------------------------------------------------------------
    // 8. RENDER LOGIC
    // ---------------------------------------------------------------------------

    if (!taskId) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-[1px]" onClick={onClose}>
            {/* Vùng panel trượt từ phải */}
            <div
                className="w-full md:w-[850px] bg-white h-full shadow-[0_0_40px_rgba(0,0,0,0.15)] flex flex-col animate-in slide-in-from-right duration-300 ease-out border-l border-slate-200"
                onClick={(e) => e.stopPropagation()}
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
                        {/* ================= HEADER ================= */}
                        <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-white shrink-0">
                            <div className="flex items-center gap-4">
                                {/* Epic Badge */}
                                {task && (
                                    <div
                                        className={cn(
                                            "flex items-center gap-2 px-2.5 py-1.5 rounded-[3px] border transition-colors",
                                            task.epic && !readOnly ? "bg-white border-slate-200 text-[#172B4D] hover:border-[#2684FF] cursor-pointer" : "bg-slate-100 border-transparent text-slate-400 hover:bg-slate-200 cursor-pointer",
                                            readOnly && "cursor-default opacity-80"
                                        )}
                                        onClick={() => !readOnly && setIsEpicModalOpen(true)}
                                    >
                                        {task.epic ? (
                                            <>
                                                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: task.epic.color || "#0052CC" }} />
                                                <span className="text-[11px] font-black uppercase tracking-widest truncate max-w-[120px]" style={{ color: task.epic.color || "#0052CC" }}>
                                                    {task.epic.name}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                                <Plus className="w-3.5 h-3.5" /> Add Epic
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div className="h-5 w-px bg-slate-200" />
                                
                                {/* Task Code */}
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-[#E3F2FD] rounded text-[#0052CC]">
                                        <CheckSquare className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="font-black text-slate-500 text-[13px] tracking-tight hover:text-[#0052CC] hover:underline cursor-pointer transition-colors uppercase">
                                        {task?.taskCode || `TASK-${taskId}`}
                                    </span>
                                </div>

                                {isSaving && (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0052CC] flex items-center gap-1.5 bg-blue-50 px-2 py-0.5 rounded animate-pulse ml-2">
                                        <Loader2 className="w-3 h-3 animate-spin" /> Syncing
                                    </span>
                                )}
                            </div>

                            {/* Actions Header */}
                            <div className="flex items-center gap-1.5">
                                {!readOnly && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors active:scale-95" onClick={() => setIsArchiveConfirmOpen(true)} disabled={isSaving}>
                                                    <Archive className="w-4 h-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent><p className="text-[11px] font-bold">Archive Task</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                                <div className="w-px h-4 bg-slate-200 mx-1" />
                                {onSwitchToFloating && (
                                    <Button variant="ghost" size="icon" onClick={onSwitchToFloating} className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-[#091E4214] active:scale-95" title="Open in Window">
                                        <Maximize2 className="w-4 h-4" />
                                    </Button>
                                )}
                                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 active:scale-95" title="Close Panel">
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* ================= BODY ================= */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                            {isLoading ? (
                                <div className="h-full flex flex-col items-center justify-center gap-3 opacity-60">
                                    <Loader2 className="w-8 h-8 text-[#0052CC] animate-spin" />
                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Loading issue...</span>
                                </div>
                            ) : task ? (
                                <div className="flex flex-col min-h-full">
                                    <div className="grid grid-cols-1 md:grid-cols-[1.8fr_1.2fr] flex-1">
                                        
                                        {/* --- LEFT COLUMN (Nội dung chính) --- */}
                                        <div className="p-8 border-r border-slate-100 flex flex-col">
                                            <Input
                                                className={cn(
                                                    "w-full text-[24px] font-black text-[#172B4D] bg-transparent border-2 border-transparent outline-none h-auto py-1 px-2 -ml-2 mb-6 transition-all shadow-none focus-visible:ring-0 leading-tight",
                                                    readOnly ? "cursor-not-allowed" : "hover:bg-slate-50 focus:bg-white focus:border-[#2684FF] placeholder:text-slate-300"
                                                )}
                                                value={formData.title || ""}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                onBlur={(e) => handleUpdateTask("title", e.target.value)}
                                                placeholder="Issue summary"
                                                disabled={isSaving || readOnly}
                                            />

                                            <div className="flex gap-2.5 mb-8">
                                                <Button variant="outline" className="h-8 bg-white border-slate-200 text-[#42526E] hover:bg-slate-50 hover:text-[#172B4D] text-[11px] font-bold uppercase tracking-widest active:scale-95">
                                                    <LinkIcon className="w-3.5 h-3.5 mr-2" /> Attach
                                                </Button>
                                                {!readOnly && (
                                                    <Button variant="outline" className="h-8 bg-white border-slate-200 text-[#42526E] hover:bg-slate-50 hover:text-[#172B4D] text-[11px] font-bold uppercase tracking-widest active:scale-95" onClick={() => setIsAddingSubtask(true)} disabled={isSaving}>
                                                        <Plus className="w-3.5 h-3.5 mr-2" /> Add Subtask
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Description */}
                                            <div className="space-y-3 group mb-10">
                                                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Description</h3>
                                                {isEditingDescription && !readOnly ? (
                                                    <div className="space-y-3 animate-in fade-in duration-200">
                                                        <Textarea
                                                            className="min-h-[160px] border-[#2684FF] focus-visible:ring-2 focus-visible:ring-blue-100 resize-y text-[14px] leading-relaxed p-4 rounded-xl shadow-sm bg-white"
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
                                                        onKeyDown={(e) => e.key === "Enter" && handleCreateSubtaskAction()}
                                                        autoFocus placeholder="What needs to be done?" disabled={isSaving}
                                                    />
                                                    <Button size="sm" onClick={handleCreateSubtaskAction} className="h-9 bg-[#0052CC] hover:bg-[#0047B3] text-[11px] font-bold uppercase tracking-widest active:scale-95" disabled={isSaving || !newSubtaskTitle.trim()}>Add</Button>
                                                    <Button size="sm" variant="ghost" onClick={() => setIsAddingSubtask(false)} className="h-9 text-[11px] font-bold uppercase tracking-widest text-slate-500" disabled={isSaving}>Cancel</Button>
                                                </div>
                                            )}

                                            <div className="mt-8">
                                                <TaskComment taskId={taskId} />
                                            </div>
                                        </div>

                                        {/* --- RIGHT COLUMN (Metadata) --- */}
                                        <div className="bg-[#F4F5F7] p-6 space-y-8 flex flex-col">
                                            {/* Status */}
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Status</label>
                                                <div className="relative">
                                                    <select
                                                        className={cn(
                                                            "w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-[12px] font-black uppercase tracking-wider shadow-sm cursor-pointer outline-none appearance-none transition-all",
                                                            "hover:border-slate-300 focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF]",
                                                            "disabled:cursor-not-allowed disabled:opacity-70"
                                                        )}
                                                        value={formData.statusId || ""}
                                                        onChange={(e) => handleUpdateTask("statusId", Number(e.target.value))}
                                                        style={{ borderLeft: `4px solid ${task.statusColor || "#ddd"}` }}
                                                        disabled={isSaving || readOnly}
                                                    >
                                                        {statuses.length > 0 ? statuses.map((st) => <option key={st.id} value={st.id}>{st.name}</option>) : <option value={task.statusId || 0}>{task.statusName}</option>}
                                                    </select>
                                                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                                                </div>
                                            </div>

                                            <hr className="border-slate-200" />

                                            {/* People */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">People</h4>
                                                
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-600"><User className="w-4 h-4" /> Assignee</div>
                                                    <div className="relative group min-w-[150px]">
                                                        <div className={cn("flex items-center justify-end gap-2.5 px-2 py-1.5 rounded-lg transition-all", !readOnly && "cursor-pointer hover:bg-[#091E4214]")}>
                                                            <Avatar className="w-7 h-7 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                                                <AvatarImage src={task.assigneeAvatar || undefined} className="object-cover" />
                                                                <AvatarFallback className={cn("text-[10px] font-black", task.assigneeId ? "bg-[#0052CC] text-white" : "bg-slate-200 text-slate-500")}>
                                                                    {task.assigneeName ? getInitials(task.assigneeName) : "?"}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className={cn("text-[13px] font-semibold truncate max-w-[100px]", !task.assigneeName ? "text-slate-400 italic" : "text-[#172B4D]")}>
                                                                {task.assigneeName || "Unassigned"}
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

                                                <div className="flex items-center justify-between text-slate-500">
                                                    <div className="flex items-center gap-2 text-[13px] font-semibold"><Zap className="w-4 h-4" /> Reporter</div>
                                                    <span className="text-[13px] font-semibold text-[#172B4D] px-2">{task.createdByName || "Unknown"}</span>
                                                </div>
                                            </div>

                                            <hr className="border-slate-200" />

                                            {/* Labels (Tags) */}
                                            <div className="space-y-3 relative" ref={tagPopoverRef}>
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
                                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color || "#ccc" }} />
                                                                {tag.name}
                                                                {!readOnly && <X className="w-3 h-3 cursor-pointer hover:text-red-500 ml-0.5 transition-colors" onClick={(e) => { e.stopPropagation(); handleRemoveTag(tag.id); }} />}
                                                            </Badge>
                                                        ))
                                                    ) : <span className="text-[12px] text-slate-400 italic px-2">None</span>}
                                                </div>

                                                {/* Label Dropdown */}
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

                                            <hr className="border-slate-200" />

                                            {/* Planning (Priority / Sprint) */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Planning</h4>
                                                
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-600"><Flag className="w-4 h-4" /> Priority</div>
                                                    <div className="w-[120px]">
                                                        <PrioritySelect value={formData.priority || "LOW"} onChange={(v) => handleUpdateTask("priority", v)} disabled={readOnly} />
                                                    </div>
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

                                            {/* Time Tracking (Points & Hours) */}
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

                                            {/* Timeline (Dates) */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Timeline</h4>
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

                                            {/* Meta Timestamps */}
                                            <div className="mt-auto pt-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest space-y-1 px-1">
                                                {task.createdAt && <p>Created: {new Date(task.createdAt).toLocaleString("en-US", { dateStyle: 'medium', timeStyle: 'short' })}</p>}
                                                <p className="mt-1">Updated: Just now</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </>
                )}
            </div>

            {/* ================= MODALS & CONFIRMATIONS ================= */}
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
            <EpicModal isOpen={isEpicModalOpen} onClose={() => setIsEpicModalOpen(false)} projectId={projectId} currentEpicId={formData.epicId || null} onSelectEpic={handleEpicChange} />
            <ConfirmationModal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} onConfirm={handleConfirmDeleteSubtask} isLoading={isDeletingSubtask} title="Delete Subtask" description="Are you sure you want to delete this subtask? This action cannot be undone." confirmText="Delete" modalVariant="danger" />
            <ConfirmationModal isOpen={isArchiveConfirmOpen} onClose={() => setIsArchiveConfirmOpen(false)} onConfirm={handleArchiveConfirm} isLoading={isSaving} title="Archive Issue" description="This issue will be moved to the archive. You can restore it from project settings later." confirmText="Archive" cancelText="Cancel" modalVariant="warning" />
        </div>
    );
}