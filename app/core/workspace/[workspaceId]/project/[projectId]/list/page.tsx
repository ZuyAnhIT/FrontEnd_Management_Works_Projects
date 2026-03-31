"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Components)
// =============================================================================

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    Loader2, 
    ChevronDown, 
    Plus, 
    Calendar, 
    Upload, 
    Check 
} from "lucide-react";

// Context & UI Components
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Buttons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatars";
import { Chatbot } from "@/components/chatbot/chatbot";

// API Services & Types
import { updateTask } from "@/services/apiTask";
import { getProjectStatuses, RawStatusColumn } from "@/services/apiBoard";
import { getSprints, Sprint } from "@/services/apiSprint";
import {
    getProjectMembers,
    getProjectTasks,
    getTasksGrouped,
    ProjectMember,
    TaskResponse,
    TasksGroupedResponse,
    ProjectTaskFilterParams,
} from "@/services/apiProject";

// Internal Feature Components
import ImportTaskModal from "@/components/features/core/task/ImportTaskModal";
import TaskDetailPanel from "@/components/features/core/task/TaskDetailPanel";
import TaskDetailModalFloating from "@/components/features/core/task/TaskDetailModalFloating";
import CreateTaskModal from "@/components/features/core/task/CreateTaskModal";
import ListHeader from "@/components/features/core/list/ListHeader";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. HELPER FUNCTIONS & UTILS
// =============================================================================

/**
 * Xac dinh mau sac va kieu dang dua tren muc do uu tien
 */
const getPriorityConfig = (priority: string) => {
    const p = priority?.toLowerCase();
    switch (p) {
        case "urgent": return "text-[#BF2600] bg-[#FFEBE6] border-[#FFBDAD]";
        case "high": return "text-[#FF8B00] bg-[#FFF0B3] border-[#FFE380]";
        case "medium": return "text-[#0052CC] bg-[#DEEBFF] border-[#B3D4FF]";
        case "low": return "text-[#006644] bg-[#E3FCEF] border-[#ABF5D1]";
        default: return "text-[#42526E] bg-[#F4F5F7] border-[#DFE1E6]";
    }
};

// =============================================================================
// 3. SUB-COMPONENT: JIRA TASK ROW
// =============================================================================

interface JiraTaskRowProps {
    task: TaskResponse;
    members: ProjectMember[];
    statuses: RawStatusColumn[];
    onSelect: (t: TaskResponse) => void;
    onUpdate: (taskId: number, data: any) => void;
}

