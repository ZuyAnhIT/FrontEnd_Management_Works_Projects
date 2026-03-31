"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Components)
// =============================================================================

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
    pointerWithin,
    rectIntersection,
    defaultDropAnimationSideEffects,
    DropAnimation,
    CollisionDetection,
} from "@dnd-kit/core";
import {
    SortableContext,
    horizontalListSortingStrategy,
    arrayMove,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Loader2, AlertCircle } from "lucide-react";

// Services & Hooks
import {
    getProjectBoardData,
    getProjectStatuses,
    BoardColumnResponse,
    RawBoardColumn,
    RawStatusColumn,
    moveTaskToStatus,
    BoardFilterParams,
    reorderProjectStatuses,
} from "@/services/apiBoard";
import { getProjectMembers, ProjectMember, TaskSummary } from "@/services/apiProject";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { useProjectRole } from "@/hooks/useProjectRole";

// Components
import BoardHeader from "@/components/features/core/board/BoardHeader";
import BoardColumn from "@/components/features/core/board/BoardColumn";
import CreateColumnButton from "@/components/features/core/board/CreateColumnButton";
import BoardTaskCard from "@/components/features/core/board/BoardTaskCard";
import TaskDetailModalFloating from "@/components/features/core/task/TaskDetailModalFloating";
import TaskDetailPanel from "@/components/features/core/task/TaskDetailPanel";
import { Chatbot } from "@/components/chatbot/chatbot";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. UTILS & HELPERS
// =============================================================================

/**
 * Chuan hoa du lieu tu API ve cau truc Columns phu hop voi UI Board
 */
