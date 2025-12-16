"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    X,
    Lock,
    Eye,
    Share2,
    MoreHorizontal,
    Maximize2,
    Link as LinkIcon,
    CheckSquare,
    ChevronDown,
    Plus,
    Loader2,
    Tag as TagIcon,
    Flag,
    User,
    Clock,
    Layers,
    Zap,
    Check,
    Trash2,
    Minimize2,
    Archive,
} from "lucide-react";
import { Button } from "@/components/ui/Buttons";
import { Input } from "@/components/ui/Inputs";
import { Textarea } from "@/components/ui/TextAreas";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatars";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/Tooltips";

import SubtaskDetailView from "./SubtaskDetailView";
// API Services & Types
import {
    getTaskDetails,
    updateTask,
    updateTaskEpic,
    TaskDetail,
    UpdateTaskData,
    archiveTask,
} from "@/services/apiTask";
import {
    getSubtaskList,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    Subtask,
} from "@/services/apiSubTask";
import { apiTag, Tag } from "@/services/apiTag";
import { useToast } from "@/components/ui/ToastProvider";
import { getSprints, Sprint } from "@/services/apiSprint";

// Components Con
import TaskComment from "@/components/features/core/task/TaskComment";
import TaskSubtasks from "@/components/features/core/task/SubTasks";

// Import Modals
import EpicModal from "@/components/features/core/epic/EpicModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import TagModal from "@/components/features/core/tag/TagModal";

// =============================================================================
// 1. HELPERS & SUB-COMPONENTS
// =============================================================================

// Helper: LẤY CHỮ CÁI ĐẦU TÊN
const getInitials = (name?: string) =>
    name
        ? name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "UN";