const JiraTaskRow: React.FC<JiraTaskRowProps> = ({ 
    task, members, statuses, onSelect, onUpdate 
}) => {
    const { showToast } = useToast();
    
    // State cho viec chinh sua tieu de truc tiep
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleValue, setTitleValue] = useState(task.title);
    const [isSavingTitle, setIsSavingTitle] = useState(false);

    // Dong bo hoa tieu de khi props thay doi
    useEffect(() => {
        setTitleValue(task.title);
    }, [task.title]);

    /**
     * Xu ly luu tieu de sau khi chinh sua
     */
    const handleCommitTitle = async () => {
        const trimmedTitle = (titleValue ?? "").trim();

        if (!trimmedTitle) {
            setTitleValue(task.title);
            setIsEditingTitle(false);
            return;
        }

        if (trimmedTitle === task.title) {
            setIsEditingTitle(false);
            return;
        }

        setIsSavingTitle(true);
        // Cap nhat tam thoi tren giao dien (Optimistic)
        onUpdate(task.id, { title: trimmedTitle });

        try {
            await updateTask(task.id, { title: trimmedTitle });
            setIsEditingTitle(false);
        } catch (error: any) {
            // Hoan tac neu loi
            onUpdate(task.id, { title: task.title });
            setTitleValue(task.title);
            showToast(error.response?.data?.message || "Failed to sync title", "error");
        } finally {
            setIsSavingTitle(false);
        }
    };

    /**
     * Xu ly phim tat khi dang edit title
     */
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleCommitTitle();
        if (e.key === "Escape") {
            setTitleValue(task.title);
            setIsEditingTitle(false);
        }
    };

    const statusColor = task.status?.color || "#64748b";

    return (
        <tr className="group bg-white hover:bg-[#F4F5F7] border-b border-[#DFE1E6] transition-colors cursor-pointer text-[13px]">
            {/* COLUMN: TASK KEY */}
            <td onClick={() => onSelect(task)} className="px-4 py-3 w-28 whitespace-nowrap">
                <span className="text-[#6B778C] font-mono text-[11px] font-bold tracking-tighter uppercase">
                    {task.taskCode}
                </span>
            </td>

            {/* COLUMN: SUMMARY (INLINE EDIT) */}
            <td className="px-4 py-2 min-w-[300px]">
                <div className="relative min-h-[32px] flex items-center">
                    {isEditingTitle ? (
                        <div className="w-full flex flex-col gap-1 py-1">
                            <input
                                autoFocus
                                value={titleValue}
                                onChange={(e) => setTitleValue(e.target.value)}
                                onBlur={handleCommitTitle}
                                onKeyDown={handleKeyPress}
                                disabled={isSavingTitle}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full h-8 px-2 bg-white border-2 border-[#0052CC] rounded-[3px] outline-none shadow-sm font-medium"
                            />
                            {isSavingTitle && <span className="text-[10px] text-[#6B778C] animate-pulse">Syncing...</span>}
                        </div>
                    ) : (
                        <span
                            className="block w-full py-1.5 px-2 text-[#172B4D] font-medium border border-transparent hover:bg-white hover:border-[#DFE1E6] rounded-[3px] truncate transition-all"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditingTitle(true);
                            }}
                        >
                            {task.title}
                        </span>
                    )}
                </div>
            </td>

            {/* COLUMN: STATUS DROPDOWN */}
            <td className="px-4 py-2 w-44" onClick={(e) => e.stopPropagation()}>
                <div className="relative group/status">
                    <select
                        className="appearance-none w-full h-7 pl-2.5 pr-8 text-[11px] font-black uppercase rounded-[3px] border cursor-pointer outline-none focus:ring-2 focus:ring-[#DEEBFF] transition-all"
                        style={{ 
                            color: statusColor, 
                            backgroundColor: `${statusColor}15`, 
                            borderColor: `${statusColor}30` 
                        }}
                        value={task.status?.id || ""}
                        onChange={(e) => onUpdate(task.id, { statusId: Number(e.target.value) })}
                    >
                        {statuses.map((st) => (
                            <option key={st.id} value={st.id} className="bg-white text-[#172B4D] font-bold uppercase">
                                {st.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" style={{ color: statusColor }} />
                </div>
            </td>

            {/* COLUMN: PRIORITY BADGE */}
            <td onClick={() => onSelect(task)} className="px-4 py-3 w-32">
                <span className={cn(
                    "px-2 py-0.5 rounded-[3px] text-[10px] font-black uppercase tracking-wider border",
                    getPriorityConfig(task.priority)
                )}>
                    {task.priority}
                </span>
            </td>

            {/* COLUMN: ASSIGNEE SELECTOR */}
            <td className="px-4 py-2 w-48" onClick={(e) => e.stopPropagation()}>
                <div className="relative w-full">
                    <div className="flex items-center gap-2.5 hover:bg-white border border-transparent hover:border-[#DFE1E6] py-1 px-2 rounded-[3px] transition-all">
                        <Avatar className="w-6 h-6 border border-white shadow-sm shrink-0">
                            {task.assignee?.avatarUrl ? (
                                <AvatarImage src={task.assignee.avatarUrl} className="object-cover" />
                            ) : (
                                <AvatarFallback className="bg-[#EBECF0] text-[#42526E] text-[9px] font-black uppercase">
                                    {task.assignee?.name?.substring(0, 2) || "?"}
                                </AvatarFallback>
                            )}
                        </Avatar>
                        <span className={cn(
                            "text-[12px] truncate",
                            task.assignee ? "text-[#172B4D] font-semibold" : "text-[#6B778C] italic"
                        )}>
                            {task.assignee?.name || "Unassigned"}
                        </span>
                    </div>

                    <select
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        value={task.assignee?.id || 0}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            onUpdate(task.id, { assigneeId: val === 0 ? null : val });
                        }}
                    >
                        <option value={0}>Unassigned</option>
                        {members.map((m) => (
                            <option key={m.userId} value={m.userId}>{m.fullName}</option>
                        ))}
                    </select>
                </div>
            </td>

            {/* COLUMN: DUE DATE */}
            <td onClick={() => onSelect(task)} className="px-4 py-3 w-36">
                {task.dueDate ? (
                    <div className="flex items-center gap-2 text-[#42526E] font-medium">
                        <Calendar className="w-3.5 h-3.5 opacity-60" />
                        <span>
                            {new Date(task.dueDate).toLocaleDateString("en-US", {
                                month: "short", day: "numeric", year: "numeric"
                            })}
                        </span>
                    </div>
                ) : (
                    <span className="text-[#DFE1E6]">—</span>
                )}
            </td>
        </tr>
    );
};