const normalizeBoardData = (
    boardData: RawBoardColumn[], 
    statusList: RawStatusColumn[]
): BoardColumnResponse[] => {
    const columnMap = new Map<number, BoardColumnResponse>();
    
    // Khoi tao cac cot tu danh sach trang thai (Statuses)
    if (Array.isArray(statusList)) {
        statusList.forEach((st) => {
            columnMap.set(st.id, { 
                id: st.id, 
                name: st.name, 
                color: st.color, 
                position: st.sortOrder, 
                isCompletedStatus: st.isCompletedStatus, 
                tasks: [], 
            });
        });
    }
    
    // Do du lieu nhiem vu vao cac cot tuong ung
    if (Array.isArray(boardData)) {
        boardData.forEach((bd) => {
            const existingCol = columnMap.get(bd.statusId);
            if (existingCol) { 
                existingCol.tasks = bd.tasks || []; 
            } else {
                columnMap.set(bd.statusId, { 
                    id: bd.statusId, 
                    name: bd.statusName, 
                    color: bd.color || "#172B4D", 
                    position: bd.order || 0, 
                    isCompletedStatus: bd.isCompleted || false, 
                    tasks: bd.tasks || [], 
                });
            }
        });
    }
    
    return Array.from(columnMap.values()).sort((a, b) => a.position - b.position);
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function BoardPage() {
    
    // ---------------------------------------------------------------------------
    // 4. HOOKS, CONTEXT & PARAMS
    // ---------------------------------------------------------------------------
    
    const params = useParams();
    const { showToast } = useToast();
    const { activeCompany, isLoading: isAuthLoading } = useAuth();
    
    const projectId = Number(params.projectId);
    const workspaceId = Number(params.workspaceId);
    const companyId = Number(params.companyId) || activeCompany?.companyId;

    // Phan quyen nguoi dung (Guest se bi han che tuong tac)
    const { isGuest } = useProjectRole(projectId);

    // ---------------------------------------------------------------------------
    // 5. STATE MANAGEMENT
    // ---------------------------------------------------------------------------

    // Data States
    const [columns, setColumns] = useState<BoardColumnResponse[]>([]);
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // DND UI States
    const [activeColumn, setActiveColumn] = useState<BoardColumnResponse | null>(null);
    const [activeTask, setActiveTask] = useState<TaskSummary | null>(null);

    // Task Detail States
    const [viewMode, setViewMode] = useState<'panel' | 'floating'>('panel'); 
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Filter States
    const [filters, setFilters] = useState<BoardFilterParams>({
        keyword: "",
        sprintId: null,
        assigneeId: undefined,
        priority: undefined,
        taskType: undefined,
    });

    // ---------------------------------------------------------------------------
    // 6. DND SENSORS CONFIG
    // ---------------------------------------------------------------------------
    
    // Vo hieu hoa cam bien keo tha neu la Guest
    const sensors = useSensors(
        useSensor(PointerSensor, { 
            activationConstraint: { distance: 5 }, 
            disabled: isGuest 
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
            disabled: isGuest 
        })
    );

    // ---------------------------------------------------------------------------
    // 7. DATA FETCHING (Handlers)
    // ---------------------------------------------------------------------------

    /**
     * Tai toan bo du lieu bang, trang thai va thanh vien du an
     */
    const fetchBoardContent = useCallback(async () => {
        if (isAuthLoading || !companyId || !workspaceId || !projectId) return;
        
        setIsLoading(true); 
        setFetchError(null);
        
        try {
            const [rawBoardData, rawStatusList, membersRes] = await Promise.all([
                getProjectBoardData(companyId, workspaceId, projectId, filters),
                getProjectStatuses(projectId),
                getProjectMembers(companyId, workspaceId, projectId, { size: 100 }),
            ]);
            
            setMembers(membersRes.content || []);
            const normalized = normalizeBoardData(rawBoardData, rawStatusList);
            setColumns(normalized);
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || "Failed to synchronize board data";
            setFetchError(message); 
            showToast(message, "error");
        } finally { 
            setIsLoading(false); 
        }
    }, [companyId, workspaceId, projectId, filters, showToast, isAuthLoading]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isAuthLoading && companyId) fetchBoardContent();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchBoardContent, isAuthLoading, companyId]);

    // ---------------------------------------------------------------------------
    // 8. EVENT HANDLERS (Business Logic)
    // ---------------------------------------------------------------------------

    const handleColumnCreation = (newStatusData: any) => {
        const newCol: BoardColumnResponse = { 
            id: newStatusData.id, 
            name: newStatusData.name, 
            color: newStatusData.color, 
            position: newStatusData.sortOrder, 
            isCompletedStatus: newStatusData.isCompletedStatus, 
            tasks: [], 
        };
        setColumns((prev) => [...prev, newCol]); 
        showToast("Column initialized successfully", "success");
    };

    const handleColumnRemoval = (columnId: string) => { 
        setColumns((prev) => prev.filter((col) => String(col.id) !== columnId)); 
        showToast("Column removed from board", "success");
    };
    
    const handleTaskSelection = (task: TaskSummary) => {
        setSelectedTaskId(task.id);
        setIsDetailOpen(true);
    };

    const handleGlobalUpdate = () => {
        fetchBoardContent();
    };

    // ---------------------------------------------------------------------------
    // 9. DND INTERACTION HANDLERS
    // ---------------------------------------------------------------------------

    const detectCollisions: CollisionDetection = useCallback((args) => {
        const pointerCollisions = pointerWithin(args);
        return pointerCollisions.length > 0 ? pointerCollisions : rectIntersection(args);
    }, []);

    const handleDragStart = (event: DragStartEvent) => {
        if (isGuest) return; 
        const { type, column, task } = event.active.data.current || {};
        if (type === "Column") setActiveColumn(column);
        if (type === "Task") setActiveTask(task);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        if (isGuest) return;
        
        const { active, over } = event;
        setActiveColumn(null); 
        setActiveTask(null);
        if (!over) return;

        // XU LY 1: SAP XEP LAI COT (Column Reorder)
        if (active.data.current?.type === "Column") {
            if (active.id === over.id) return;

            const oldIndex = columns.findIndex((col) => col.id.toString() === active.id);
            const newIndex = columns.findIndex((col) => col.id.toString() === over.id);

            const reorderedColumns = arrayMove(columns, oldIndex, newIndex);
            setColumns(reorderedColumns);

            try {
                const orderedStatusIds = reorderedColumns.map(col => Number(col.id));
                await reorderProjectStatuses(projectId, orderedStatusIds);
                showToast("Layout order synchronized", "success");
            } catch (error: any) {
                showToast(error.message || "Failed to save layout order", "error");
                fetchBoardContent(); // Rollback
            }
            return;
        }

        // XU LY 2: DI CHUYEN/SAP XEP NHIEM VU (Task Movement)
        if (active.data.current?.type === "Task") {
            const activeId = active.id;
            const overId = over.id;
            
            const sourceCol = columns.find((col) => col.tasks.some((t) => t.id.toString() === activeId));
            let destCol = columns.find((col) => col.id.toString() === overId);
            
            if (!destCol) {
                destCol = columns.find((col) => col.tasks.some((t) => t.id.toString() === overId));
            }
            
            if (!sourceCol || !destCol) return;
            if (sourceCol.id === destCol.id && activeId === overId) return;

            // CAP NHAT LAC QUAN (Optimistic Update)
            const newColumns = JSON.parse(JSON.stringify(columns));
            const sIdx = columns.findIndex((c) => c.id === sourceCol.id);
            const dIdx = columns.findIndex((c) => c.id === destCol.id);
            
            const oldIdx = newColumns[sIdx].tasks.findIndex((t: TaskSummary) => t.id.toString() === activeId);
            let newIdx;

            if (over.data.current?.type === "Column") { 
                newIdx = newColumns[dIdx].tasks.length; 
            } else {
                const overTIdx = newColumns[dIdx].tasks.findIndex((t: TaskSummary) => t.id.toString() === overId);
                const isBelow = over && active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height / 2;
                newIdx = overTIdx >= 0 ? overTIdx + (isBelow ? 1 : 0) : newColumns[dIdx].tasks.length;
            }

            const [movedTask] = newColumns[sIdx].tasks.splice(oldIdx, 1);
            movedTask.statusId = newColumns[dIdx].id;
            newColumns[dIdx].tasks.splice(newIdx, 0, movedTask);
            setColumns(newColumns);

            try {
                await moveTaskToStatus(Number(activeId), { 
                    newStatusId: Number(newColumns[dIdx].id), 
                    newSortOrder: newIdx, 
                });
                showToast("Task status updated", "success");
            } catch (error: any) {
                showToast(error.message || "Failed to persist task movement", "error"); 
                fetchBoardContent(); // Rollback
            }
        }
    };

    // ---------------------------------------------------------------------------
    // 10. RENDER LOGIC
    // ---------------------------------------------------------------------------

    const columnIds = useMemo(() => columns.map((col) => col.id.toString()), [columns]);
    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.5" } } }),
    };

    if (isAuthLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#F4F5F7]">
                <Loader2 className="w-10 h-10 animate-spin text-[#0052CC] opacity-80" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col bg-white overflow-hidden font-sans text-[#172B4D]">
            
            {/* BOARD HEADER (Filters & Summary) */}
            <BoardHeader 
                filters={filters} 
                setFilters={setFilters} 
                members={members} 
                totalTasks={columns.reduce((acc, col) => acc + (col.tasks?.length || 0), 0)} 
            />

            {/* BOARD INTERACTIVE AREA */}
            <main className="flex-1 overflow-x-auto overflow-y-hidden bg-white custom-scrollbar">
                {isLoading && columns.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-[#0052CC] opacity-40" />
                        <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#6B778C]">Synchronizing Board...</p>
                    </div>
                ) : fetchError ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4 text-[#FF5630]">
                        <AlertCircle className="w-12 h-12 opacity-50" />
                        <p className="font-bold">{fetchError}</p>
                        <button onClick={fetchBoardContent} className="px-6 py-2 bg-white border border-[#DFE1E6] rounded-lg font-black text-[12px] uppercase tracking-widest text-[#42526E] hover:bg-[#F4F5F7] transition-all">
                            Retry Connection
                        </button>
                    </div>
                ) : (
                    <DndContext 
                        sensors={sensors} 
                        collisionDetection={detectCollisions} 
                        onDragStart={handleDragStart} 
                        onDragEnd={handleDragEnd}
                    >
                        <div className="h-full flex px-8 pt-8 pb-4 gap-5 items-start min-w-max animate-in fade-in duration-500">
                            <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                                {columns.map((col, index) => (
                                    <BoardColumn 
                                        key={col.id} 
                                        column={col} 
                                        index={index} 
                                        projectId={projectId} 
                                        members={members} 
                                        onDeleteColumn={handleColumnRemoval} 
                                        onTaskClick={handleTaskSelection}
                                        isReadOnly={isGuest} 
                                    />
                                ))}
                            </SortableContext>
                            
                            {!isGuest && (
                                <CreateColumnButton projectId={projectId} onSuccess={handleColumnCreation} />
                            )}
                        </div>
                        
                        {/* DRAG OVERLAY (Visual feedback during drag) */}
                        <DragOverlay dropAnimation={dropAnimation}>
                            {activeColumn && (
                                <div className="h-full opacity-90 scale-[1.02] shadow-2xl rounded-2xl bg-transparent">
                                    <div className="h-full bg-[#F4F5F7] rounded-2xl border-2 border-[#0052CC]">
                                        <BoardColumn column={activeColumn} index={0} projectId={projectId} members={members} /> 
                                    </div>
                                </div>
                            )}
                            {activeTask && (
                                <BoardTaskCard task={activeTask} index={0} users={members} /> 
                            )}
                        </DragOverlay>
                    </DndContext>
                )}
            </main>

            {/* DYNAMIC DETAIL MODALS */}
            {isDetailOpen && selectedTaskId && (
                viewMode === 'panel' ? (
                    <TaskDetailPanel
                        taskId={selectedTaskId}
                        onClose={() => setIsDetailOpen(false)}
                        onSwitchToFloating={() => setViewMode('floating')} 
                        onUpdate={handleGlobalUpdate} 
                        members={members}
                        statuses={columns.map(c => ({ id: c.id, name: c.name, color: c.color }))} 
                        sprints={[]} epics={[]}
                        companyId={companyId!} workspaceId={workspaceId} projectId={projectId}
                        readOnly={isGuest} 
                    />
                ) : (
                    <TaskDetailModalFloating
                        taskId={selectedTaskId}
                        isOpen={true}
                        onClose={() => setIsDetailOpen(false)}
                        onSwitchToPanel={() => setViewMode('panel')} 
                        onUpdate={handleGlobalUpdate}
                        members={members}
                        statuses={columns.map(c => ({ id: c.id, name: c.name, color: c.color }))}
                        sprints={[]} epics={[]}
                        companyId={companyId!} workspaceId={workspaceId} projectId={projectId}
                        readOnly={isGuest}
                    />
                )
            )}

            <Chatbot />

            {/* GLOBAL SCROLLBAR STYLES */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #DFE1E6; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #B3BAC5; }
            `}</style>
        </div>
    );
}