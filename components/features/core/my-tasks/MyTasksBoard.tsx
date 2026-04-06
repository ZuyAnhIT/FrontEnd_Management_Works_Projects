"use client";

// =============================================================================
// 1. IMPORTS
// =============================================================================

import React, { useEffect, useState, useCallback } from "react";
import { Loader2, LayoutGrid, CheckCircle2 } from "lucide-react";

// Services & Context
import { getMyTaskBoard, MyTaskBoardData, MyTaskSummary } from "@/services/apiDashboard";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";

// Components
import { TaskCardSmall } from "./TaskCardSmall";
import TaskDetailModalFloating from "@/components/features/core/task/TaskDetailModalFloating";

// =============================================================================
// 2. CONFIGURATION
// =============================================================================

const COLUMNS: { key: keyof MyTaskBoardData; label: string; color: string }[] = [
    { key: "overdue", label: "Overdue", color: "#FF5630" },     // Atlassian Red
    { key: "today", label: "Due Today", color: "#FF8B00" },      // Atlassian Orange
    { key: "upcoming", label: "Upcoming", color: "#0052CC" },    // Atlassian Blue
    { key: "other", label: "Later", color: "#403294" },          // Atlassian Purple
    { key: "noDueDate", label: "Unscheduled", color: "#6B778C" },// Atlassian Gray
];

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function MyTasksBoard() {
    
    // ---------------------------------------------------------------------------
    // 4. HOOKS & STATE
    // ---------------------------------------------------------------------------
    
    const { showToast } = useToast();
    const { activeCompany } = useAuth();
    const companyId = activeCompany?.companyId;

    const [isLoading, setIsLoading] = useState(true);
    const [boardData, setBoardData] = useState<MyTaskBoardData | null>(null);

    // Trang thai quan ly Modal chi tiet
    const [selectedTask, setSelectedTask] = useState<MyTaskSummary | null>(null);

    // ---------------------------------------------------------------------------
    // 5. DATA FETCHING
    // ---------------------------------------------------------------------------

    const fetchBoardContent = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getMyTaskBoard();
            setBoardData(data);
        } catch (error: any) {
            showToast(error.message || "Failed to load personal task board", "error");
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchBoardContent();
    }, [fetchBoardContent]);

    // ---------------------------------------------------------------------------
    // 6. RENDER LOGIC
    // ---------------------------------------------------------------------------

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#F4F5F7] gap-4">
                <Loader2 className="w-10 h-10 text-[#0052CC] animate-spin opacity-80" />
                <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#6B778C]">
                    Gathering your assignments...
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#F4F5F7] font-sans text-[#172B4D]">
            
            {/* HEADER SECTION */}
            <header className="px-8 py-5 bg-white border-b border-[#DFE1E6] shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-[#DEEBFF] rounded-xl border border-[#B3D4FF] shadow-sm">
                        <LayoutGrid className="w-6 h-6 text-[#0052CC] stroke-[2.5]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-[#172B4D] uppercase tracking-tight">My Work</h1>
                        <p className="text-[14px] text-[#42526E] font-medium mt-0.5">Your cross-project assignments organized by deadline.</p>
                    </div>
                </div>
            </header>

            {/* KANBAN BOARD AREA */}
            <main className="flex-1 overflow-x-auto p-8 custom-scrollbar bg-[#F4F5F7]">
                <div className="flex gap-6 h-full min-w-max">
                    {COLUMNS.map((col) => {
                        const tasks = boardData ? boardData[col.key] : [];
                        return (
                            <div key={col.key} className="w-[340px] flex flex-col h-full group bg-[#EBECF0]/50 rounded-2xl p-3 border border-transparent hover:border-[#DFE1E6] transition-colors">
                                
                                {/* Column Header */}
                                <div className="flex items-center justify-between mb-4 px-2 pt-1">
                                    <div className="flex items-center gap-2.5">
                                        <h3 className="text-[12px] font-black uppercase tracking-[0.15em] text-[#42526E]">
                                            {col.label}
                                        </h3>
                                        <span className="bg-[#DFE1E6] text-[#172B4D] text-[10px] font-black px-2 py-0.5 rounded-full">
                                            {tasks.length}
                                        </span>
                                    </div>
                                    <div 
                                        className="h-1.5 flex-1 ml-4 rounded-full opacity-20 group-hover:opacity-100 transition-opacity" 
                                        style={{ backgroundColor: col.color }}
                                    />
                                </div>

                                {/* Task List Scroll Area */}
                                <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar pb-10">
                                    {tasks.length > 0 ? (
                                        tasks.map((task) => (
                                            <TaskCardSmall 
                                                key={task.taskId} 
                                                task={task} 
                                                variant={col.key}
                                                onTaskClick={setSelectedTask}
                                            />
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-[#6B778C] opacity-60">
                                            <CheckCircle2 className="w-10 h-10 mb-3 stroke-[1.5]" />
                                            <p className="text-[11px] font-black uppercase tracking-widest">Nothing here</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* TASK DETAIL MODAL */}
            {selectedTask && companyId && (
                <TaskDetailModalFloating
                    taskId={selectedTask.taskId}
                    isOpen={true}
                    onClose={() => setSelectedTask(null)}
                    // Vi Task nam o nhieu du an khac nhau, ta phai truyen dong cac ID nay vao
                    companyId={companyId}
                    workspaceId={selectedTask.workspaceId}
                    projectId={selectedTask.projectId}
                    // Vi o man hinh tong quan chung ta khong co san danh sach members/statuses cua du an do,
                    // Component TaskDetailModalFloating phai tu dong goi API de lay danh sach nay (Ban can kiem tra lai xem modal da ho tro chua)
                    members={[]} 
                    statuses={[]} 
                    sprints={[]} 
                    epics={[]}
                    readOnly={false} // Hoac xac dinh quyen dua tren role neu can
                    onUpdate={fetchBoardContent} // Tai lai board neu user thay doi due date / status trong modal
                />
            )}
        </div>
    );
}