// =============================================================================
// 4. MAIN PAGE COMPONENT: PROJECT LIST
// =============================================================================

export default function ProjectListPage() {
    
    // ---------------------------------------------------------------------------
    // 5. HOOKS, CONTEXT & PARAMS
    // ---------------------------------------------------------------------------
    
    const params = useParams();
    const { activeCompany, isLoading: isAuthLoading } = useAuth();
    const { showToast } = useToast();

    const companyId = activeCompany?.companyId;
    const workspaceId = Number(params.workspaceId);
    const projectId = Number(params.projectId);

    // ---------------------------------------------------------------------------
    // 6. STATE MANAGEMENT
    // ---------------------------------------------------------------------------

    // Data States
    const [tasks, setTasks] = useState<TaskResponse[]>([]);
    const [groupedTasks, setGroupedTasks] = useState<TasksGroupedResponse>({});
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [allSprints, setAllSprints] = useState<Sprint[]>([]);
    const [statuses, setStatuses] = useState<RawStatusColumn[]>([]);
    
    // UI States
    const [isLoading, setIsLoading] = useState(true);
    const [groupBy, setGroupBy] = useState<string>("none");
    const [viewMode, setViewMode] = useState<"panel" | "floating">("panel");
    const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
    
    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Filters State
    const [filters, setFilters] = useState<ProjectTaskFilterParams>({
        search: "",
        page: 0,
        size: 50,
    });

    // ---------------------------------------------------------------------------
    // 7. DATA FETCHING (Handlers)
    // ---------------------------------------------------------------------------

    /**
     * Tai thong tin Metadata (Members, Statuses, Sprints)
     */
    const fetchMetadata = useCallback(async () => {
        if (!companyId || !projectId) return;
        try {
            const [membersRes, statusRes, sprintsRes] = await Promise.all([
                getProjectMembers(companyId, workspaceId, projectId, { size: 100 }),
                getProjectStatuses(projectId),
                getSprints(projectId),
            ]);

            if (membersRes.content) setMembers(membersRes.content);
            if (Array.isArray(statusRes)) setStatuses(statusRes);
            if (Array.isArray(sprintsRes)) setAllSprints(sprintsRes);
        } catch (err: any) {
            console.error("[ProjectMetadata] Fetch failed:", err.message);
        }
    }, [companyId, workspaceId, projectId]);

    /**
     * Tai danh sach nhiem vu dua tren phan nhom va bo loc
     */
    const fetchTaskList = useCallback(async () => {
        if (!companyId) return;
        setIsLoading(true);

        try {
            if (groupBy === "none") {
                const res = await getProjectTasks(companyId, workspaceId, projectId, filters);
                setTasks(res.content || []);
            } else {
                const res = await getTasksGrouped(companyId, workspaceId, projectId, groupBy, filters.sprintId, filters.search);
                setGroupedTasks(res || {});
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || "Sync failed", "error");
            setTasks([]);
        } finally {
            setIsLoading(false);
        }
    }, [companyId, workspaceId, projectId, filters, groupBy, showToast]);

    // Side Effects cho khoi tao va tai du lieu
    useEffect(() => {
        fetchMetadata();
    }, [fetchMetadata]);

    useEffect(() => {
        if (!isAuthLoading) {
            const timer = setTimeout(fetchTaskList, 300);
            return () => clearTimeout(timer);
        }
    }, [fetchTaskList, isAuthLoading]);

    // ---------------------------------------------------------------------------
    // 8. EVENT HANDLERS (Business Logic)
    // ---------------------------------------------------------------------------

    /**
     * Cap nhat thong tin nhiem vu truc tiep tu bang (Optimistic Update)
     */
    const handleTaskInlineUpdate = async (taskId: number, updateData: any) => {
        if (!companyId || !workspaceId || !projectId) return;

        const updateLocalRecord = (list: TaskResponse[]) => {
            return list.map((t) => {
                if (t.id !== taskId) return t;
                
                let updated = { ...t, ...updateData };

                // Map lai Status object neu statusId thay doi
                if (updateData.statusId) {
                    const statusObj = statuses.find((s) => s.id === updateData.statusId);
                    if (statusObj) {
                        updated.status = {
                            id: statusObj.id,
                            name: statusObj.name,
                            color: statusObj.color,
                            isCompleted: statusObj.isCompletedStatus,
                        };
                    }
                }

                // Map lai Assignee object neu assigneeId thay doi
                if (updateData.hasOwnProperty("assigneeId")) {
                    const member = members.find((m) => m.userId === updateData.assigneeId);
                    updated.assignee = member ? {
                        id: member.userId,
                        name: member.fullName,
                        avatarUrl: member.avatarUrl,
                    } : null;
                }

                return updated;
            });
        };

        // Thuc thi cap nhat local state ngay lap tuc
        if (groupBy === "none") {
            setTasks((prev) => updateLocalRecord(prev));
        } else {
            setGroupedTasks((prev) => {
                const newGrouped: TasksGroupedResponse = {};
                Object.keys(prev).forEach((key) => {
                    newGrouped[key] = updateLocalRecord(prev[key]);
                });
                return newGrouped;
            });
        }

        try {
            await updateTask(taskId, updateData);
            showToast("Update synchronized", "success");
        } catch (error: any) {
            showToast(error.message || "Failed to persist changes", "error");
            fetchTaskList(); // Rollback bang cach tai lai toan bo
        }
    };

    const onTaskClick = (task: TaskResponse) => {
        setSelectedTask(task);
        setIsDetailOpen(true);
    };

    // ---------------------------------------------------------------------------
    // 9. RENDER LOGIC
    // ---------------------------------------------------------------------------

    if (isAuthLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#F4F5F7]">
                <Loader2 className="w-10 h-10 animate-spin text-[#0052CC] opacity-80" />
            </div>
        );
    }

    const detailCommonProps = {
        taskId: selectedTask?.id || 0,
        companyId: companyId!,
        workspaceId,
        projectId,
        members,
        statuses,
        sprints: allSprints,
        epics: [],
        onClose: () => { setIsDetailOpen(false); setSelectedTask(null); },
        onUpdate: fetchTaskList
    };

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col bg-white relative overflow-hidden font-sans text-[#172B4D]">
            
            {/* PAGE HEADER & CONTROLS */}
            <ListHeader
                filters={filters}
                setFilters={setFilters}
                groupBy={groupBy}
                setGroupBy={setGroupBy}
                members={members}
                totalTasks={groupBy === "none" ? tasks.length : Object.values(groupedTasks).flat().length}
            />

            {/* ACTION TOOLBAR */}
            <div className="flex items-center justify-end px-6 py-3 bg-[#FAFBFC] border-b border-[#DFE1E6] shrink-0 z-10 gap-3">
                <Button
                    variant="outline"
                    onClick={() => setIsImportModalOpen(true)}
                    className="h-8 px-4 text-[11px] font-black uppercase tracking-widest text-[#42526E] border-[#DFE1E6] hover:bg-white shadow-sm flex items-center gap-2 rounded-[3px]"
                >
                    <Upload className="w-3.5 h-3.5" /> Import
                </Button>

                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-[#0052CC] hover:bg-[#0747A6] text-white shadow-md h-8 px-5 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 rounded-[3px] active:scale-95 transition-all"
                >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" /> Create Issue
                </Button>
            </div>

            {/* MAIN LIST AREA */}
            <div className="flex-1 overflow-hidden relative bg-[#F4F5F7]/30">
                <div className="h-full overflow-y-auto custom-scrollbar">
                    <div className="min-w-full inline-block align-middle px-6 py-4">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-60 gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-[#0052CC] opacity-40" />
                                <span className="text-[11px] font-bold text-[#6B778C] uppercase tracking-widest">Syncing backlog...</span>
                            </div>
                        ) : (
                            <div className="bg-white border border-[#DFE1E6] rounded-[3px] shadow-sm">
                                <table className="min-w-full text-left border-collapse">
                                    <thead className="bg-[#FAFBFC] border-b border-[#DFE1E6] text-[11px] font-black text-[#6B778C] uppercase tracking-[0.1em] sticky top-0 z-10 h-10">
                                        <tr>
                                            <th className="px-4 w-28">Key</th>
                                            <th className="px-4">Summary</th>
                                            <th className="px-4 w-44">Status</th>
                                            <th className="px-4 w-32">Priority</th>
                                            <th className="px-4 w-48">Assignee</th>
                                            <th className="px-4 w-36">Due Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#F4F5F7]">
                                        {groupBy === "none" ? (
                                            tasks.length > 0 ? (
                                                tasks.map((task) => (
                                                    <JiraTaskRow 
                                                        key={task.id} 
                                                        task={task} 
                                                        members={members} 
                                                        statuses={statuses} 
                                                        onSelect={onTaskClick} 
                                                        onUpdate={handleTaskInlineUpdate} 
                                                    />
                                                ))
                                            ) : <EmptyPlaceholder />
                                        ) : (
                                            Object.entries(groupedTasks).map(([name, groupTasks]) => (
                                                <React.Fragment key={`group-${name}`}>
                                                    <tr className="bg-[#F4F5F7]/50 border-y border-[#DFE1E6]">
                                                        <td colSpan={6} className="px-4 py-2">
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-black text-[11px] text-[#172B4D] uppercase tracking-widest">{name}</span>
                                                                <span className="text-[10px] font-black text-[#6B778C] bg-white px-2 py-0.5 rounded-full border border-[#DFE1E6] shadow-xs">{groupTasks.length}</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {groupTasks.map((task) => (
                                                        <JiraTaskRow 
                                                            key={task.id} 
                                                            task={task} 
                                                            members={members} 
                                                            statuses={statuses} 
                                                            onSelect={onTaskClick} 
                                                            onUpdate={handleTaskInlineUpdate} 
                                                        />
                                                    ))}
                                                </React.Fragment>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* DETAIL MODALS (Panel or Floating) */}
            {isDetailOpen && selectedTask && (
                viewMode === "panel" ? (
                    <TaskDetailPanel 
                        {...detailCommonProps} 
                        onSwitchToFloating={() => setViewMode("floating")} 
                    />
                ) : (
                    <TaskDetailModalFloating 
                        {...detailCommonProps} 
                        isOpen={true} 
                        onSwitchToPanel={() => setViewMode("panel")} 
                    />
                )
            )}

            {/* LOGICAL MODALS REGISTRATION */}
            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchTaskList}
                companyId={companyId!}
                workspaceId={workspaceId}
                projectId={projectId}
                members={members}
            />

            <ImportTaskModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={fetchTaskList}
                projectId={projectId}
                statuses={statuses}
                members={members}
            />

            <Chatbot />
            
            {/* CUSTOM SCROLLBAR GLOBAL STYLES */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #DFE1E6; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #B3BAC5; }
            `}</style>
        </div>
    );
}

// Internal Empty Placeholder
const EmptyPlaceholder = () => (
    <tr>
        <td colSpan={6} className="text-center py-24 text-[#6B778C] font-medium italic">
            No work items match your current filter.
        </td>
    </tr>
);