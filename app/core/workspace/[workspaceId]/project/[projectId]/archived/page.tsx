"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Services -> Hooks -> Components)
// =============================================================================

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import {
    Archive,
    RefreshCcw,
    Loader2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Bug,
    Bookmark,
    CheckCircle2,
} from "lucide-react";

// Services & Types
import {
    getArchivedTasks,
    ArchivedTaskParams,
    getProjectMembers,
    ProjectMember,
    TaskResponse,
} from "@/services/apiProject";
import { restoreTask } from "@/services/apiTask";

// Context & UI Components
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Buttons";
import { Chatbot } from "@/components/chatbot/chatbot";
import ArchivedFilterBar from "@/components/features/core/archived/ArchivedFilterBar";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES & TYPES
// =============================================================================

interface TaskToRestore {
    id: number;
    title: string;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function ArchivedPage() {
    
    // ---------------------------------------------------------------------------
    // 4. HOOKS, CONTEXT & PARAMS
    // ---------------------------------------------------------------------------
    
    const params = useParams();
    const { showToast } = useToast();

    // Dam bao IDs luon co gia tri hop le
    const projectId = useMemo(() => Number(params.projectId), [params.projectId]);
    const workspaceId = useMemo(() => Number(params.workspaceId), [params.workspaceId]);
    const companyId = useMemo(() => Number(params.companyId) || 1, [params.companyId]);

    // ---------------------------------------------------------------------------
    // 5. STATE MANAGEMENT
    // ---------------------------------------------------------------------------

    // Data States
    const [tasks, setTasks] = useState<TaskResponse[]>([]);
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal & Action States
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [selectedTask, setSelectedTask] = useState<TaskToRestore | null>(null);

    // Pagination & Filter States
    const [pagination, setPagination] = useState({
        pageNumber: 0,
        pageSize: 10,
        totalPages: 0,
        totalElements: 0,
        first: true,
        last: true,
    });
    const [filters, setFilters] = useState<ArchivedTaskParams>({});

    // ---------------------------------------------------------------------------
    // 6. DATA FETCHING (Handlers)
    // ---------------------------------------------------------------------------

    /**
     * Tai danh sach thanh vien du an (Metadata)
     */
    const fetchMetadata = useCallback(async () => {
        if (!projectId) return;
        try {
            const response = await getProjectMembers(companyId, workspaceId, projectId, { size: 100 });
            setMembers(response.content || []);
        } catch (err: any) {
            console.error("[Archived] Metadata load failed:", err.message);
        }
    }, [companyId, workspaceId, projectId]);

    /**
     * Tai danh sach tac vu da luu tru dua tren phan trang va bo loc
     */
    const fetchArchivedTasks = useCallback(async () => {
        if (!projectId) return;
        setIsLoading(true);
        try {
            const apiParams: ArchivedTaskParams = {
                page: pagination.pageNumber,
                size: pagination.pageSize,
                ...filters,
            };
            const response = await getArchivedTasks(companyId, workspaceId, projectId, apiParams);

            setTasks(response.content || []);
            setPagination({
                pageNumber: response.pageNumber,
                pageSize: response.pageSize,
                totalPages: response.totalPages,
                totalElements: response.totalElements,
                first: response.first,
                last: response.last,
            });
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to retrieve archived records";
            showToast(message, "error");
            setTasks([]);
        } finally {
            setIsLoading(false);
        }
    }, [companyId, workspaceId, projectId, pagination.pageSize, pagination.pageNumber, filters, showToast]);

    // Side effects khoi tao va tai du lieu (co debounce)
    useEffect(() => {
        fetchMetadata();
    }, [fetchMetadata]);

    useEffect(() => {
        const timer = setTimeout(() => fetchArchivedTasks(), 300);
        return () => clearTimeout(timer);
    }, [fetchArchivedTasks]);

    // ---------------------------------------------------------------------------
    // 7. EVENT HANDLERS (Business Logic)
    // ---------------------------------------------------------------------------

    const onFilterUpdate = (key: keyof ArchivedTaskParams, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPagination((prev) => ({ ...prev, pageNumber: 0 }));
    };

    const onClearFilters = () => {
        setFilters({});
        setPagination((prev) => ({ ...prev, pageNumber: 0 }));
    };

    const onPageSwitch = (newPage: number) => {
        setPagination((prev) => ({ ...prev, pageNumber: newPage }));
    };

    /**
     * Kich hoat quy trinh khoi phuc tac vu
     */
    const initiateRestore = (task: TaskResponse) => {
        setSelectedTask({ id: task.id, title: task.title });
        setIsConfirmModalOpen(true);
    };

    /**
     * Thuc thi goi API khoi phuc va cap nhat giao dien
     */
    const executeTaskRestoration = async () => {
        if (!selectedTask) return;
        setIsRestoring(true);
        try {
            await restoreTask(selectedTask.id);
            showToast("Task restored to active board", "success");

            // Cap nhat local state de xoa item khoi danh sach ngay lap tuc
            setTasks((prev) => prev.filter((t) => t.id !== selectedTask.id));
            setPagination((prev) => ({ ...prev, totalElements: prev.totalElements - 1 }));
            setIsConfirmModalOpen(false);
        } catch (error: any) {
            const message = error.response?.data?.message || "Restore execution failed";
            showToast(message, "error");
        } finally {
            setIsRestoring(false);
            setSelectedTask(null);
        }
    };

    // ---------------------------------------------------------------------------
    // 8. RENDER HELPERS
    // ---------------------------------------------------------------------------

    const renderTypeBadge = (type: string) => {
        const configs: any = {
            BUG: { icon: Bug, color: "bg-red-50 text-red-700 border-red-100", label: "Bug" },
            STORY: { icon: Bookmark, color: "bg-emerald-50 text-emerald-700 border-emerald-100", label: "Story" },
            TASK: { icon: CheckCircle2, color: "bg-blue-50 text-blue-700 border-blue-100", label: "Task" }
        };
        const config = configs[type] || configs.TASK;
        return (
            <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border shadow-sm", config.color)}>
                <config.icon className="w-3 h-3 stroke-[2.5]" /> {config.label}
            </div>
        );
    };

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case "URGENT": return "bg-[#FFEBE6] text-[#BF2600] border-[#FFBDAD]";
            case "HIGH": return "bg-[#FFF0B3] text-[#FF8B00] border-[#FFE380]";
            case "MEDIUM": return "bg-[#DEEBFF] text-[#0052CC] border-[#B3D4FF]";
            default: return "bg-[#F4F5F7] text-[#42526E] border-[#DFE1E6]";
        }
    };

    // ---------------------------------------------------------------------------
    // 9. RENDER LOGIC
    // ---------------------------------------------------------------------------

    if (!projectId) return null;

    return (
        <div className="p-6 sm:p-10 min-h-screen bg-[#F4F5F7] font-sans text-[#172B4D]">
            
            {/* HEADER SECTION */}
            <header className="mb-10 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="flex items-center gap-5">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-[#DFE1E6]">
                        <Archive className="w-7 h-7 text-[#FF8B00] stroke-[2.5]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-[#172B4D] tracking-tight uppercase">Archived Items</h1>
                        <p className="text-[14px] text-[#6B778C] font-medium mt-1">Audit and restore legacy tasks back to the active project stream.</p>
                    </div>
                </div>
            </header>

            <ArchivedFilterBar
                filters={filters}
                onFilterChange={onFilterUpdate}
                onClear={onClearFilters}
                members={members}
            />

            {/* MAIN DATA TABLE */}
            <div className="bg-white border border-[#DFE1E6] rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[550px] animate-in fade-in duration-700">
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-10 h-10 text-[#0052CC] animate-spin opacity-60" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#6B778C]">Syncing Archives...</span>
                    </div>
                ) : tasks.length > 0 ? (
                    <>
                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-left text-[13px]">
                                <thead className="bg-[#FAFBFC] border-b border-[#DFE1E6]">
                                    <tr className="h-12">
                                        <th className="px-6 font-black text-[#6B778C] uppercase text-[10px] tracking-[0.15em] text-center w-[60px]">#</th>
                                        <th className="px-6 font-black text-[#6B778C] uppercase text-[10px] tracking-[0.15em] w-[140px]">Key</th>
                                        <th className="px-6 font-black text-[#6B778C] uppercase text-[10px] tracking-[0.15em]">Issue Summary</th>
                                        <th className="px-6 font-black text-[#6B778C] uppercase text-[10px] tracking-[0.15em] w-[200px]">Owner</th>
                                        <th className="px-6 font-black text-[#6B778C] uppercase text-[10px] tracking-[0.15em] w-[150px]">Legacy Status</th>
                                        <th className="px-6 font-black text-[#6B778C] uppercase text-[10px] tracking-[0.15em] w-[120px]">Category</th>
                                        <th className="px-6 font-black text-[#6B778C] uppercase text-[10px] tracking-[0.15em] w-[120px]">Priority</th>
                                        <th className="px-6 font-black text-[#6B778C] uppercase text-[10px] tracking-[0.15em] text-right w-[120px]">Operations</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F4F5F7]">
                                    {tasks.map((task, index) => (
                                        <tr key={task.id} className="hover:bg-[#F4F5F7]/50 transition-colors group">
                                            <td className="px-6 py-4 text-center text-[#6B778C] font-bold text-[11px]">
                                                {pagination.pageNumber * pagination.pageSize + index + 1}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono font-black text-[#0052CC] text-[11px] uppercase">
                                                    {task.taskCode}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="font-bold text-[#172B4D] line-clamp-1 group-hover:text-[#0052CC] transition-colors" title={task.title}>
                                                        {task.title}
                                                    </span>
                                                    {task.epic && (
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.epic.color }} />
                                                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70" style={{ color: task.epic.color }}>
                                                                {task.epic.name}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {task.assignee ? (
                                                    <div className="flex items-center gap-3">
                                                        <img src={task.assignee.avatarUrl} alt="" className="w-6 h-6 rounded-full border border-[#DFE1E6] shadow-sm object-cover" />
                                                        <span className="text-[#42526E] font-semibold truncate max-w-[140px]">{task.assignee.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[#6B778C] italic opacity-60">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span 
                                                    className="px-2.5 py-1 rounded-[3px] text-[10px] font-black uppercase tracking-wider border inline-block text-center min-w-[90px] shadow-sm"
                                                    style={{ backgroundColor: task.status.color + "15", color: task.status.color, borderColor: task.status.color + "30" }}
                                                >
                                                    {task.status.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{renderTypeBadge(task.taskType)}</td>
                                            <td className="px-6 py-4">
                                                <span className={cn("text-[10px] font-black px-2.5 py-1 rounded-[3px] border uppercase shadow-sm", getPriorityStyles(task.priority))}>
                                                    {task.priority}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => initiateRestore(task)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[#0052CC] hover:bg-[#DEEBFF] rounded-lg font-black text-[11px] uppercase tracking-widest transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <RefreshCcw className="w-3.5 h-3.5 stroke-[2.5]" /> Restore
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION FOOTER */}
                        <footer className="flex items-center justify-between px-8 py-5 border-t border-[#DFE1E6] bg-[#FAFBFC]">
                            <p className="text-[11px] font-black text-[#6B778C] uppercase tracking-widest">
                                Page <span className="text-[#172B4D]">{pagination.pageNumber + 1}</span> of <span className="text-[#172B4D]">{pagination.totalPages || 1}</span> 
                                <span className="mx-3 opacity-30">|</span> 
                                Total <span className="text-[#0052CC]">{pagination.totalElements}</span> items
                            </p>

                            <div className="flex gap-1.5">
                                <PaginationBtn onClick={() => onPageSwitch(0)} disabled={pagination.first} icon={ChevronsLeft} title="First Page" />
                                <PaginationBtn onClick={() => onPageSwitch(pagination.pageNumber - 1)} disabled={pagination.first} icon={ChevronLeft} title="Previous" />
                                <div className="px-4 flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-[#0052CC]">Navigate</div>
                                <PaginationBtn onClick={() => onPageSwitch(pagination.pageNumber + 1)} disabled={pagination.last} icon={ChevronRight} title="Next" />
                                <PaginationBtn onClick={() => onPageSwitch(pagination.totalPages - 1)} disabled={pagination.last} icon={ChevronsRight} title="Last Page" />
                            </div>
                        </footer>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                        <div className="p-6 bg-[#F4F5F7] rounded-full mb-5 border border-[#DFE1E6] shadow-inner">
                            <Archive className="w-10 h-10 text-[#B3BAC5] stroke-[1.5]" />
                        </div>
                        <h3 className="text-lg font-black text-[#172B4D] uppercase tracking-tight">Project Archives Empty</h3>
                        <p className="text-[#6B778C] font-medium text-[14px] mt-2 max-w-sm leading-relaxed">
                            No tasks have been decommissioned yet. Archived records will be centralized here for future restoration.
                        </p>
                    </div>
                )}
            </div>

            {/* CONFIRMATION OVERLAY */}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={executeTaskRestoration}
                isLoading={isRestoring}
                title="Restore Task to Active Board"
                description={`Are you sure you want to reactivate "${selectedTask?.title}"? It will be returned to the primary workspace with its historical attributes.`}
                confirmText="Execute Restore"
                modalVariant="info"
            />
            
            <Chatbot />
        </div>
    );
}

// =============================================================================
// SUB-COMPONENTS (Refactored for Layout Consistency)
// =============================================================================

const PaginationBtn = ({ onClick, disabled, icon: Icon, title }: any) => (
    <Button
        onClick={onClick}
        disabled={disabled}
        variant="outline"
        size="icon"
        className="h-9 w-9 bg-white border-[#DFE1E6] text-[#42526E] hover:bg-[#F4F5F7] hover:text-[#0052CC] shadow-sm transition-all active:scale-90"
        title={title}
    >
        <Icon className="w-4 h-4 stroke-[2.5]" />
    </Button>
);