// --- HELPER COMPONENT: PRIORITY SELECT ---
const PrioritySelect = ({
    value,
    onChange,
    disabled = false
}: {
    value: string;
    onChange: (val: string) => void;
    disabled?: boolean;
}) => {
    const colors: Record<string, string> = {
        URGENT: "text-red-700 bg-red-50 hover:bg-red-100 border-red-200",
        HIGH: "text-orange-700 bg-orange-50 hover:bg-orange-100 border-orange-200",
        MEDIUM: "text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200",
        LOW: "text-slate-600 bg-slate-100 hover:bg-slate-200 border-slate-200",
    };
    const icons: Record<string, any> = {
        URGENT: <Flag className="w-3 h-3 fill-red-700 text-red-700" />,
        HIGH: <Flag className="w-3 h-3 fill-orange-700 text-orange-700" />,
        MEDIUM: <Flag className="w-3 h-3 fill-blue-700 text-blue-700" />,
        LOW: <Flag className="w-3 h-3 text-slate-500" />,
    };

    return (
        <div className="relative group w-full">
            <div
                className={`flex items-center gap-2 px-2 py-1.5 rounded border transition-colors cursor-pointer ${
                    colors[value] || colors.LOW
                } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {icons[value] || icons.LOW}
                <span className="text-xs font-bold uppercase flex-1">{value}</span>
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

// Helper: Convert ISO Date to datetime-local input format
const toInputDate = (iso?: string | null) =>
    iso ? new Date(iso).toISOString().slice(0, 16) : "";

// =============================================================================
// 2. MAIN COMPONENT
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
    taskId,
    isOpen,
    onClose,
    onUpdate,
    onSwitchToPanel,
    members = [],
    sprints = [],
    statuses = [],
    companyId,
    workspaceId,
    projectId,
    readOnly = false
}: TaskDetailModalProps) {
    const { showToast } = useToast();
    const [task, setTask] = useState<TaskDetail | null>(null);
    const [formData, setFormData] = useState<UpdateTaskData>({});

    // Loading States
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Subtask State
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [isAddingSubtask, setIsAddingSubtask] = useState(false);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

    // Description State
    const [isEditingDescription, setIsEditingDescription] = useState(false);

    const [selectedSubtaskId, setSelectedSubtaskId] = useState<number | null>(
        null
    );
    // Tags State
    const [allProjectTags, setAllProjectTags] = useState<Tag[]>([]);
    const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
    const [tagSearch, setTagSearch] = useState("");
    const [editingTag, setEditingTag] = useState<Tag | null>(null);
    // Sprint State
    const [localSprints, setLocalSprints] = useState<any[]>(sprints);

    // POPOVER & MODAL STATES
    const [isSprintPopoverOpen, setIsSprintPopoverOpen] = useState(false);
    const [isEpicModalOpen, setIsEpicModalOpen] = useState(false);
    const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);

    // CONFIRM MODAL STATE (For Delete Subtask)
    const [subtaskToDelete, setSubtaskToDelete] = useState<number | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isDeletingSubtask, setIsDeletingSubtask] = useState(false);

    // Refs for click outside
    const tagButtonRef = useRef<HTMLButtonElement>(null);
    const tagPopoverRef = useRef<HTMLDivElement>(null);
    const tagInputRef = useRef<HTMLInputElement>(null);
    const sprintButtonRef = useRef<HTMLButtonElement>(null);
    const sprintPopoverRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // Floating Window State
    const [position, setPosition] = useState({ x: 100, y: 50 });
    const [size, setSize] = useState({ width: 1100, height: 750 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // Click Outside Handler
    useEffect(() => {
        function handleClickOutside(event: any) {
            if (
                tagPopoverRef.current &&
                !tagPopoverRef.current.contains(event.target) &&
                !tagButtonRef.current?.contains(event.target)
            ) {
                setIsTagPopoverOpen(false);
                setTagSearch("");
            }
            if (
                sprintPopoverRef.current &&
                !sprintPopoverRef.current.contains(event.target) &&
                !sprintButtonRef.current?.contains(event.target)
            ) {
                setIsSprintPopoverOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isTagPopoverOpen && tagInputRef.current) {
            setTimeout(() => tagInputRef.current?.focus(), 50);
        }
    }, [isTagPopoverOpen]);

    // Drag Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest(".resize-handle")) return;
        if (!(e.target as HTMLElement).closest(".modal-header")) return;
        setIsDragging(true);
        setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging)
                setPosition({
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y,
                });
            if (isResizing)
                setSize({
                    width: Math.max(800, e.clientX - position.x),
                    height: Math.max(500, e.clientY - position.y),
                });
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

    // --- 1. LOAD DATA ---
    useEffect(() => {
        if (isOpen && taskId) {
            setLoading(true);

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
                    const message = err.message || err.response?.data?.message || "Failed to load task details";
                    showToast(message, "error");
                })
                .finally(() => setLoading(false));

            fetchSubtasks(taskId);

            apiTag
                .getTags(companyId, workspaceId, projectId)
                .then((tags) => setAllProjectTags(tags))
                .catch(() => console.error("Failed to load tags"));

            getSprints(projectId)
                .then((data) => setLocalSprints(data))
                .catch((err) => console.error("Failed to load sprints", err));
        }
    }, [isOpen, taskId, companyId, workspaceId, projectId]);

    const fetchSubtasks = async (id: number) => {
        try {
            const data = await getSubtaskList(companyId, workspaceId, projectId, id);
            setSubtasks(Array.isArray(data) ? data : []);
        } catch (error) {
            // Silent fail
        }
    };

    // --- 2. HANDLERS ---

    // Main Task Update
    const handleUpdate = async (field: keyof UpdateTaskData, value: any) => {
        if (!task || !taskId || readOnly) return; 
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Optimistic UI: Assignee
        if (field === "assigneeId") {
            const userId = Number(value);
            if (userId === 0) {
                setTask({ ...task, assignee: null });
            } else {
                const user = members.find((m) => (m.userId || m.id) === userId);
                if (user) {
                    setTask({
                        ...task,
                        assignee: {
                            id: userId,
                            name: user.fullName || user.name,
                            avatarUrl: user.avatarUrl || user.avatar,
                        },
                    });
                }
            }
        }

        // Optimistic UI: Status
        if (field === "statusId") {
            const newStatusId = Number(value);
            const statusObj = statuses.find((s) => s.id === newStatusId);
            if (statusObj) {
                setTask({
                    ...task,
                    status: {
                        id: newStatusId,
                        name: statusObj.name,
                        color: statusObj.color,
                        isCompleted: statusObj.isCompleted || false,
                    },
                });
            }
        }

        let payloadValue = value;
        if (field === "startDate" || field === "dueDate")
            payloadValue = value ? new Date(value).toISOString() : null;
        if (field === "storyPoints" || field === "estimatedHours")
            payloadValue = Number(value);

        if (["sprintId", "epicId", "assigneeId"].includes(field) && (value === 0 || value === "0" || value === null)) {
            payloadValue = null;
        }
        if (field === "statusId") payloadValue = Number(value);

        try {
            setIsSaving(true);
            await updateTask(taskId, { [field]: payloadValue });
            if (onUpdate) onUpdate();
            showToast("Updated successfully", "success");
        } catch (error: any) {
            const message = error.message || error.response?.data?.message || "Update failed";
            showToast(message, "error");
        } finally {
            setIsSaving(false);
        }
    };

    // --- ARCHIVE HANDLER ---
    const onClickArchive = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (readOnly) return; 
        setIsArchiveConfirmOpen(true);
    };
    const onConfirmArchive = async () => {
        if (!taskId || readOnly) return; 

        try {
            setIsSaving(true);
            await archiveTask(taskId);
            showToast("Task archived successfully", "success");
            onClose();
            if (onUpdate) onUpdate();
        } catch (error: any) {
            const message = error.message || error.response?.data?.message || "Failed to archive task";
            showToast(message, "error");
        } finally {
            setIsSaving(false);
        }
    };

    // --- EPIC HANDLERS ---
    const handleSelectEpic = async (epic: any | null) => {
        if (readOnly) return; 
        setTask((prev) =>
            prev ? {
                ...prev,
                epic: epic ? { id: epic.id, name: epic.name, color: epic.color } : null,
            } : null
        );

        setFormData((prev) => ({ ...prev, epicId: epic ? epic.id : null }));
        await handleUpdate("epicId", epic ? epic.id : null);
    };

    // --- SPRINT HANDLERS ---
    const handleSelectSprint = async (sprintId: number) => {
        if (readOnly) return; 
        setFormData((prev) => ({ ...prev, sprintId: sprintId }));
        setIsSprintPopoverOpen(false);
        await handleUpdate("sprintId", sprintId);
    };

    // --- TAGS HANDLERS ---
    const filteredTags = useMemo(() => {
        if (!tagSearch.trim()) return allProjectTags;
        return allProjectTags.filter((t) =>
            t.name.toLowerCase().includes(tagSearch.toLowerCase())
        );
    }, [allProjectTags, tagSearch]);

    const handleAddTag = async (tag: Tag) => {
        if (!taskId || !task || readOnly) return; 
        const currentTags = (task.tags as unknown as Tag[]) || [];
        if (currentTags.find((t) => t.id === tag.id)) return;

        const newTags = [...currentTags, tag];
        setTask({ ...task, tags: newTags as any });
        setIsTagPopoverOpen(false);

        try {
            await apiTag.assignTagToTask(companyId, workspaceId, projectId, taskId, tag.id);
            showToast("Tag added successfully", "success");
        } catch (error: any) {
            setTask({ ...task, tags: currentTags as any });
            const message = error.message || error.response?.data?.message || "Failed to add tag";
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
            showToast("Tag removed successfully", "success");
        } catch (error: any) {
            setTask({ ...task, tags: currentTags as any });
            const message = error.message || error.response?.data?.message || "Failed to remove tag";
            showToast(message, "error");
        }
    };

    const handleCreateNewTag = async () => {
        if (!taskId || !tagSearch.trim() || readOnly) return; 

        try {
            const newTag = await apiTag.createTag(companyId, workspaceId, projectId, {
                name: tagSearch.trim(),
                color: "#95a5a6",
            });
            setAllProjectTags((prev) => [...prev, newTag]);
            handleAddTag(newTag);
        } catch (error: any) {
            const message = error.message || error.response?.data?.message || "Error creating new tag";
            showToast(message, "error");
        }
    };

    // --- SUBTASK & DESCRIPTION HANDLERS ---
    const handleSaveDescription = async () => {
        if (!taskId || readOnly) return; 
        await handleUpdate("description", formData.description);
        setIsEditingDescription(false);
        showToast("Description updated successfully", "success");
    };
    const handleCancelDescription = () => {
        setFormData((prev) => ({ ...prev, description: task?.description || "" }));
        setIsEditingDescription(false);
    };

    const handleCreateSubtask = async () => {
        if (!newSubtaskTitle.trim() || !taskId || readOnly) return; 
        try {
            await createSubtask(companyId, workspaceId, projectId, taskId, { title: newSubtaskTitle });
            setNewSubtaskTitle("");
            setIsAddingSubtask(false);
            fetchSubtasks(taskId);
            showToast("Subtask created successfully", "success");
        } catch (error: any) {
            const message = error.message || error.response?.data?.message || "Failed to create subtask";
            showToast(message, "error");
        }
    };

    const handleToggleSubtask = async (subtask: Subtask) => {
        if (!taskId || readOnly) return; 
        const newStatus = subtask.status === "DONE" ? "TO_DO" : "DONE";
        setSubtasks((prev) => prev.map((s) => (s.id === subtask.id ? { ...s, status: newStatus } : s)));
        try {
            await updateSubtask(companyId, workspaceId, projectId, taskId, subtask.id, { status: newStatus });
        } catch (error) {
            console.error("Failed to update status", error);
            fetchSubtasks(taskId);
            showToast("Failed to update subtask status", "error");
        }
    };

    const onClickDeleteSubtask = (subTaskId: number) => {
        if (readOnly) return; 
        setSubtaskToDelete(subTaskId);
        setIsDeleteConfirmOpen(true);
    };

    const onConfirmDeleteSubtask = async () => {
        if (!taskId || !subtaskToDelete || readOnly) return; 

        setIsDeletingSubtask(true);
        try {
            await deleteSubtask(companyId, workspaceId, projectId, taskId, subtaskToDelete);
            setSubtasks((prev) => prev.filter((s) => s.id !== subtaskToDelete));
            showToast("Subtask deleted successfully", "success");
            setIsDeleteConfirmOpen(false);
        } catch (error: any) {
            const message = error.message || error.response?.data?.message || "Failed to delete subtask";
            showToast(message, "error");
            fetchSubtasks(taskId); 
        } finally {
            setIsDeletingSubtask(false);
            setSubtaskToDelete(null);
        }
    };

    const handleUpdateSubtask = async (subTaskId: number, data: any) => {
        if (!taskId || readOnly) return; 

        setSubtasks((prev) => prev.map((s) => {
            if (s.id === subTaskId) {
                if (data.assigneeId !== undefined) {
                    const userId = Number(data.assigneeId);
                    if (userId === 0) {
                        return { ...s, ...data, assigneeId: null, assigneeName: "Unassigned", assigneeAvatar: null };
                    }
                    const member = members.find((m) => (m.userId || m.id) === userId);
                    return { ...s, ...data, assigneeId: userId, assigneeName: member?.fullName || member?.name, assigneeAvatar: member?.avatarUrl || member?.avatar };
                }
                return { ...s, ...data };
            }
            return s;
        }));

        try {
            await updateSubtask(companyId, workspaceId, projectId, taskId, subTaskId, data);
            showToast("Subtask updated successfully", "success");
        } catch (error: any) {
            console.error("Failed to update subtask:", error);
            const message = error.message || error.response?.data?.message || "Subtask update failed";
            showToast(message, "error");
            fetchSubtasks(taskId);
        }
    };

    if (!taskId) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40"
                onClick={onClose}
            />

            <div
                ref={modalRef}
                className="fixed bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col transition-shadow"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    width: `${size.width}px`,
                    height: `${size.height}px`,
                }}
            >
                {selectedSubtaskId ? (
                    <SubtaskDetailView
                        subtaskId={selectedSubtaskId}
                        taskId={taskId}
                        companyId={companyId}
                        workspaceId={workspaceId}
                        projectId={projectId}
                        members={members}
                        onBack={() => setSelectedSubtaskId(null)}
                        onClose={onClose}
                        onUpdateParent={() => fetchSubtasks(taskId)}
                    />
                ) : (
                    <>
                        {/* --- HEADER --- */}
                        <div
                            className="modal-header bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between cursor-grab active:cursor-grabbing select-none shrink-0"
                            onMouseDown={handleMouseDown}
                        >
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <CheckSquare className="w-3.5 h-3.5 text-purple-600" />
                                <TooltipProvider>
                                    <Tooltip delayDuration={200}>
                                        <TooltipTrigger asChild>
                                            <span className="flex items-center gap-1 hover:underline cursor-pointer text-slate-600 font-medium">
                                                {task?.taskCode || (taskId ? `TASK-${taskId}` : "...")}
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-slate-800 text-white border-slate-700 max-w-[300px]">
                                            <p className="font-bold text-xs mb-1 text-blue-300">
                                                {task?.taskCode}
                                            </p>
                                            <p className="text-xs leading-relaxed">
                                                {formData.title}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                {isSaving && (
                                    <span className="ml-2 flex items-center gap-1 text-blue-600">
                                        <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                                    </span>
                                )}
                            </div>
                            <div
                                className="flex items-center gap-1"
                                onMouseDown={(e) => e.stopPropagation()}
                            >
                                {/* ✅ Hide Archive button if ReadOnly */}
                                {!readOnly && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                                                    onClick={onClickArchive}
                                                    disabled={isSaving}
                                                    title="Archive Task"
                                                >
                                                    {isSaving ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Archive className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Archive Task</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                                {onSwitchToPanel && (
                                    <button
                                        onClick={onSwitchToPanel}
                                        className="p-2 hover:bg-slate-100 rounded-md text-slate-500 hover:text-blue-600 transition-colors"
                                        title="Minimize to Panel"
                                    >
                                        <Minimize2 className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                                    className="p-2 hover:bg-slate-100 rounded-md"
                                    title="Close"
                                >
                                    <X className="w-4 h-4 text-slate-500" />
                                </button>
                            </div>
                        </div>

                        {/* --- BODY CONTENT --- */}
                        <div className="flex flex-1 overflow-hidden bg-white">
                            {loading ? (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                                </div>
                            ) : task ? (
                                /* Sửa lỗi cuộn: Đổi min-h-full thành h-full để con bên trong biết giới hạn height */
                                <div className="flex flex-col h-full w-full">
                                    {/* Sửa lỗi cuộn: Thêm h-full và min-h-0 cho grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] h-full min-h-0">
                                        
                                        {/* --- LEFT COLUMN (65%) --- */}
                                        <div className="p-8 border-r border-slate-100 overflow-y-auto custom-scrollbar">
                                            <input
                                                className={`w-full text-2xl font-bold text-slate-900 bg-transparent border-none outline-none placeholder:text-slate-300 focus:ring-0 p-0 mb-6 ${readOnly ? 'cursor-not-allowed text-slate-700' : ''}`}
                                                value={formData.title || ""}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                onBlur={(e) => handleUpdate("title", e.target.value)}
                                                placeholder="Task Title"
                                                disabled={isSaving || readOnly} 
                                            />

                                            <div className="flex gap-2">
                                                <Button variant="outline" className="h-8 bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100">
                                                    <LinkIcon className="w-3 h-3 mr-1.5" /> Attach
                                                </Button>
                                                {!readOnly && (
                                                    <Button variant="outline" className="h-8 bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100" onClick={() => setIsAddingSubtask(true)} disabled={isSaving}>
                                                        <Plus className="w-3 h-3 mr-1.5" /> Add child
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Description */}
                                            <div className="space-y-2 group mt-6 mb-8">
                                                <h3 className="text-sm font-bold text-slate-900">Description</h3>
                                                {isEditingDescription && !readOnly ? (
                                                    <div className="border border-blue-500 rounded-md p-2">
                                                        <Textarea
                                                            className="min-h-[150px] border-none focus-visible:ring-0 resize-none text-sm"
                                                            value={formData.description || ""}
                                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                            autoFocus
                                                            placeholder="Add a detailed description..."
                                                        />
                                                        <div className="flex justify-end gap-2 mt-2">
                                                            <Button size="sm" onClick={handleSaveDescription} disabled={isSaving}>Save</Button>
                                                            <Button size="sm" variant="ghost" onClick={handleCancelDescription} disabled={isSaving}>Cancel</Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={`min-h-[60px] text-sm text-slate-700 p-2 rounded border border-transparent ${readOnly ? '' : 'hover:bg-slate-50 hover:border-slate-200 cursor-pointer'}`}
                                                        onClick={() => !readOnly && setIsEditingDescription(true)}
                                                    >
                                                        {formData.description ? (
                                                            <div className="whitespace-pre-wrap">{formData.description}</div>
                                                        ) : (
                                                            <span className="text-slate-400 italic">Add description...</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Subtasks */}
                                            <TaskSubtasks
                                                subtasks={subtasks}
                                                members={members}
                                                onToggleStatus={handleToggleSubtask}
                                                onDelete={(id) => onClickDeleteSubtask(Number(id))}
                                                onAddSubtask={() => setIsAddingSubtask(true)}
                                                onAssigneeChange={(subTaskId, userId) => handleUpdateSubtask(subTaskId, { assigneeId: userId })}
                                                onEditContent={(subTaskId, data) => handleUpdateSubtask(subTaskId, data)}
                                                onViewDetail={(subId) => setSelectedSubtaskId(subId)}
                                                isReadOnly={readOnly}
                                            />

                                            {isAddingSubtask && !readOnly && (
                                                <div className="mt-2 flex gap-2">
                                                    <Input
                                                        value={newSubtaskTitle}
                                                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                                        onKeyDown={(e) => e.key === "Enter" && handleCreateSubtask()}
                                                        autoFocus
                                                        placeholder="Subtask title..."
                                                        className="h-9 text-sm"
                                                        disabled={isSaving}
                                                    />
                                                    <Button size="sm" onClick={handleCreateSubtask} className="h-9" disabled={isSaving || !newSubtaskTitle.trim()}>Add</Button>
                                                    <Button size="sm" variant="ghost" onClick={() => setIsAddingSubtask(false)} className="h-9" disabled={isSaving}>Cancel</Button>
                                                </div>
                                            )}

                                            {/* Comments */}
                                            <div className="mt-8">
                                                <TaskComment taskId={taskId} />
                                            </div>
                                        </div>

                                        {/* --- RIGHT COLUMN (35%) --- */}
                                        <div className="w-[340px] flex flex-col overflow-y-auto custom-scrollbar bg-slate-50/50 shrink-0">
                                            <div className="p-6 space-y-6">
                                                {/* Status Selector */}
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-bold text-slate-400 uppercase">Status</label>
                                                    <div className="relative">
                                                        <select
                                                            className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-md text-sm font-bold shadow-sm cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 appearance-none uppercase disabled:cursor-not-allowed disabled:opacity-70"
                                                            value={formData.statusId || ""}
                                                            onChange={(e) => handleUpdate("statusId", Number(e.target.value))}
                                                            style={{
                                                                color: task.status?.color || "inherit",
                                                                borderLeftWidth: "4px",
                                                                borderLeftColor: task.status?.color || "transparent",
                                                            }}
                                                            disabled={isSaving || readOnly} 
                                                        >
                                                            {statuses.length > 0 ? (
                                                                statuses.map((st) => (
                                                                    <option key={st.id} value={st.id}>{st.name}</option>
                                                                ))
                                                            ) : (
                                                                <option value={task.status?.id || 0}>{task.status?.name}</option>
                                                            )}
                                                        </select>
                                                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                                                    </div>
                                                </div>

                                                <hr className="border-slate-200" />

                                                {/* People */}
                                                <div className="space-y-4">
                                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase">People</h4>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-sm text-slate-600"><User className="w-4 h-4" /> Assignee</div>
                                                        <div className="relative group min-w-[140px]">
                                                            <div className={`flex items-center justify-end gap-2 px-2 py-1.5 rounded transition-all ${readOnly ? '' : 'cursor-pointer hover:bg-slate-200'}`}>
                                                                <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center border border-white shadow-sm shrink-0">
                                                                    {/* ✅ Hiển thị avatar chính xác */}
                                                                    {task.assignee?.avatarUrl ? (
                                                                        <img src={task.assignee.avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
                                                                    ) : (
                                                                        <User className="w-3.5 h-3.5 text-slate-400" />
                                                                    )}
                                                                </div>
                                                                <span className={`text-sm font-medium truncate max-w-[120px] ${!task.assignee?.name ? "text-slate-400 italic" : "text-slate-700"}`}>
                                                                    {/* ✅ Hiển thị tên chính xác */}
                                                                    {task.assignee?.name || "Unassigned"}
                                                                </span>
                                                            </div>
                                                            <select
                                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                                value={formData.assigneeId ? String(formData.assigneeId) : "0"}
                                                                onChange={(e) => handleUpdate("assigneeId", Number(e.target.value))}
                                                                disabled={isSaving || readOnly} 
                                                            >
                                                                <option value="0">Unassigned</option>
                                                                {members.map((m) => (
                                                                    <option key={m.userId || m.id} value={String(m.userId || m.id)}>{m.fullName || m.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between text-slate-500">
                                                        <div className="flex items-center gap-2 text-sm"><Zap className="w-4 h-4" /> Reporter</div>
                                                        <span className="text-sm text-slate-700">{task.createdByName || "Unknown"}</span>
                                                    </div>
                                                </div>

                                                <hr className="border-slate-200" />

                                                {/* Tags */}
                                                <div className="space-y-3 relative" ref={tagPopoverRef}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <TagIcon className="w-3 h-3 text-slate-400" />
                                                            <label className="text-[11px] font-bold text-slate-400 uppercase">Tags</label>
                                                        </div>
                                                        {!readOnly && (
                                                            <button
                                                                ref={tagButtonRef}
                                                                onClick={() => setIsTagPopoverOpen(!isTagPopoverOpen)}
                                                                className="text-slate-500 hover:text-blue-600 transition-colors p-1 hover:bg-slate-200 rounded"
                                                                title="Add Tag"
                                                                disabled={isSaving}
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {task.tags && task.tags.length > 0 ? (
                                                            (task.tags as unknown as Tag[]).map((tag) => (
                                                                <div key={tag.id} className={`flex items-center gap-1 px-2 py-1 rounded bg-white border border-slate-200 shadow-sm text-xs font-medium text-slate-700 transition-all ${readOnly ? '' : 'group cursor-pointer hover:bg-slate-50 hover:border-slate-300'}`} onClick={() => !readOnly && setEditingTag(tag)}>
                                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color || "#cbd5e1" }}></div>
                                                                    {tag.name}
                                                                    {!readOnly && (
                                                                        <button onClick={(e) => { e.stopPropagation(); handleRemoveTag(tag.id); }} className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity ml-1 p-0.5 rounded-full hover:bg-slate-200" title="Remove Tag" disabled={isSaving}>
                                                                            <X className="w-3 h-3" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-slate-400 italic">No tags</span>
                                                        )}
                                                    </div>
                                                    {isTagPopoverOpen && !readOnly && (
                                                        <div className="absolute right-0 top-8 z-20 w-56 bg-white rounded-md shadow-xl border border-slate-200 p-2 animate-in fade-in zoom-in-95 duration-100">
                                                            <Input
                                                                ref={tagInputRef}
                                                                placeholder="Search or create tag..."
                                                                className="h-8 text-xs mb-2"
                                                                value={tagSearch}
                                                                onChange={(e) => setTagSearch(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter" && tagSearch.trim()) {
                                                                        const exactMatch = allProjectTags.find((t) => t.name.toLowerCase() === tagSearch.trim().toLowerCase());
                                                                        if (exactMatch) handleAddTag(exactMatch);
                                                                        else handleCreateNewTag();
                                                                    }
                                                                }}
                                                                disabled={isSaving}
                                                            />
                                                            <div className="text-[10px] text-slate-400 px-2 py-1 border-b border-slate-50 uppercase font-bold">Select an option</div>
                                                            <div className="max-h-40 overflow-y-auto custom-scrollbar p-1 space-y-0.5">
                                                                {filteredTags.length > 0 ? (
                                                                    filteredTags.filter((t) => !(task.tags as unknown as Tag[])?.find((tt) => tt.id === t.id)).map((tag) => (
                                                                        <button key={tag.id} className="w-full text-left px-2 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 rounded flex items-center gap-2 transition-colors" onClick={() => handleAddTag(tag)} disabled={isSaving}>
                                                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color || "#cbd5e1" }}></div>
                                                                            {tag.name}
                                                                        </button>
                                                                    ))
                                                                ) : (<div className="px-2 py-2 text-xs text-slate-500 italic text-center">No existing tags match</div>)}
                                                                {tagSearch.trim() && !allProjectTags.find((t) => t.name.toLowerCase() === tagSearch.trim().toLowerCase()) && (
                                                                    <button className="w-full text-left px-2 py-1.5 text-xs hover:bg-blue-50 text-blue-600 font-medium rounded flex items-center gap-2 border-t border-slate-100 mt-1 pt-2" onClick={handleCreateNewTag} disabled={isSaving}>
                                                                        <Plus className="w-3 h-3" /> Create "{tagSearch}"
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <hr className="border-slate-200" />

                                                {/* Planning */}
                                                <div className="space-y-4">
                                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase">Planning</h4>
                                                    
                                                    {/* Priority */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-sm text-slate-600"><Flag className="w-4 h-4" /> Priority</div>
                                                        <div className="w-[120px]">
                                                            <PrioritySelect value={formData.priority || "LOW"} onChange={(v) => handleUpdate("priority", v)} disabled={readOnly} />
                                                        </div>
                                                    </div>

                                                    {/* Epic */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-sm text-slate-600"><Layers className="w-4 h-4" /> Epic</div>
                                                        <button 
                                                            onClick={() => !readOnly && setIsEpicModalOpen(true)} 
                                                            className={`max-w-[160px] px-2 py-1 rounded text-xs font-bold truncate transition-colors border ${task?.epic ? "bg-white border-slate-200 text-slate-700 hover:border-blue-300" : "bg-slate-100 border-transparent text-slate-400 hover:bg-slate-200"} ${readOnly ? 'cursor-default opacity-80' : ''}`}
                                                            style={task?.epic ? { borderLeftColor: task.epic.color || "#ccc", borderLeftWidth: "3px" } : {}}
                                                            disabled={isSaving}
                                                        >
                                                            {task?.epic ? task.epic.name : "Add Epic"}
                                                        </button>
                                                    </div>

                                                    {/* Sprint */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-sm text-slate-600"><Clock className="w-4 h-4" /> Sprint</div>
                                                        <div className="relative w-[140px]">
                                                            <select
                                                                className="w-full text-sm text-right bg-transparent border-none outline-none text-slate-700 hover:text-blue-600 font-medium cursor-pointer truncate transition-colors hover:bg-slate-100 rounded px-2 py-1 appearance-none disabled:cursor-not-allowed"
                                                                value={Number(formData.sprintId) || 0}
                                                                onChange={(e) => handleUpdate("sprintId", Number(e.target.value))}
                                                                disabled={isSaving || readOnly} 
                                                            >
                                                                <option value={0}>Backlog</option>
                                                                {localSprints.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                            </select>
                                                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1 top-1.5 pointer-events-none" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Time Tracking */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-white p-2.5 rounded border border-slate-200">
                                                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Points</label>
                                                        <input type="number" min="0" className="w-full font-bold text-slate-800 outline-none text-sm disabled:cursor-not-allowed" value={formData.storyPoints || ""} onChange={(e) => setFormData({ ...formData, storyPoints: Number(e.target.value) })} onBlur={(e) => handleUpdate("storyPoints", Number(e.target.value))} disabled={isSaving || readOnly} placeholder="0" />
                                                    </div>
                                                    <div className="bg-white p-2.5 rounded border border-slate-200">
                                                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Est. Hours</label>
                                                        <div className="flex items-center gap-1">
                                                            <input type="number" min="0" className="w-full font-bold text-slate-800 outline-none text-sm disabled:cursor-not-allowed" value={formData.estimatedHours || ""} onChange={(e) => setFormData({ ...formData, estimatedHours: Number(e.target.value) })} onBlur={(e) => handleUpdate("estimatedHours", Number(e.target.value))} disabled={isSaving || readOnly} placeholder="0" />
                                                            <span className="text-xs text-slate-400">h</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <hr className="border-slate-200" />

                                                {/* Timeline */}
                                                <div className="space-y-4">
                                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase">Timeline</h4>
                                                    <div className="space-y-1.5">
                                                        <div className="flex justify-between text-xs text-slate-600 font-medium"><span>Start Date</span></div>
                                                        <input type="datetime-local" className="w-full text-xs p-2 border border-slate-200 rounded bg-white text-slate-700 outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:cursor-not-allowed" value={toInputDate(formData.startDate)} onChange={(e) => handleUpdate("startDate", e.target.value)} disabled={isSaving || readOnly} />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <div className="flex justify-between text-xs text-slate-600 font-medium"><span>Due Date</span>{task.dueDate && new Date(task.dueDate) < new Date() && <span className="text-red-500 font-bold text-[10px]">Overdue</span>}</div>
                                                        <input type="datetime-local" className="w-full text-xs p-2 border border-slate-200 rounded bg-white text-slate-700 outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:cursor-not-allowed" value={toInputDate(formData.dueDate)} onChange={(e) => handleUpdate("dueDate", e.target.value)} disabled={isSaving || readOnly} />
                                                    </div>
                                                </div>

                                                {/* Meta */}
                                                <div className="mt-auto pt-6 text-[10px] text-slate-400">
                                                    {task.createdAt && <p>Created on {new Date(task.createdAt).toLocaleString("en-US")}</p>}
                                                    <p className="mt-1">Last updated just now</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <div
                            className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50"
                            onMouseDown={(e) => { e.stopPropagation(); setIsResizing(true); }}
                        >
                            <div className="absolute bottom-1 right-1 w-2 h-2 bg-slate-300 rounded-sm"></div>
                        </div>
                    </>
                )}
            </div>

            {/* Modals */}
            <TagModal isOpen={!!editingTag} onClose={() => setEditingTag(null)} tag={editingTag} companyId={companyId} workspaceId={workspaceId} projectId={projectId} onUpdate={(updatedTag) => { setAllProjectTags((prev) => prev.map((t) => (t.id === updatedTag.id ? updatedTag : t))); setTask((prev) => prev ? { ...prev, tags: prev.tags?.map((t) => t.id === updatedTag.id ? updatedTag : t) as any } : null); }} onDelete={(deletedTagId) => { setAllProjectTags((prev) => prev.filter((t) => t.id !== deletedTagId)); setTask((prev) => prev ? { ...prev, tags: prev.tags?.filter((t) => t.id !== deletedTagId) as any } : null); }} />
            <EpicModal isOpen={isEpicModalOpen} onClose={() => setIsEpicModalOpen(false)} projectId={projectId} currentEpicId={formData.epicId || null} onSelectEpic={handleSelectEpic} />
            <ConfirmationModal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} onConfirm={onConfirmDeleteSubtask} isLoading={isDeletingSubtask} title="Delete Subtask" description="Are you sure you want to delete this subtask? This action cannot be undone." confirmText="Delete" modalVariant="danger" />
            <ConfirmationModal isOpen={isArchiveConfirmOpen} onClose={() => setIsArchiveConfirmOpen(false)} onConfirm={onConfirmArchive} isLoading={isSaving} title="Archive Task" description="This task will be moved to the archive. You can restore it later if needed." confirmText="Archive" cancelText="Cancel" modalVariant="warning" />
        </>
    );
}